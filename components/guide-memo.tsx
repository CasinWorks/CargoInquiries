import { STATUSES } from "@/lib/labels";

export function GuideMemo() {
  return (
    <article className="mx-auto max-w-2xl text-[14px] leading-relaxed text-zinc-800">
      <p className="font-mono text-[11px] tracking-wide text-zinc-500">Memo</p>
      <h1 className="mt-1 text-[20px] font-medium tracking-tight text-zinc-950">How to read this demo</h1>
      <p className="mt-3">
        This is a proposal for Interfreight Group, based on how project-cargo inquiries are usually handled in the trade. It is not a copy of your current process. CasinWorks built it so a manager or someone in IT can click through alone.
      </p>
      <h2 className="mt-6 text-[15px] font-medium text-zinc-950">Try this, in order</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        <li>On Overview, read the pipeline. Every job there is fictional and marked SAMPLE.</li>
        <li>Open PCD-26-1841, the transformer. Read the piece list and the limit checks. The checks compare published example limits. They do not say a box is approved.</li>
        <li>Open the quote on that job. The lines were typed. Change a margin and watch the sell price recalculate. That is arithmetic, not a rate lookup.</li>
        <li>Switch View as to Customer. Send a short inquiry. Use metres, and a weight per piece.</li>
        <li>Switch back to Interfreight team. Your inquiry is in the list. Add one cost line, record sign-off, mark it sent, then record accepted or lost.</li>
      </ol>
      <h2 className="mt-6 text-[15px] font-medium text-zinc-950">What the customer is asked for</h2>
      <p className="mt-2">
        Company and contact. A project name. A piece list with packed length, width, and height, quantity, and gross weight per piece. Packing, and whether the figures were measured, taken from the manufacturer, or estimated. Centre of gravity and lifting points when they are known. Drawings and photos. Origin and destination sites, the Incoterm, the cargo-ready date, a mode preference, and dangerous goods or special handling.
      </p>
      <h2 className="mt-6 text-[15px] font-medium text-zinc-950">What the desk does with it</h2>
      <p className="mt-2">
        The inquiry lands on the team list. A checklist shows what is still missing. Someone assigns sales, pricing, and an approver. Notes and a timeline stay on the inquiry. The quote is built from cost lines in six layers: preparation, inland, origin port, ocean, lashing, and destination. Contingency, a risk allowance, and a margin are typed. A manager records sign-off. Then the quote can be marked sent, followed up, accepted, or lost.
      </p>
      <h2 className="mt-6 text-[15px] font-medium text-zinc-950">What the stages mean</h2>
      <table className="mt-2 w-full border-collapse text-[13px]">
        <tbody>
          {STATUSES.map((status) => (
            <tr key={status.id} className="border-b border-zinc-200">
              <th scope="row" className="py-1.5 pr-3 text-left font-medium text-zinc-950">
                {status.label}
              </th>
              <td className="py-1.5 text-zinc-700">{status.hint}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="mt-6 text-[15px] font-medium text-zinc-950">What the numbers mean</h2>
      <p className="mt-2">
        CBM is length × width × height in metres, times quantity. Freight tons are the greater of total CBM and total metric tons. One freight ton equals one CBM or one metric ton. The heavy-lift band tags a piece against the published ICTSI Manila Multipurpose Terminal tiers. It is not a price. Out-of-gauge marks compare a piece with example container sheets from Hapag-Lloyd and Maersk, and with Philippine road references: 2.5 m wide, 4.0 m high including the trailer deck, 18 m for a vehicle and trailer together. Every one of those checks is labelled indicative. A dash means no exceedance on that example. It is not a fit.
      </p>
      <h2 className="mt-6 text-[15px] font-medium text-zinc-950">What is a sample, and what is not built</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>All 11 seeded jobs, company names, contacts, and vendor names are fictional. They are marked SAMPLE or “sample”.</li>
        <li>Every price is sample figures, typed by hand. Nothing is Interfreight’s rate.</li>
        <li>The ICTSI heavy-lift tiers are a published reference, dated 1 Jan 2026, and they are not added to a quote unless someone types a line.</li>
        <li>Limit checks are indicative only, subject to carrier and authority confirmation.</li>
        <li>The clarification note is a draft. The demo does not send email.</li>
        <li>The permit list is a manual checklist. Nothing is filed with an agency.</li>
        <li>Coming later, and not mocked as if they were live: vessel schedules, automatic pricing, duty calculation, and permit filing.</li>
        <li>Dashboard counts, the time-to-quote figure, and the win/loss count are from this demo data.</li>
      </ul>
      <h2 className="mt-6 text-[15px] font-medium text-zinc-950">What we would ask before a real build</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>What do you use today: spreadsheets, email, or a freight system?</li>
        <li>Who prices, and who signs off?</li>
        <li>What does your quote look like, and what are the standard exclusions?</li>
        <li>Which lanes matter most: import, domestic haul, or inter-island?</li>
        <li>Which ports and permits do you touch most?</li>
        <li>Should customers fill a form, or only your own staff?</li>
      </ul>
      <h2 className="mt-6 text-[15px] font-medium text-zinc-950">Where the data lives</h2>
      <p className="mt-2">
        In this browser only. Two computers do not share inquiries. Reset demo data, in the footer, puts the samples back and removes what you added. Sample dates sit around November 2026. If you open this later, some follow-ups will look overdue. That is the sample calendar, not a live feed.
      </p>
    </article>
  );
}
