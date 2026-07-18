export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface CreateTagRequest {
  name: string;
  slug?: string;
}

export type UpdateTagRequest = CreateTagRequest;
