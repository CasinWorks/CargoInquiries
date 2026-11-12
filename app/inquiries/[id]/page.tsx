"use client";

import { useParams } from "next/navigation";
import { InquiryDetail } from "@/components/inquiry-detail";
import { Shell } from "@/components/shell";

export default function InquiryPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return (
    <Shell mode="team">
      <InquiryDetail id={id} />
    </Shell>
  );
}
