// Ordered for balanced 2-column grid: (4,4), (5,5), (5,10)
export const MVP_CATEGORIES = [
  {
    key: "cms",
    name: "CMS Integration",
    color: "#5B8DEF",
    features: [
      { name: "Pull case types, filing types, fees, and document types from CMS", stories: 0 },
      { name: "File to new & existing cases", stories: 0 },
      { name: "Parish selection for multi-parish attorneys", stories: 0 },
      { name: "CMS balance display", stories: 0 },
    ],
  },
  {
    key: "admin",
    name: "Admin",
    color: "#D46B8A",
    features: [
      { name: "Account creation and firm linking", stories: 0 },
      { name: "Bar roll number entry", stories: 0 },
      { name: "Forgot password and username flows", stories: 0 },
      { name: "Role-based access control (filer, clerk, judge, admin)", stories: 0 },
    ],
  },
  {
    key: "pdf",
    name: "Handling PDFs",
    color: "#9B7BED",
    features: [
      { name: "Upload large and multiple documents with descriptions", stories: 0 },
      { name: "Split, edit, and combine documents", stories: 0 },
      { name: "Image stamping (custom, 1st page or all)", stories: 0 },
      { name: 'Red box margins (2" top, 1" around)', stories: 0 },
      { name: "Correct and resubmit rejected filings", stories: 0 },
    ],
  },
  {
    key: "payments",
    name: "Payments",
    color: "#E0A04B",
    features: [
      { name: "CC and ACH payment processing (multiple payment types on file)", stories: 0 },
      { name: "Fee waivers (government agencies, paupers, existing funds on case)", stories: 0 },
      { name: "No filing fees for Criminal cases", stories: 0 },
      { name: "Escrow deposits", stories: 0 },
      { name: "Ledger and balance display", stories: 0 },
    ],
  },
  {
    key: "workflow",
    name: "User Workflow",
    color: "#3DB88C",
    features: [
      { name: "Accept or reject filings with custom reasons or templates", stories: 0 },
      { name: "Alter fee amounts", stories: 0 },
      { name: "Add docket entries with or without images", stories: 0 },
      { name: "Electronic signing for judges and clerks", stories: 0 },
      { name: "Queue management for pre-sign, post-sign, and print workflows", stories: 0 },
    ],
  },
  {
    key: "production",
    name: "Production Readiness",
    color: "#E07B4B",
    features: [
      { name: "Responsive layout for desktop and tablet", stories: 0 },
      { name: "WCAG 2.1 AA accessibility", stories: 0 },
      { name: "SSL/TLS encryption", stories: 0 },
      { name: "PCI compliance for payment processing", stories: 0 },
      { name: "Audit logging for submissions, reviews, and signatures", stories: 0 },
      { name: "Session timeout handling", stories: 0 },
      { name: "Confirmation modals for irreversible actions", stories: 0 },
      { name: "Error states and validation on all forms", stories: 0 },
      { name: "Print-friendly views for documents, receipts, and docket entries", stories: 0 },
      { name: "PDF generation for stamped documents and signed orders", stories: 0 },
    ],
  },
];
