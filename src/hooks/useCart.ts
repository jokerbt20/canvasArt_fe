import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { cartService } from "../services/cartService";
import { useCart as useCartContext } from "../contexts/CartContext";
import type { CartLineRequest } from "../types";

/** Fetches authoritative, promotion-aware pricing for the current local cart selections. */
export function useCartCalculation() {
  const { items } = useCartContext();

  const cartLines: CartLineRequest[] = items.map((item) => ({
    paintingId: item.paintingId,
    paintingSizeId: item.paintingSizeId,
    frameId: item.frameId,
    frameSizeId: item.frameSizeId,
    quantity: item.quantity,
  }));

  return useQuery({
    queryKey: queryKeys.cart.calculate(cartLines),
    queryFn: () => cartService.calculate({ items: cartLines }),
    enabled: cartLines.length > 0,
  });
}
