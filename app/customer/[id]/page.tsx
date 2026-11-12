"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { CustomerInquiry } from "@/components/customer-inquiry";
import { Shell } from "@/components/shell";

export default function CustomerInquiryPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return (
    <Shell mode="customer">
      <Suspense fallback={<p className="text-[13px] text-zinc-600">Opening the inquiry…</p>}>
        <CustomerInquiry id={id} />
      </Suspense>
    </Shell>
  );
}
