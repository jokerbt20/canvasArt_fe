export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    revoke: "/auth/revoke",
    me: "/auth/me",
    changePassword: "/auth/change-password",
    users: "/auth/users",
  },
  categories: {
    list: "/categories",
    byId: (id: number) => `/categories/${id}`,
    manage: "/categories/manage",
  },
  tags: {
    list: "/tags",
    byId: (id: number) => `/tags/${id}`,
  },
  frames: {
    list: "/frames",
    byId: (id: number) => `/frames/${id}`,
    manage: "/frames/manage",
    image: (id: number) => `/frames/${id}/image`,
  },
  paintings: {
    list: "/paintings",
    bySlug: (slug: string) => `/paintings/${slug}`,
    manage: "/paintings/manage",
    manageById: (id: number) => `/paintings/manage/${id}`,
    byId: (id: number) => `/paintings/${id}`,
    images: (id: number) => `/paintings/${id}/images`,
    image: (id: number, imageId: number) => `/paintings/${id}/images/${imageId}`,
    primaryImage: (id: number, imageId: number) => `/paintings/${id}/images/${imageId}/primary`,
  },
  promotions: {
    list: "/promotions",
    byId: (id: number) => `/promotions/${id}`,
    combinations: "/promotions/combinations",
    combinationById: (id: number) => `/promotions/combinations/${id}`,
  },
  cart: {
    calculate: "/cart/calculate",
  },
  orders: {
    create: "/orders",
    track: (orderNumber: string) => `/orders/track/${orderNumber}`,
    list: "/orders",
    stats: "/orders/stats",
    byId: (id: number) => `/orders/${id}`,
    status: (id: number) => `/orders/${id}/status`,
  },
  slides: {
    list: "/slides",
    manage: "/slides/manage",
    byId: (id: number) => `/slides/${id}`,
    fromPaintingImage: "/slides/from-painting-image",
  },
  settings: {
    list: "/settings",
  },
  contact: {
    submit: "/contact",
    list: "/contact",
    markRead: (id: number) => `/contact/${id}/read`,
  },
  testimonials: {
    list: "/testimonials",
    manage: "/testimonials/manage",
    byId: (id: number) => `/testimonials/${id}`,
  },
} as const;
