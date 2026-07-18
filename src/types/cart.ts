export interface CartLineRequest {
  paintingId: number;
  paintingSizeId: number;
  frameId?: number | null;
  frameSizeId?: number | null;
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
  frameSizeId: number | null;
  frameSizeLabel: string | null;
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
 * A single locally-persisted cart selection. Only the ids are authoritative — display
 * fields (name/thumbnail/labels) are a snapshot for instant UI, re-validated against
 * /cart/calculate whenever the cart or checkout page loads.
 */
export interface LocalCartLine {
  id: string;
  paintingId: number;
  paintingSizeId: number;
  frameId: number | null;
  frameSizeId: number | null;
  quantity: number;
  paintingName: string;
  paintingSlug: string;
  thumbnailPath: string | null;
  sizeLabel: string;
  frameName: string | null;
  frameSizeLabel: string | null;
}
