import type { InquirySectionId } from "./todos";

export type SectionTutorial = {
  id: InquirySectionId;
  number: number;
  title: string;
  why: string;
  steps: string[];
};

export const SECTION_TUTORIALS: Record<InquirySectionId, SectionTutorial> = {
  summary: {
    id: "summary",
    number: 1,
    title: "Route & terms",
    why: "Fill the trip basics so the desk knows where the cargo goes and who pays for which leg.",
    steps: [
      "Set the Incoterm and the cargo-ready date.",
      "Check origin and destination cities.",
      "Write how the truck gets in at pickup and at delivery (gate, crane, overhead lines).",
      "Add trailer deck height if the piece is wide, long, or tall.",
      "Dangerous goods detail and cargo value only if they apply.",
    ],
  },
  pieces: {
    id: "pieces",
    number: 2,
    title: "Pieces",
    why: "Confirm packing and where the figures came from. Optional extras help later for lifting.",
    steps: [
      "Read the piece list sizes and weights.",
      "Set packing for each piece (bare, crate, skid, and so on).",
      "Mark the data source: measured, manufacturer, or estimated.",
      "Centre of gravity and lifting points are optional — fill them when the customer has them.",
      "Amber marks are example size flags only. They are not an approval.",
    ],
  },
  documents: {
    id: "documents",
    number: 3,
    title: "Documents",
    why: "Log drawings and photos you received by email. Files stay in this browser only.",
    steps: [
      "Add a dimensioned drawing or lift plan if you have one (optional).",
      "Add photos of the cargo if useful (optional).",
      "Nothing is uploaded to a server in this demo.",
    ],
  },
  checklist: {
    id: "checklist",
    number: 4,
    title: "Checklist",
    why: "See what is still open. Required items block a clean pass; optional items do not.",
    steps: [
      "Read Still needed first — those are required.",
      "Click a line to open that section and highlight the field.",
      "Additional info (CoG, lifting, drawing) can wait.",
      "Tick permit reminders by hand if the route needs them.",
      "Draft a clarification if you need to ask the customer — it is copy only, not email.",
    ],
  },
  quote: {
    id: "quote",
    number: 5,
    title: "Quote",
    why: "Type cost lines by hand, get sign-off, then send a customer PDF and email draft — margin stays internal.",
    steps: [
      "Use Add suggested lines for the Incoterm if you want a starter list of legs.",
      "Add or edit cost lines under each layer (truck, port, ocean, and so on).",
      "Check inclusions, exclusions, and the subject-to text.",
      "Record manager sign-off when the offer is ready.",
      "Mark sent after it goes out (this desk does not email it).",
      "Download quote PDF (sell total only) or copy the Draft send email for your mail client.",
    ],
  },
  activity: {
    id: "activity",
    number: 6,
    title: "Activity",
    why: "Keep a short record of calls, emails, and notes on this job.",
    steps: [
      "Log a call or email after you speak with the customer.",
      "Tick which missing items they say they sent.",
      "Add an internal note if the desk needs a reminder.",
      "Use the timeline to see what already happened.",
    ],
  },
};
