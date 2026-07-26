export interface CartLineRequest {
  paintingId: number;
  paintingSizeId: number;
  frameId?: number | null;
  quantity: number;
}

export interface CartRequest {
  items: CartLineRequest[];
}

export interface CartLineResponse {
  paintingId: number;
  paintingName: string;
  thumbnailPath: string | null;
  paintingSizeId: number;
  sizeLabel: string;
  frameId: number | null;
  frameName: string | null;
  paintingUnitPrice: number;
  frameUnitPrice: number;
  unitPrice: number;
  unitDiscount: number;
  unitFinalPrice: number;
  quantity: number;
  lineSubTotal: number;
  lineDiscount: number;
  lineTotal: number;
  appliedPromotion: string | null;
}

export interface CartResponse {
  items: CartLineResponse[];
  subTotal: number;
  discountTotal: number;
  grandTotal: number;
  totalQuantity: number;
}

/**
 * A single locally-persisted cart selection. The ids are authoritative for order creation
 * (the server re-prices at checkout); the display fields — including the price snapshot —
 * are captured at add-time so the cart shows exactly what the customer saw on the product
 * page and never re-runs promotions while browsing the cart.
 */
export interface LocalCartLine {
  id: string;
  paintingId: number;
  paintingSizeId: number;
  frameId: number | null;
  quantity: number;
  paintingName: string;
  paintingSlug: string;
  thumbnailPath: string | null;
  sizeLabel: string;
  frameName: string | null;
  /** Per-unit price the customer saw when adding (painting + frame, each already discounted). */
  unitPrice: number;
  /** Per-unit pre-discount price, or null when nothing was discounted at add-time. */
  unitOriginalPrice: number | null;
}
