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
    body: "Type a company, a city, or a reference such as PCD-26-1841. You can also filter by stage. SAMPLE means the job is fiction, for practice.",
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
    body: "The bar at the top is the path from received to a result. Click a later step, or Move to next stage, to update it after a call. Lost and expired are endings, not a success. A change request sends the job back to preparing the quote.",
  },
  {
    target: "next-step",
    route: "/inquiries/inq-1841",
    title: "What is missing, and the one next step",
    body: "Each line is something still needed, an optional extra, or the single next action. Click a line to open that part of the order and highlight the field. The inquiry is split into sections so you are not looking at everything at once.",
  },
  {
    target: "log-update",
    route: "/inquiries/inq-1841",
    title: "Log the call or the email",
    body: "Press Logged a call, Received email, or Sent email, and add a short note. The time is saved on the timeline. You can also mark which missing items the customer says they sent. This desk does not send the email for you.",
  },
  {
    target: "pieces",
    route: "/inquiries/inq-1841",
    title: "The piece list",
    body: "Each row is one item: size in metres and weight per piece. The amber marks mean a size is over an example limit. A dash means it is not over that example. This is not a fit, and not an approval.",
  },
  {
    target: "missing",
    route: "/inquiries/inq-1841",
    title: "What is still missing",
    body: "The checklist says what to ask for. Required items block progress. Centre of gravity and lifting points are useful later — click a line to open that field. Do not guess a centre of gravity for a lift.",
  },
  {
    target: "permits",
    route: "/inquiries/inq-1841",
    title: "Permit checklist",
    body: "These are reminders for the road, Metro Manila, or an expressway. Ticking a box only records it here. This demo does not file a permit with any office.",
  },
  {
    target: "activity",
    route: "/inquiries/inq-1841",
    title: "Notes and the timeline",
    body: "Notes are for the team. The timeline is a history of what changed. Customers do not see this side.",
  },
  {
    target: "quote",
    route: "/inquiries/inq-1841",
    title: "The quote sheet",
    body: "Type each cost by hand: truck, port, ocean, and so on. Margin is extra you add. The total is ordinary arithmetic. It is not an automatic price, and the figures are samples.",
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
