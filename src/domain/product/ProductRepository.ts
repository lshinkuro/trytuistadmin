import type { Category, Product, ProductFilter, ProductInput, ProductUpdate } from "./Product";

export interface ProductRepository {
  list(filter: ProductFilter): Promise<Product[]>;
  create(input: ProductInput): Promise<Product>;
  update(update: ProductUpdate): Promise<Product>;
  categories(): Promise<Category[]>;
}
