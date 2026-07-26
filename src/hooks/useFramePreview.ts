import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { framePreviewService } from "../services/framePreviewService";

export function useFramePreview(params: { paintingId?: number; frameId?: number; paintingImageId?: number }) {
  const enabled = Boolean(params.paintingId && params.frameId);
  return useQuery({
    queryKey: queryKeys.framePreviews.get({
      paintingId: params.paintingId ?? 0,
      frameId: params.frameId ?? 0,
      paintingImageId: params.paintingImageId,
    }),
    queryFn: () =>
      framePreviewService.get({
        paintingId: params.paintingId!,
        frameId: params.frameId!,
        paintingImageId: params.paintingImageId,
      }),
    enabled,
    staleTime: Infinity,
    retry: false,
  });
}
