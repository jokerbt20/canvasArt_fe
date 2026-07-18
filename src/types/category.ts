import type { PagedQuery } from "./common";

export interface Category {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  imagePath: string | null;
  displayOrder: number;
  isActive: boolean;
  paintingCount: number;
  createdAt: string;
}

export interface CreateCategoryRequest {
  parentId?: number | null;
  name: string;
  slug?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export type UpdateCategoryRequest = CreateCategoryRequest;

export interface CategoryQuery extends PagedQuery {
  isActive?: boolean;
  parentId?: number;
}
