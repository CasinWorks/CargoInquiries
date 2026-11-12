"use client";

import { Overview } from "@/components/overview";
import { Shell } from "@/components/shell";

export default function HomePage() {
  return (
    <Shell mode="team">
      <Overview />
    </Shell>
  );
}
