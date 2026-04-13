import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const STAGE_MAP = {
  "Not Started": 0,
  Blocked: 0,
  "1 - Demo": 1,
  "2 - Training": 2,
  "3 - Valpay Setup": 3,
  "4 - Staging QA": 4,
  "5 - Pilot": 5,
  "6 - Graduated Rollout": 6,
  "7 - Live": 7,
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function GET() {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_DATABASE_ID;

  if (!token || !dbId) {
    return NextResponse.json({ error: "Notion not configured" }, { status: 503 });
  }

  try {
    const notion = new Client({ auth: token });
    const response = await notion.databases.query({
      database_id: dbId,
      sorts: [{ property: "Order", direction: "ascending" }],
    });

    const parishes = response.results.map((page) => {
      const p = page.properties;
      const completedStages =
        STAGE_MAP[p["Current Stage"]?.select?.name] || 0;
      return {
        wk: p["Week"]?.number || 0,
        name: p["Parish"]?.title?.[0]?.plain_text || "",
        vol: p["Est. Daily Filings"]?.number || 0,
        version:
          p["Version"]?.select?.name === "Standalone"
            ? "Standalone"
            : "Verdict",
        onboard: formatDate(p["Onboarding Date"]?.date?.start),
        churn: formatDate(p["Tybera Churn Date"]?.date?.start),
        risk: (p["Risk Level"]?.select?.name || "low").toLowerCase(),
        champion:
          p["Customer Champion"]?.rich_text?.[0]?.plain_text || "",
        currentStage:
          p["Current Stage"]?.select?.name || "Not Started",
        completedStages,
        gates: {
          demo: p["Demo Complete"]?.checkbox || false,
          training: p["Training Complete"]?.checkbox || false,
          valpay: p["Valpay Connected"]?.checkbox || false,
          staging: p["Staging QA Passed"]?.checkbox || false,
          pilot: p["Pilot Approved"]?.checkbox || false,
        },
        rolloutStep: p["Rollout Step"]?.select?.name || null,
        stagingDocs: p["Staging Docs Processed"]?.number || 0,
        pilotFilings: p["Pilot Filings Completed"]?.number || 0,
        blocker: p["Blocker"]?.rich_text?.[0]?.plain_text || "",
      };
    });

    const totalFilings = parishes.reduce((s, p) => s + p.vol, 0);

    return NextResponse.json({
      summary: {
        parishes: parishes.length,
        dailyFilings: totalFilings,
        targetCompletion: "Jun 1",
        currentBlocker: "Verdict API",
      },
      parishes,
    });
  } catch (err) {
    console.error("Notion fetch failed:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch from Notion" },
      { status: 500 }
    );
  }
}
