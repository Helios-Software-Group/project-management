# Parish Rollout Tracker

Visual dashboard for tracking the e-filing platform rollout across 14 Louisiana parishes.

## How it works

1. You update data in the **Notion Parish Rollout Tracker** database (tick checkboxes, change stages, add blockers)
2. This app reads from Notion and renders the swimlane-style progress tracker
3. Embed it back into Notion with an `/embed` block, or view it standalone

## Setup

### 1. Install and run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000` with dummy data.

### 2. Connect to Notion

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) and create a new integration
2. Copy the token
3. Share the Parish Rollout Tracker database with your integration (click Share on the database page, add the integration)
4. Create a `.env.local` file:

```
NOTION_TOKEN=secret_xxxxx
NOTION_DATABASE_ID=a136d7b502da4be8bd8242a53e9ce758
```

5. In `src/lib/data.js`, uncomment the `fetchFromNotion()` function and the import
6. In `src/app/page.js`, swap `getDummyData()` for `await fetchFromNotion()`

### 3. Deploy to Vercel

```bash
npx vercel
```

Add `NOTION_TOKEN` and `NOTION_DATABASE_ID` as environment variables in Vercel project settings.

### 4. Embed in Notion

1. Copy the Vercel deployment URL
2. In Notion, type `/embed`
3. Paste the URL

## Notion database properties used

| Property | Type | Purpose |
|----------|------|---------|
| Parish | Title | Parish name |
| Week | Number | Rollout week (1-6) |
| Order | Number | Sort order (1-14) |
| Est. Daily Filings | Number | Expected daily volume |
| Version | Select | Standalone or Verdict Integrated |
| Current Stage | Select | 1-Demo through 7-Live, or Blocked/Not Started |
| Risk Level | Select | High, Medium, Low |
| Onboarding Date | Date | Planned start date |
| Tybera Churn Date | Date | Target Tybera decommission date |
| Customer Champion | Text | Point of contact |
| Demo Complete | Checkbox | Gate: demo done |
| Training Complete | Checkbox | Gate: training done |
| Valpay Connected | Checkbox | Gate: merchant account live |
| Staging QA Passed | Checkbox | Gate: 50 docs tested |
| Pilot Approved | Checkbox | Gate: pilot sign-off |
| Rollout Step | Select | 6a-6d during graduated rollout |
| Tybera Decommissioned | Checkbox | Gate: migration complete |
| Blocker | Text | What is blocking progress |
