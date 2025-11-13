export interface Casting {
  id: string;
  title: string;
  description: string;
  productionType: "film" | "tv" | "commercial" | "music-video" | "other";
  isOpen: boolean;
  postedDate: Date;
  bookingDate?: Date;
  requirements?: string;
  payRate?: string;
  location?: string;
  facebookPostUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  subscribedAt: Date;
  isActive: boolean;
}
