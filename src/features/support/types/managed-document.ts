export interface Publication {
  publishedAt: string | null;
  updatedAt: string | null;
  views: number;
}
export interface ManagedDocument extends Publication {
  key: string;
  content: string;
  publishedContent: string | null;
  __v: number;
}
export interface PublicDocument extends Publication {
  content: string;
}
