export interface CategoryParent {
  _id: string;
  name: string;
  slug?: string;
}

export interface Category {
  icon?: string;
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: CategoryParent | string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  icon?: string;
  name: string;
  description?: string;
  parent?: string | null;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  icon?: string;
  name?: string;
  description?: string;
  parent?: string | null;
  isActive?: boolean;
}

