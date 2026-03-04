export interface Pipeline {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  status: "active" | "paused" | "error";
  schedule: string; // cron expression
  schedule_label: string; // human-readable
  delivery_method: "email_pdf" | "email_excel" | "webhook" | "api";
  delivery_emails: string[];
  brand_color: string;
  brand_name: string;
  brand_logo_url: string | null;
  report_title: string;
  created_at: string;
  updated_at: string;
  last_event_at: string | null;
  last_report_at: string | null;
  event_count_period: number;
  report_count_period: number;
}

export interface WebhookEvent {
  id: string;
  pipeline_id: string;
  payload: Record<string, unknown>;
  received_at: string;
  processed: boolean;
}

export interface Report {
  id: string;
  pipeline_id: string;
  file_url: string;
  format: "pdf" | "excel";
  period_start: string;
  period_end: string;
  event_count: number;
  delivered: boolean;
  delivered_at: string | null;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  plan: "free" | "starter" | "pro" | "scale";
  pipeline_limit: number;
  report_limit: number;
  reports_used: number;
  current_period_start: string;
  current_period_end: string;
}
