"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const SLIDES: { title: string; body: () => ReactNode }[] = [
  {
    title: "What this app is",
    body: () => (
      <>
        <p>Project Cargo Desk is a practice desk for two jobs: asking for a price on a big shipment, and preparing that price.</p>
        <p className="mt-4">It was prepared for Interfreight Group. It is a demo, not their live office system.</p>
        <p className="mt-4">We will follow one example the whole way: a factory needs to ship one big transformer from Singapore to Batangas.</p>
      </>
    ),
  },
  {
    title: "What “project cargo” means",
    body: () => (
      <>
        <p>Project cargo means freight that is huge, very heavy, or an odd shape.</p>
        <p className="mt-4">A transformer. A machine. Part of a wind turbine. These often do not fit in a normal closed container.</p>
        <p className="mt-4">Each one is different, so each price has to be worked out on its own. That is why quoting takes time.</p>
      </>
    ),
  },
  {
    title: "The problem today",
    body: () => (
      <>
        <p>Requests usually arrive by email or by phone.</p>
        <p className="mt-4">The size is missing, or the weight is a guess, or the drawing comes a week later. People write back and forth.</p>
        <p className="mt-4">The prices often sit in spreadsheets. It is easy to lose what was offered, and when it expires.</p>
      </>
    ),
  },
  {
    title: "Who uses it",
    body: () => (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-zinc-300 p-4">
          <p className="text-[14px] tracking-wide text-zinc-500 uppercase">Customer</p>
          <p className="mt-2">The factory that needs the transformer moved. They fill in a form.</p>
        </div>
        <div className="border border-zinc-300 p-4">
          <p className="text-[14px] tracking-wide text-zinc-500 uppercase">Interfreight team</p>
          <p className="mt-2">Sales, the person who prices, and a manager who agrees the offer can be sent.</p>
        </div>
        <p className="sm:col-span-2">In this demo you can be either one. Use View as at the top. There is no login.</p>
      </div>
    ),
  },
  {
    title: "The journey of one inquiry",
    body: () => (
      <>
        <p>For the transformer, the path looks like this. On the inquiry page, a bar at the top shows which step is happening now.</p>
        <ol className="mt-4 grid gap-2">
          {[
            "New — the form has been sent",
            "Facts missing — size, weight, or a drawing is still unknown",
            "Check the route — can it leave the site and reach the port",
            "Type the costs — truck, port, ship, and so on",
            "Manager agrees — sign-off, which is a button in this demo",
            "Offer sent — the customer has the price",
            "Won or lost — they accept it, or they do not",
          ].map((line) => (
            <li key={line} className="border-l-2 border-zinc-950 py-1 pl-3">
              {line}
            </li>
          ))}
        </ol>
      </>
    ),
  },
  {
    title: "What the customer fills in",
    body: () => (
      <>
        <p>The form has six steps.</p>
        <ol className="mt-4 grid gap-1">
          {["Company and a contact", "What the cargo is", "Each piece: size and weight", "Drawings or photos, if they have them", "Where it starts, where it ends, and when it is ready", "A review, then send"].map(
            (line, index) => (
              <li key={line}>
                {index + 1}. {line}
              </li>
            ),
          )}
        </ol>
        <p className="mt-4">Size is in metres. Weight is for one piece. After sending, they get a reference number. Nothing is emailed.</p>
      </>
    ),
  },
  {
    title: "The team home page and the list",
    body: () => (
      <>
        <p>Overview counts how many jobs are in each stage.</p>
        <p className="mt-4">It also lists jobs still missing facts, prices waiting for a manager, and dates to call the customer back.</p>
        <p className="mt-4">Inquiries is the full list. Search by company, city, or a reference such as PCD-26-1841. SAMPLE means the job is made up, for practice.</p>
      </>
    ),
  },
  {
    title: "Inside one inquiry",
    body: () => (
      <>
        <p>The piece list is every item. Here is the shape of one line, for the example transformer. The numbers are only an illustration.</p>
        <div className="mt-4 overflow-x-auto border border-zinc-300">
          <table className="w-full min-w-[520px] text-left text-[15px]">
            <thead className="border-b border-zinc-300 text-[13px] tracking-wide text-zinc-500 uppercase">
              <tr>
                <th className="px-2 py-2 font-medium">Piece</th>
                <th className="px-2 py-2 font-medium">Size</th>
                <th className="px-2 py-2 font-medium">Weight</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-2">Transformer</td>
                <td className="px-2 py-2">6.8 × 3.2 × 3.7 m</td>
                <td className="px-2 py-2">72 tonnes</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4">Missing information is the list of questions still open. The permit list is a reminder. This demo does not file a permit.</p>
      </>
    ),
  },
  {
    title: "Making the price, and agreeing it",
    body: () => (
      <>
        <p>Someone types each cost: the truck, the port, the ship, the lashing. Then they add a margin.</p>
        <div className="mt-4 border border-zinc-300 p-3 text-[15px]">
          <p className="flex justify-between"><span>Truck, Singapore yard to port</span><span>typed</span></p>
          <p className="mt-1 flex justify-between"><span>Ocean, Singapore to Batangas</span><span>typed</span></p>
          <p className="mt-2 flex justify-between border-t border-zinc-300 pt-2 font-medium"><span>Sell price</span><span>sample figures</span></p>
        </div>
        <p className="mt-4">The total is ordinary addition. It is not looked up from a live rate. A manager records sign-off. Then the offer can be marked sent, and later won or lost.</p>
      </>
    ),
  },
  {
    title: "What this demo does not do",
    body: () => (
      <ul className="grid gap-2">
        <li>It does not invent a price.</li>
        <li>It does not say the cargo fits in a container, or that anyone has approved it.</li>
        <li>It does not show live ship schedules.</li>
        <li>It does not send email.</li>
        <li>It does not file a permit with the government.</li>
      </ul>
    ),
  },
  {
    title: "About the data in this demo",
    body: () => (
      <>
        <p>The sample companies and prices are fiction. They are marked SAMPLE.</p>
        <p className="mt-4">What you type stays in this browser only. Another computer cannot see it. There is no login.</p>
        <p className="mt-4">Reset demo data, in the footer, puts the samples back and removes what you added.</p>
      </>
    ),
  },
  {
    title: "What a real version could add",
    body: () => (
      <>
        <p>These are possible next steps. They are not in this demo.</p>
        <ul className="mt-4 grid gap-2">
          <li>A shared database, so the whole office sees the same jobs.</li>
          <li>Logins, so each person has their own access.</li>
          <li>Email alerts when a fact is missing or a price is about to expire.</li>
          <li>A place to store drawings, not only in one browser.</li>
        </ul>
        <p className="mt-4">If something was confusing, say which slide or which screen. That is the most useful feedback.</p>
      </>
    ),
  },
];

