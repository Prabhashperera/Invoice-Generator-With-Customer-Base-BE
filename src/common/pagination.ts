export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const paginated = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): Paginated<T> => ({
  data,
  meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
});

// Escapes LIKE wildcards so user input is matched literally.
export const likePattern = (search: string): string =>
  `%${search.replace(/[\\%_]/g, '\\$&')}%`;