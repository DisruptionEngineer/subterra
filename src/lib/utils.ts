import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  12
);

export function generatePipelineSlug(): string {
  return `pipe_${nanoid()}`;
}

export function generateReportId(): string {
  return `rpt_${nanoid()}`;
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function scheduleLabelFromCron(cron: string): string {
  const parts = cron.split(" ");
  if (parts.length !== 5) return cron;

  const [min, hour, dayOfMonth, , dayOfWeek] = parts;
  const time = `${parseInt(hour)}:${min.padStart(2, "0")} ${parseInt(hour) >= 12 ? "PM" : "AM"}`;

  if (dayOfWeek === "*" && dayOfMonth === "*") return `Daily at ${time}`;
  if (dayOfWeek === "1") return `Every Monday at ${time}`;
  if (dayOfWeek === "5") return `Every Friday at ${time}`;
  if (dayOfWeek === "1-5") return `Weekdays at ${time}`;
  if (dayOfMonth === "1") return `1st of each month at ${time}`;

  return `Custom: ${cron}`;
}
