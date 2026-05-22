import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pass: "bg-emerald-100 text-emerald-800",
  present: "bg-emerald-100 text-emerald-800",
  active: "bg-emerald-100 text-emerald-800",
  partial: "bg-amber-100 text-amber-800",
  late: "bg-amber-100 text-amber-800",
  unpaid: "bg-red-100 text-red-800",
  fail: "bg-red-100 text-red-800",
  absent: "bg-red-100 text-red-800",
  left: "bg-slate-200 text-slate-700",
  graduated: "bg-sky-100 text-sky-800",
  leave: "bg-sky-100 text-sky-800"
};

export function Badge({
  value,
  className
}: {
  value: string | null | undefined;
  className?: string;
}) {
  const label = value ?? "unknown";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        tones[label] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      {label.replaceAll("_", " ")}
    </span>
  );
}
