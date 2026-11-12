"use client";

import { Suspense } from "react";
import { InquiryList } from "@/components/inquiry-list";
import { Shell } from "@/components/shell";

export default function InquiriesPage() {
  return (
    <Shell mode="team">
      <Suspense fallback={<p className="text-[13px] text-zinc-600">Loading inquiries…</p>}>
        <InquiryList />
      </Suspense>
    </Shell>
  );
}