const WORDS: { term: string; meaning: string }[] = [
  { term: "CBM", meaning: "How much space the cargo takes up, in cubic metres. Length times width times height." },
  { term: "Freight ton", meaning: "The greater of the space and the weight. A first look at the size of the job. Not a price." },
  { term: "Piece list", meaning: "One line per item, with its own size and weight. Not one total for everything." },
  { term: "Out of gauge", meaning: "Bigger than the example size of a normal container. The screen only compares examples. It does not approve a fit." },
  { term: "Incoterm", meaning: "A short code, such as FOB or DAP, for who pays for which part of the trip." },
  { term: "Flat rack", meaning: "An open container frame, used when cargo is too wide or too tall for a closed box." },
  { term: "Sign-off", meaning: "A manager agrees the offer can be sent. In this demo it is a button, not a separate login." },
  { term: "Sample figures", meaning: "Numbers typed for practice. Not Interfreight’s real rates." },
];

export function Handbook() {
  const [index, setIndex] = useState(0);
  const [words, setWords] = useState(false);
  const deck = useRef<HTMLElement>(null);
  const slide = SLIDES[index];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === "ArrowRight") setIndex((value) => Math.min(SLIDES.length - 1, value + 1));
      if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function present() {
    const node = deck.current;
    if (!node) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void node.requestFullscreen();
  }

  const Body = slide.body;

  return (
    <article ref={deck} className="mx-auto flex min-h-[70vh] max-w-3xl flex-col bg-zinc-100">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] text-zinc-600">
          Handbook · {index + 1} of {SLIDES.length}
        </p>
        <div className="flex gap-2">
          <button type="button" className="min-h-11 border border-zinc-300 bg-white px-3 text-[16px]" onClick={() => setWords((value) => !value)} aria-expanded={words}>
            Words to know
          </button>
          <button type="button" className="min-h-11 border border-zinc-300 bg-white px-3 text-[16px]" onClick={present}>
            Present
          </button>
        </div>
      </div>
      <div className="mt-4 flex-1 border border-zinc-300 bg-white p-5 sm:p-8">
        {words ? (
          <div>
            <h1 className="text-[28px] leading-tight font-medium text-zinc-950">Words to know</h1>
            <dl className="mt-4 grid gap-3">
              {WORDS.map((item) => (
                <div key={item.term}>
                  <dt className="text-[16px] font-medium text-zinc-950">{item.term}</dt>
                  <dd className="text-[16px] leading-relaxed text-zinc-800">{item.meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <div>
            <h1 className="text-[28px] leading-tight font-medium text-zinc-950 sm:text-[32px]">{slide.title}</h1>
            <div className="mt-4 text-[18px] leading-relaxed text-zinc-800">
              <Body />
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="min-h-12 border border-zinc-300 bg-white px-4 text-[16px] disabled:opacity-40"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0}
        >
          Previous
        </button>
        <button
          type="button"
          className="min-h-12 bg-zinc-950 px-4 text-[16px] text-white disabled:opacity-40"
          onClick={() => setIndex((value) => Math.min(SLIDES.length - 1, value + 1))}
          disabled={index === SLIDES.length - 1}
        >
          Next
        </button>
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Slides">
          {SLIDES.map((item, dot) => (
            <button
              key={item.title}
              type="button"
              role="tab"
              aria-selected={dot === index}
              aria-label={`Slide ${dot + 1}: ${item.title}`}
              className={dot === index ? "h-3 w-3 bg-zinc-950" : "h-3 w-3 border border-zinc-400 bg-white"}
              onClick={() => setIndex(dot)}
            />
          ))}
        </div>
      </div>
      <p className="mt-2 text-[14px] text-zinc-500">Arrow keys move between slides. Present fills the screen.</p>
    </article>
  );
}
