import { apiClient } from "../api/axios";
import { endpoints } from "../api/endpoints";
import type { FramePreviewParams, FramePreviewResult } from "../types";

export const framePreviewService = {
  get: async (params: FramePreviewParams): Promise<FramePreviewResult> => {
    const { data } = await apiClient.get<FramePreviewResult>(endpoints.framePreviews.get, { params });
    return data;
  },
};
