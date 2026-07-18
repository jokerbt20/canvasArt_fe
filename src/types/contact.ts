import type { PagedQuery } from "./common";

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateContactMessageRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactMessageQuery extends PagedQuery {
  isRead?: boolean;
}
