import type { DashboardRepository } from "@/domain/dashboard/Dashboard";
import { validateDateRange, type DateRange } from "@/domain/shared/dateRange";
import { ValidationError } from "@/domain/shared/errors";

export function makeGetDashboard(repo: DashboardRepository) {
  return ({ range, storeId = "" }: { range: DateRange; storeId?: string }) => {
    const error = validateDateRange(range);
    if (error) throw new ValidationError(error, { range: error });
    return repo.get(range, storeId);
  };
}
