import type { UserFilter, UserRepository } from "@/domain/user/User";

export function makeListUsers(repo: UserRepository) {
  return (filter: UserFilter) => repo.list({ ...filter, query: filter.query.trim() });
}
