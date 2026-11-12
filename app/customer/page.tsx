"use client";

import { CustomerHome } from "@/components/customer-home";
import { Shell } from "@/components/shell";

export default function CustomerPage() {
  return (
    <Shell mode="customer">
      <CustomerHome />
    </Shell>
  );
}
