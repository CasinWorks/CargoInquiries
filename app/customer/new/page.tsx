"use client";

import { Shell } from "@/components/shell";
import { Wizard } from "@/components/wizard";

export default function NewInquiryPage() {
  return (
    <Shell mode="customer">
      <Wizard />
    </Shell>
  );
}
