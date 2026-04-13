export function processQuery(query, context) {
  const { parishes, mvpCategories, stories } = context;
  const q = query.toLowerCase().trim();

  const getStoryCount = (catKey, idx) => {
    const list = stories[`${catKey}-${idx}`];
    if (!list) return 0;
    if (typeof list === "number") return list;
    return list.filter((t) => t.status === "done").length;
  };

  const catStats = mvpCategories.map((c) => ({
    ...c,
    totalStories: c.features.reduce(
      (s, _, i) => s + getStoryCount(c.key, i),
      0
    ),
    featureCount: c.features.length,
  }));

  const totalFeatures = catStats.reduce((s, c) => s + c.featureCount, 0);
  const totalStories = catStats.reduce((s, c) => s + c.totalStories, 0);
  const blockedParishes = parishes.filter((p) => p.currentStage === "Blocked");
  const highRisk = parishes.filter((p) => p.risk === "high");
  const totalVolume = parishes.reduce((s, p) => s + p.vol, 0);

  // Help
  if (
    q === "help" ||
    q === "?" ||
    q.includes("what can you") ||
    q.includes("what do you")
  ) {
    return {
      text:
        "I can answer questions about your rollout:\n\n" +
        "Try asking:\n" +
        '  "summary" -- overall stats\n' +
        '  "blocked" -- blocked parishes\n' +
        '  "high risk" -- risky parishes\n' +
        '  "week 3" -- parishes in week 3\n' +
        '  "payments" -- category details\n' +
        '  "washington" -- parish details\n' +
        '  "stories" -- completion progress\n' +
        '  "compare" -- category comparison\n' +
        '  "volume" -- filing volume ranking',
      suggestions: ["Summary", "Blocked", "Compare categories"],
    };
  }

  // Summary / overview
  if (
    q.includes("summary") ||
    q.includes("overview") ||
    q.includes("how are we") ||
    q.includes("status") ||
    q.includes("dashboard")
  ) {
    const pct =
      totalFeatures > 0
        ? Math.round((totalStories / totalFeatures) * 100)
        : 0;
    return {
      text:
        "Dashboard Summary\n\n" +
        "Rollout\n" +
        `  ${parishes.length} parishes, ${totalVolume} daily filings\n` +
        `  ${blockedParishes.length} blocked, ${highRisk.length} high-risk\n\n` +
        "MVP Progress\n" +
        `  ${totalStories} of ${totalFeatures} stories done (${pct}%)\n` +
        `  ${catStats.filter((c) => c.totalStories > 0).length} of ${catStats.length} categories started\n\n` +
        "Blocker: Verdict CMS API",
      suggestions: ["Blocked parishes", "Compare categories", "Leading category"],
    };
  }

  // Blocked
  if (q.includes("block")) {
    if (blockedParishes.length === 0) {
      return {
        text: "No parishes are currently blocked.",
        suggestions: ["Summary", "High risk"],
      };
    }
    const list = blockedParishes
      .map((p) => `  ${p.name} (Wk ${p.wk}, ${p.vol}/d) -- ${p.blocker}`)
      .join("\n");
    return {
      text: `${blockedParishes.length} parishes blocked:\n\n${list}\n\nAll blocked by: ${blockedParishes[0].blocker}`,
      suggestions: ["High risk", "Summary", "Week 3"],
    };
  }

  // High risk
  if (q.includes("high risk") || q.includes("risky") || q.includes("risk")) {
    if (highRisk.length === 0) {
      return {
        text: "No high-risk parishes currently.",
        suggestions: ["Summary", "Blocked"],
      };
    }
    const list = highRisk
      .map(
        (p) =>
          `  ${p.name} (Wk ${p.wk}, ${p.vol}/d)${p.blocker ? ` -- ${p.blocker}` : ""}`
      )
      .join("\n");
    return {
      text: `${highRisk.length} high-risk parishes:\n\n${list}`,
      suggestions: ["Blocked", "Summary", "Volume"],
    };
  }

  // Week filter
  const weekMatch = q.match(/week\s*(\d)/);
  if (weekMatch) {
    const wk = parseInt(weekMatch[1]);
    const weekParishes = parishes.filter((p) => p.wk === wk);
    if (weekParishes.length === 0) {
      return {
        text: `No parishes scheduled for week ${wk}.`,
        suggestions: ["Summary"],
      };
    }
    const list = weekParishes
      .map(
        (p) =>
          `  ${p.name} -- ${p.version}, ${p.vol}/d, ${p.currentStage}${p.blocker ? ` (${p.blocker})` : ""}`
      )
      .join("\n");
    return {
      text: `Week ${wk} parishes (${weekParishes.length}):\n\n${list}`,
      suggestions: [
        `Week ${Math.min(wk + 1, 6)}`,
        "Summary",
        "Blocked",
      ],
    };
  }

  // Stories / progress / completion
  if (
    q.includes("stories") ||
    q.includes("progress") ||
    q.includes("completion") ||
    q.includes("done")
  ) {
    const pct =
      totalFeatures > 0
        ? Math.round((totalStories / totalFeatures) * 100)
        : 0;
    const catBreakdown = catStats
      .map((c) => `  ${c.name}: ${c.totalStories}/${c.featureCount} stories`)
      .join("\n");
    return {
      text: `MVP Story Progress: ${totalStories}/${totalFeatures} (${pct}%)\n\n${catBreakdown}`,
      suggestions: ["Compare categories", "Leading category", "Summary"],
    };
  }

  // Compare categories
  if (q.includes("compare") || q.includes("comparison") || q.includes("vs")) {
    const sorted = [...catStats].sort(
      (a, b) => b.totalStories - a.totalStories
    );
    const comparison = sorted
      .map((c) => {
        const pct =
          c.featureCount > 0
            ? Math.round((c.totalStories / c.featureCount) * 100)
            : 0;
        const filled = Math.round(pct / 10);
        const bar =
          "\u2588".repeat(filled) + "\u2591".repeat(10 - filled);
        return `  ${bar} ${String(pct).padStart(3)}% ${c.name} (${c.totalStories}/${c.featureCount})`;
      })
      .join("\n");
    return {
      text: `Category Comparison\n\n${comparison}`,
      suggestions: ["Stories progress", "Leading category", "Summary"],
    };
  }

  // Highest / leading progress
  if (
    q.includes("highest") ||
    q.includes("most") ||
    q.includes("best") ||
    q.includes("leading") ||
    q.includes("ahead")
  ) {
    const sorted = [...catStats].sort(
      (a, b) => b.totalStories - a.totalStories
    );
    if (sorted[0].totalStories === 0) {
      return {
        text: "No stories completed yet in any category.",
        suggestions: ["Summary", "Compare categories"],
      };
    }
    const top = sorted[0];
    const pct = Math.round((top.totalStories / top.featureCount) * 100);
    return {
      text: `Leading: ${top.name}\n  ${top.totalStories}/${top.featureCount} stories (${pct}%)`,
      suggestions: ["Compare categories", "Stories progress"],
    };
  }

  // Volume / filings
  if (q.includes("volume") || q.includes("filing")) {
    const sorted = [...parishes].sort((a, b) => b.vol - a.vol);
    const list = sorted
      .slice(0, 5)
      .map((p) => `  ${p.name}: ${p.vol}/day`)
      .join("\n");
    return {
      text: `Total daily filings: ${totalVolume}\n\nTop 5 by volume:\n${list}`,
      suggestions: ["Summary", "High risk"],
    };
  }

  // Category lookup (fuzzy)
  const catMatch = catStats.find(
    (c) => q.includes(c.key) || q.includes(c.name.toLowerCase())
  );
  if (catMatch) {
    const features = catMatch.features
      .map((f, i) => {
        const count = getStoryCount(catMatch.key, i);
        return `  ${count > 0 ? "+" : "-"} ${f.name} (${count} stories)`;
      })
      .join("\n");
    return {
      text: `${catMatch.name}\n  ${catMatch.totalStories}/${catMatch.featureCount} stories\n\n${features}`,
      suggestions: ["Compare categories", "Stories progress", "Summary"],
    };
  }

  // Parish lookup (fuzzy)
  const parishMatch = parishes.find((p) =>
    q.includes(p.name.toLowerCase())
  );
  if (parishMatch) {
    const p = parishMatch;
    return {
      text:
        `${p.name} Parish\n\n` +
        `  Week: ${p.wk}\n` +
        `  Volume: ${p.vol}/day\n` +
        `  Type: ${p.version}\n` +
        `  Stage: ${p.currentStage}\n` +
        `  Risk: ${p.risk}\n` +
        `  Onboard: ${p.onboard}\n` +
        `  Churn: ${p.churn}\n` +
        (p.blocker ? `  Blocker: ${p.blocker}\n` : "") +
        `  Champion: ${p.champion}`,
      suggestions: [`Week ${p.wk}`, "Blocked", "Summary"],
    };
  }

  // Fallback
  return {
    text: `I'm not sure about "${query}". Try "help" to see what I can answer.`,
    suggestions: ["Help", "Summary", "Blocked"],
  };
}
