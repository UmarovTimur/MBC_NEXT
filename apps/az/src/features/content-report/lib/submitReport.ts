"use client";

export type ReportPayload =
  | {
      type: "report";
      pageUrl: string;
      selectedText: string;
      comment: string;
      contact?: string;
      honeypot: string;
    }
  | {
      type: "contact";
      pageUrl: string;
      contact: string;
      honeypot: string;
    };

export type SubmitReportResult = "ok" | "rate_limited" | "error";

export async function submitReport(payload: ReportPayload): Promise<SubmitReportResult> {
  try {
    const res = await fetch("/api/content-reports/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 429) return "rate_limited";
    if (!res.ok) return "error";

    const data = (await res.json()) as { ok?: boolean };
    return data.ok ? "ok" : "error";
  } catch {
    return "error";
  }
}
