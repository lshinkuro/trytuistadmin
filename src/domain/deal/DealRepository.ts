import type { Deal, DealInput } from "./Deal";

export interface DealRepository {
  list(): Promise<Deal[]>;
  create(input: DealInput): Promise<Deal>;
  update(id: string, input: Partial<DealInput>): Promise<Deal>;
  remove(id: string): Promise<void>;
}
