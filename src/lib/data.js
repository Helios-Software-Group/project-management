// Dummy data matching your Notion Parish Rollout Tracker schema.
// When ready, replace getDummyData() calls with fetchFromNotion() below.

export const STAGES = [
  { key: "demo", label: "Demo", color: "#5B8DEF" },
  { key: "training", label: "Train", color: "#9B7BED" },
  { key: "valpay", label: "Valpay", color: "#E09B4B" },
  { key: "staging", label: "QA", color: "#3DB88C" },
  { key: "pilot", label: "Pilot", color: "#7ECAB0" },
  { key: "graduated", label: "Grad.", color: "#D46B8A" },
  { key: "live", label: "Live", color: "#E07B4B" },
];

export const STAGE_MAP = {
  "Not Started": 0,
  "Blocked": 0,
  "1 - Demo": 1,
  "2 - Training": 2,
  "3 - Valpay Setup": 3,
  "4 - Staging QA": 4,
  "5 - Pilot": 5,
  "6 - Graduated Rollout": 6,
  "7 - Live": 7,
};

export function getDummyData() {
  return {
    summary: {
      parishes: 14,
      dailyFilings: 474,
      targetCompletion: "Jun 1",
      currentBlocker: "Verdict API",
    },
    parishes: [
      { wk: 1, name: "Washington", vol: 28, version: "Standalone", onboard: "Apr 13", churn: "Apr 25", risk: "med", champion: "J. Crain", currentStage: "Not Started", completedStages: 0, gates: { demo: false, training: false, valpay: false, staging: false, pilot: false }, rolloutStep: null, stagingDocs: 0, pilotFilings: 0, blocker: "" },
      { wk: 2, name: "St. Tammany", vol: 175, version: "Standalone", onboard: "Apr 20", churn: "May 2", risk: "high", champion: "J. Brewster", currentStage: "Not Started", completedStages: 0, gates: { demo: false, training: false, valpay: false, staging: false, pilot: false }, rolloutStep: null, stagingDocs: 0, pilotFilings: 0, blocker: "" },
      { wk: 3, name: "St. Mary", vol: 30, version: "Verdict", onboard: "Apr 27", churn: "May 9", risk: "high", champion: "G. Aucoin", currentStage: "Blocked", completedStages: 0, gates: { demo: false, training: false, valpay: false, staging: false, pilot: false }, rolloutStep: null, stagingDocs: 0, pilotFilings: 0, blocker: "Verdict API" },
      { wk: 3, name: "Avoyelles", vol: 24, version: "Verdict", onboard: "Apr 28", churn: "May 10", risk: "high", champion: "L. Blanchard", currentStage: "Blocked", completedStages: 0, gates: { demo: false, training: false, valpay: false, staging: false, pilot: false }, rolloutStep: null, stagingDocs: 0, pilotFilings: 0, blocker: "Verdict API" },
      { wk: 3, name: "St. Martin", vol: 33, version: "Verdict", onboard: "Apr 29", churn: "May 11", risk: "med", champion: "C. Desselle", currentStage: "Blocked", completedStages: 0, gates: { demo: false, training: false, valpay: false, staging: false, pilot: false }, rolloutStep: null, stagingDocs: 0, pilotFilings: 0, blocker: "Verdict API" },
      { wk: 4, name: "Terrebonne", vol: 67, version: "Verdict", onboard: "May 4", churn: "May 16", risk: "med", champion: "J. Burton", currentStage: "Blocked", completedStages: 0, gates: { demo: false, training: false, valpay: false, staging: false, pilot: false }, rolloutStep: null, stagingDocs: 0, pilotFilings: 0, blocker: "Verdict API" },
      { wk: 4, name: "Evangeline", vol: 20, version: "Verdict", onboard: "May 5", churn: "May 17", risk: "low", champion: "R. Deshotel", currentStage: "Blocked", completedStages: 0, gates: { demo: false, training: false, valpay: false, staging: false, pilot: false }, rolloutStep: null, stagingDocs: 0, pilotFilings: 0, blocker: "Verdict API" },
      { wk: 4, name: "Sabine", vol: 14, version: "Verdict", onboard: "May 6", churn: "May 18", risk: "low", champion: "S. Salter", currentStage: "Blocked", completedStages: 0, gates: { demo: false, training: false, valpay: false, staging: false, pilot: false }, rolloutStep: null, stagingDocs: 0, pilotFilings: 0, blocker: "Verdict API" },
      { wk: 5, name: "Plaquemines", vol: 14, version: "Verdict", onboard: "May 11", churn: "May 23", risk: "low", champion: "K. Turlich-V.", currentStage: "Blocked", completedStages: 0, gates: { demo: false, training: false, valpay: false, staging: false, pilot: false }, rolloutStep: null, stagingDocs: 0, pilotFilings: 0, blocker: "Verdict API" },
      { wk: 5, name: "St. James", vol: 12, version: "Verdict", onboard: "May 12", churn: "May 24", risk: "low", champion: "S. LeBlanc", currentStage: "Blocked", completedStages: 0, gates: { demo: false, training: false, valpay: false, staging: false, pilot: false }, rolloutStep: null, stagingDocs: 0, pilotFilings: 0, blocker: "Verdict API" },
      { wk: 5, name: "St. Bernard", vol: 28, version: "Verdict", onboard: "May 13", churn: "May 25", risk: "low", champion: "R. Nunez", currentStage: "Blocked", completedStages: 0, gates: { demo: false, training: false, valpay: false, staging: false, pilot: false }, rolloutStep: null, stagingDocs: 0, pilotFilings: 0, blocker: "Verdict API" },
      { wk: 6, name: "W. Feliciana", vol: 10, version: "Verdict", onboard: "May 18", churn: "May 30", risk: "low", champion: "S. Hughes", currentStage: "Blocked", completedStages: 0, gates: { demo: false, training: false, valpay: false, staging: false, pilot: false }, rolloutStep: null, stagingDocs: 0, pilotFilings: 0, blocker: "Verdict API" },
      { wk: 6, name: "Assumption", vol: 13, version: "Verdict", onboard: "May 19", churn: "May 31", risk: "high", champion: "E. Hebert", currentStage: "Blocked", completedStages: 0, gates: { demo: false, training: false, valpay: false, staging: false, pilot: false }, rolloutStep: null, stagingDocs: 0, pilotFilings: 0, blocker: "Verdict API" },
      { wk: 6, name: "Madison", vol: 6, version: "Verdict", onboard: "May 20", churn: "Jun 1", risk: "low", champion: "M. Hopkins", currentStage: "Blocked", completedStages: 0, gates: { demo: false, training: false, valpay: false, staging: false, pilot: false }, rolloutStep: null, stagingDocs: 0, pilotFilings: 0, blocker: "Verdict API" },
    ],
  };
}

