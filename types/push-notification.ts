export type PushStatus = "scheduled" | "sending" | "sent" | "failed";

export interface PushNotification {
  id: number;
  createdAt: string;
  title: string;
  description: string;
  technicalName: string | null;
  status: PushStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  author: string | null;
  regionId: number | null;
}

export interface PushNotificationsResponse {
  data: PushNotification[];
  meta: { total: number; pageCount: number; page: number };
}

export interface PushRecipientsResponse {
  total: number;
}

export interface CreatePushPayload {
  title: string;
  description: string;
  technicalName?: string;
  scheduledAt?: string;
  regionId?: number;
}
