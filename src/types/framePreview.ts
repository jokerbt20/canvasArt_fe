export interface FramePreviewResult {
  previewUrl: string;
  width: number;
  height: number;
}

export interface FramePreviewParams {
  paintingId: number;
  frameId: number;
  paintingImageId?: number;
}
