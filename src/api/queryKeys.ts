import type { PaintingQuery, FrameQuery, OrderQuery, PromotionQuery, ContactMessageQuery } from "../types";

export const queryKeys = {
  categories: {
    all: ["categories"] as const,
    manage: (query: unknown) => ["categories", "manage", query] as const,
    byId: (id: number) => ["categories", "detail", id] as const,
  },
  tags: {
    all: ["tags"] as const,
  },
  frames: {
    all: ["frames"] as const,
    list: (query: FrameQuery) => ["frames", "list", query] as const,
    manage: (query: FrameQuery) => ["frames", "manage", query] as const,
    byId: (id: number) => ["frames", "detail", id] as const,
  },
  paintings: {
    all: ["paintings"] as const,
    list: (query: PaintingQuery) => ["paintings", "list", query] as const,
    manage: (query: PaintingQuery) => ["paintings", "manage", query] as const,
    bySlug: (slug: string) => ["paintings", "detail", slug] as const,
    manageById: (id: number) => ["paintings", "manage-detail", id] as const,
  },
  promotions: {
    all: ["promotions"] as const,
    list: (query: PromotionQuery) => ["promotions", "list", query] as const,
    combinations: (query: PromotionQuery) => ["promotions", "combinations", query] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (query: OrderQuery) => ["orders", "list", query] as const,
    byId: (id: number) => ["orders", "detail", id] as const,
    stats: ["orders", "stats"] as const,
  },
  cart: {
    calculate: (items: unknown) => ["cart", "calculate", items] as const,
  },
  slides: {
    active: ["slides", "active"] as const,
    manage: ["slides", "manage"] as const,
    byId: (id: number) => ["slides", "detail", id] as const,
  },
  settings: {
    all: (group?: string) => ["settings", group ?? "all"] as const,
  },
  contact: {
    list: (query: ContactMessageQuery) => ["contact", "list", query] as const,
  },
  testimonials: {
    all: ["testimonials"] as const,
    active: ["testimonials", "active"] as const,
    manage: ["testimonials", "manage"] as const,
  },
  auth: {
    me: ["auth", "me"] as const,
    users: (query: unknown) => ["auth", "users", query] as const,
  },
} as const;
