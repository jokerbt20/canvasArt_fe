import type { PagedQuery } from "./common";
import type { CartLineRequest } from "./cart";

export type OrderStatus =
  | "Pending"
  | "Contacted"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export const orderStatuses: OrderStatus[] = [
  "Pending",
  "Contacted",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export interface CreateOrderRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  country: string;
  postalCode: string;
  notes?: string;
  items: CartLineRequest[];
}

export interface OrderItem {
  id: number;
  paintingId: number;
  paintingCode: string;
  paintingName: string;
  sizeLabel: string;
  frameName: string | null;
  frameSizeLabel: string | null;
  thumbnailPath: string | null;
  unitPrice: number;
  framePrice: number;
  discountAmount: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderStatusHistoryEntry {
  id: number;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string | null;
  changedByName: string | null;
  createdAt: string;
}

export interface OrderListItem {
  id: number;
  orderNumber: string;
  customerName: string;
  email: string;
  status: OrderStatus;
  grandTotal: number;
  itemCount: number;
  createdAt: string;
}

export interface OrderDetail {
  id: number;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  country: string;
  postalCode: string;
  notes: string | null;
  status: OrderStatus;
  subTotal: number;
  discountTotal: number;
  shippingCost: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  history: OrderStatusHistoryEntry[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
}

export interface OrderQuery extends PagedQuery {
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  delivered: number;
  cancelled: number;
  revenueDelivered: number;
}
