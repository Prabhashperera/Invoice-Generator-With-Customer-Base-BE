import type { ValueTransformer } from 'typeorm';

// PostgreSQL returns NUMERIC columns as strings. This converts them to numbers.
export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) => (value == null ? value : Number(value)),
};