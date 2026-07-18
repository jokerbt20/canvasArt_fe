export interface Slide {
  id: number;
  title: string;
  subtitle: string | null;
  imagePath: string;
  linkUrl: string | null;
  buttonText: string | null;
  displayOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
}

export interface CreateSlideRequest {
  title: string;
  subtitle?: string;
  linkUrl?: string;
  buttonText?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export type UpdateSlideRequest = CreateSlideRequest;

export interface CreateSlideFromPaintingImageRequest extends CreateSlideRequest {
  paintingImageId: number;
}

export interface Setting {
  key: string;
  value: string | null;
  group: string;
  description: string | null;
  updatedAt: string;
}

export interface UpsertSettingRequest {
  key: string;
  value?: string;
  group: string;
  description?: string;
}

export interface UpsertSettingsRequest {
  settings: UpsertSettingRequest[];
}