// --- Notion integration (swap in when ready) ---
// Set env vars: NOTION_TOKEN, NOTION_DATABASE_ID
//
// import { Client } from "@notionhq/client";
//
// export async function fetchFromNotion() {
//   const notion = new Client({ auth: process.env.NOTION_TOKEN });
//   const response = await notion.databases.query({
//     database_id: process.env.NOTION_DATABASE_ID,
//     sorts: [{ property: "Order", direction: "ascending" }],
//   });
//
//   const parishes = response.results.map((page) => {
//     const p = page.properties;
//     const completedStages = STAGE_MAP[p["Current Stage"]?.select?.name] || 0;
//     return {
//       wk: p["Week"]?.number || 0,
//       name: p["Parish"]?.title?.[0]?.plain_text || "",
//       vol: p["Est. Daily Filings"]?.number || 0,
//       version: p["Version"]?.select?.name === "Standalone" ? "Standalone" : "Verdict",
//       onboard: formatDate(p["Onboarding Date"]?.date?.start),
//       churn: formatDate(p["Tybera Churn Date"]?.date?.start),
//       risk: (p["Risk Level"]?.select?.name || "low").toLowerCase(),
//       champion: p["Customer Champion"]?.rich_text?.[0]?.plain_text || "",
//       currentStage: p["Current Stage"]?.select?.name || "Not Started",
//       completedStages,
//       gates: {
//         demo: p["Demo Complete"]?.checkbox || false,
//         training: p["Training Complete"]?.checkbox || false,
//         valpay: p["Valpay Connected"]?.checkbox || false,
//         staging: p["Staging QA Passed"]?.checkbox || false,
//         pilot: p["Pilot Approved"]?.checkbox || false,
//       },
//       rolloutStep: p["Rollout Step"]?.select?.name || null,
//       stagingDocs: p["Staging Docs Processed"]?.number || 0,
//       pilotFilings: p["Pilot Filings Completed"]?.number || 0,
//       blocker: p["Blocker"]?.rich_text?.[0]?.plain_text || "",
//     };
//   });
//
//   const totalFilings = parishes.reduce((s, p) => s + p.vol, 0);
//   return {
//     summary: {
//       parishes: parishes.length,
//       dailyFilings: totalFilings,
//       targetCompletion: "Jun 1",
//       currentBlocker: "Verdict API",
//     },
//     parishes,
//   };
// }
//
// function formatDate(iso) {
//   if (!iso) return "";
//   const d = new Date(iso + "T00:00:00");
//   return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
// }
