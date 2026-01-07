export const invariant = (cond: unknown, msg = 'Invariant failed'): asserts cond => {
  if (!cond) throw new Error(msg);
};

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const currency = (cents: number, locale = 'en-US', currency = 'USD') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);

export * from './ApiError';
export * from './ApiResponse';
export * from './asyncHandler';
export * from './logger';
