import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { INDICATIVE } from "@/lib/labels";
import type { ComponentProps, ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  help,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  help?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <Label htmlFor={htmlFor} className="text-[13px] font-medium text-zinc-800">
        {label}
      </Label>
      {children}
      {help ? (
        <p id={`${htmlFor}-help`} className="text-[12px] leading-snug text-zinc-500">
          {help}
        </p>
      ) : null}
      {error ? (
        <p className="text-[12px] text-rose-800" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function DeskInput({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn("h-8 rounded-sm bg-white text-[13px] shadow-none md:text-[13px]", className)}
      {...props}
    />
  );
}

export function DeskText({ className, ...props }: ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      className={cn("min-h-20 rounded-sm bg-white text-[13px] shadow-none md:text-[13px]", className)}
      {...props}
    />
  );
}

export function DeskSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-8 w-full rounded-sm border border-zinc-300 bg-white px-2 text-[13px] text-zinc-950",
        className,
      )}
      {...props}
    />
  );
}

export function SampleMark() {
  return (
    <span className="ml-2 inline-block border border-zinc-300 px-1 align-middle font-mono text-[10px] tracking-wider text-zinc-600">
      SAMPLE
    </span>
  );
}

export function IndicativeLine({ className }: { className?: string }) {
  return <p className={cn("text-[12px] leading-snug text-zinc-600", className)}>{INDICATIVE}</p>;
}

export function PageTitle({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4">
      {kicker ? <p className="font-mono text-[11px] tracking-wide text-zinc-500">{kicker}</p> : null}
      <h1 className="text-[20px] font-medium tracking-tight text-zinc-950">{title}</h1>
      {children ? <div className="mt-1 max-w-3xl text-[13px] leading-relaxed text-zinc-600">{children}</div> : null}
    </div>
  );
}

export function SectionTitle({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="scroll-mt-20 text-[15px] font-medium text-zinc-950">
      {children}
    </h2>
  );
}

export function Th({
  children,
  align = "left",
  className,
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-zinc-200 px-2 py-2 text-[11px] font-medium tracking-[0.04em] text-zinc-500 uppercase",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className,
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td className={cn("px-2 py-2 align-top text-zinc-800", align === "right" ? "text-right" : "text-left", className)}>
      {children}
    </td>
  );
}
