export interface Testimonial {
  id: number;
  customerName: string;
  comment: string;
  rating: number | null;
  imagePath: string | null;
  thumbnailPath: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateTestimonialRequest {
  customerName: string;
  comment: string;
  rating?: number;
  displayOrder: number;
  isActive: boolean;
}

export type UpdateTestimonialRequest = CreateTestimonialRequest;
