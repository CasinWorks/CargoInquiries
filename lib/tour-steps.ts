export type TourSide = "customer" | "team";

export type TourStep = {
  target: string;
  title: string;
  body: string;
  route?: string;
  wizardStep?: number;
};

export const CUSTOMER_TOUR: TourStep[] = [
  {
    target: "view-as",
    route: "/customer/new",
    title: "Two ways to look at the desk",
    body: "Customer is the form a shipper fills in. Interfreight team is the desk that prepares a price. There is no login. You can switch any time.",
  },
  {
    target: "wizard-steps",
    route: "/customer/new",
    title: "Six short steps",
    body: "The form is split so it is not one long page. You can go back. Nothing is emailed when you finish.",
  },
  {
    target: "wizard-form",
    route: "/customer/new",
    wizardStep: 0,
    title: "Who is asking",
    body: "Company and a person we can call. Example: a factory that needs one big transformer moved from Singapore to Batangas.",
  },
  {
    target: "wizard-form",
    route: "/customer/new",
    wizardStep: 1,
    title: "What is moving",
    body: "Give the job a name, and say what the cargo is. Insurance is a yes, no, or not sure. This form does not work out tax or duty.",
  },
  {
    target: "wizard-form",
    route: "/customer/new",
    wizardStep: 2,
    title: "One line per piece",
    body: "Length, width, and height are in metres, for one piece, including the crate. Weight is for one piece, not the whole shipment. A transformer might be one very heavy piece.",
  },
  {
    target: "wizard-calc",
    route: "/customer/new",
    wizardStep: 2,
    title: "The numbers update as you type",
    body: "CBM means how much space the cargo takes, in cubic metres. Freight tons is the greater of that space and the weight. They are a first look. They are not a price.",
  },
  {
    target: "wizard-form",
    route: "/customer/new",
    wizardStep: 3,
    title: "Drawings and photos",
    body: "You can attach a drawing or a photo. The file stays in this browser. It is not uploaded to a server. You may send the form without a file.",
  },
  {
    target: "wizard-form",
    route: "/customer/new",
    wizardStep: 4,
    title: "Where it starts and where it ends",
    body: "Name the sites, the date the cargo is ready, and an Incoterm. An Incoterm is a short code for who pays for which part of the trip. This screen does not show ship dates.",
  },
  {
    target: "wizard-form",
    route: "/customer/new",
    wizardStep: 5,
    title: "Send it, and keep the reference",
    body: "Review, then send. You get a reference number, like PCD-26-1901. That page shows where the job is, from received to quote sent, in plain words. Nothing is emailed.",
  },
];

export const TEAM_TOUR: TourStep[] = [
  {
    target: "view-as",
    route: "/",
    title: "You are on the team desk",
    body: "This is the side that reads inquiries and prepares a price. Most customers phone or email. Switch to Customer only if you want to try the web form. There is no password.",
  },
  {
    target: "new-from-call",
    route: "/",
    title: "Start a job from a call or an email",
    body: "Press New inquiry from email or call while you are still on the phone or reading the message. Company, contact, and a short description are enough. Sizes can be added later. Nothing is emailed.",
  },
  {
    target: "pipeline",
    route: "/",
    title: "How many jobs are in each stage",
    body: "New means just received. Later stages mean someone is still collecting facts, checking the route, typing costs, or waiting for a manager. Won and Lost are closed. These counts are from this browser, including the sample jobs.",
  },
  {
    target: "waiting",
    route: "/",
    title: "Still missing facts",
    body: "These jobs still need required facts such as site access or a deck height. Open one to see the checklist. Drawings and centre of gravity are optional extras.",
  },
  {
    target: "followups",
    route: "/",
    title: "Sign-off, follow-up, and validity",
    body: "Sign-off means a manager still has to agree before an offer is sent. Follow-up is a date to call the customer. Validity is the last day that sample price still stands. None of this sends an email.",
  },
  {
    target: "filters",
    route: "/inquiries",
    title: "Search the list",
    body: "Type a company, a city, or a reference such as PCD-26-1841. The same search is in the top bar on every team page. You can also filter by stage, mode, or Incoterm (FOB, CIF, and the rest). SAMPLE means the job is fiction, for practice.",
  },
  {
    target: "inquiry-table",
    route: "/inquiries",
    title: "Open a job",
    body: "Click a reference. A useful sample is the transformer, PCD-26-1841. The next steps of this tour open that job.",
  },
  {
    target: "progress",
    route: "/inquiries/inq-1841",
    title: "Where this job is now",
    body: "This bar shows the path from received to a result. Use Move to next stage after a call. Lost and expired are endings, not a success.",
  },
  {
    target: "next-step",
    route: "/inquiries/inq-1841",
    title: "What is missing, and the one next step",
    body: "Each line is something still needed, an optional extra, or the next action. Click a line to open that numbered section and highlight the field.",
  },
  {
    target: "log-update",
    route: "/inquiries/inq-1841",
    title: "Log the call or the email",
    body: "Section 6 · Activity. Press Logged a call or Received email, add a short note, and save. Nothing is emailed from this desk.",
  },
  {
    target: "pieces",
    route: "/inquiries/inq-1841",
    title: "The piece list",
    body: "Section 2 · Pieces. Each row is one item: size in metres and weight per piece. Amber marks are example size flags only — not an approval.",
  },
  {
    target: "missing",
    route: "/inquiries/inq-1841",
    title: "What is still missing",
    body: "Section 4 · Checklist. Required items block progress. Optional extras such as centre of gravity can wait. Click a line to jump to the field.",
  },
  {
    target: "permits",
    route: "/inquiries/inq-1841",
    title: "Permit checklist",
    body: "Still on Checklist. These are road or Metro Manila reminders. Ticking a box only records it here. This demo does not file a permit.",
  },
  {
    target: "activity",
    route: "/inquiries/inq-1841",
    title: "Notes and the timeline",
    body: "Section 6 · Activity. Notes are for the team. The timeline is a history of what changed. Customers do not see this side.",
  },
  {
    target: "quote",
    route: "/inquiries/inq-1841",
    title: "The quote sheet",
    body: "Section 5 · Quote. Type each cost by hand. Download quote PDF saves only the quotation, not the whole desk page.",
  },
  {
    target: "stage",
    route: "/inquiries/inq-1841",
    title: "Sign-off, sent, won, or lost",
    body: "Ask for sign-off, then record it. That is a button in this demo, not a separate login. After sign-off you can mark the offer sent. Later, record accepted or lost. Accepted does not create a job file.",
  },
  {
    target: "reset",
    route: "/inquiries/inq-1841",
    title: "Reset if you want a clean desk",
    body: "Reset demo data puts the sample jobs back and removes what you added in this browser. Take the tour again any time from Help.",
  },
];
