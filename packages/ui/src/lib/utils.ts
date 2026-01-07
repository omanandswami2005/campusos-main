import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx for conditional classes
 * This is the standard shadcn/ui utility function
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
