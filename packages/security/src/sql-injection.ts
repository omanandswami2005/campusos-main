// ============================================================================
// SQL Injection Prevention Notes
// ============================================================================
//
// Prisma ORM provides built-in SQL injection protection through:
//
// 1. **Parameterized Queries**: All queries use parameterized statements
//    - User input is NEVER interpolated into SQL strings
//    - Values are sent separately from the query structure
//
// 2. **Type Safety**: TypeScript ensures proper types
//    - Prevents accidental string concatenation
//    - Compile-time checks for query parameters
//
// 3. **Query Builder**: Prisma's query builder escapes all values
//    - WHERE clauses use safe parameter binding
//    - ORDER BY and other clauses are validated
//
// SAFE EXAMPLES (Prisma handles these correctly):
// ```typescript
// // Safe - parameterized query
// prisma.user.findUnique({ where: { email: userInput } })
//
// // Safe - parameterized query
// prisma.user.findMany({
//   where: {
//     name: { contains: userInput },
//     OR: [
//       { email: userInput },
//       { id: userInput }
//     ]
//   }
// })
// ```
//
// UNSAFE PATTERNS TO AVOID:
// ```typescript
// // DANGEROUS - Raw query with string interpolation
// prisma.$queryRaw`SELECT * FROM users WHERE email = '${userInput}'`
//
// // DANGEROUS - executeRaw with interpolation
// prisma.$executeRaw`DELETE FROM users WHERE id = ${userInput}`
// ```
//
// SAFE RAW QUERY PATTERN:
// ```typescript
// // Safe - using Prisma.sql tagged template
// import { Prisma } from '@prisma/client'
// prisma.$queryRaw(Prisma.sql`SELECT * FROM users WHERE email = ${userInput}`)
// ```
// ============================================================================

/**
 * Validate that a string is safe for use in ORDER BY clauses
 * (For cases where dynamic column names are needed)
 */
export function isValidColumnName(name: string): boolean {
  // Only allow alphanumeric and underscores
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Whitelist-based column validator
 */
export function validateColumn(column: string, allowedColumns: string[]): string | null {
  if (allowedColumns.includes(column)) {
    return column;
  }
  return null;
}

/**
 * Validate sort direction
 */
export function validateSortDirection(direction: string): 'asc' | 'desc' | null {
  const normalized = direction.toLowerCase();
  if (normalized === 'asc' || normalized === 'desc') {
    return normalized;
  }
  return null;
}

/**
 * Build safe ORDER BY clause for Prisma
 */
export function buildOrderBy(
  column: string,
  direction: string,
  allowedColumns: string[]
): Record<string, 'asc' | 'desc'> | null {
  const validColumn = validateColumn(column, allowedColumns);
  const validDirection = validateSortDirection(direction);

  if (!validColumn || !validDirection) {
    return null;
  }

  return { [validColumn]: validDirection };
}

/**
 * Sanitize LIKE pattern (escape special characters)
 */
export function sanitizeLikePattern(pattern: string): string {
  // Escape Prisma/PostgreSQL LIKE special characters
  return pattern.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

/**
 * Build safe search pattern for LIKE queries
 */
export function buildSearchPattern(
  search: string,
  mode: 'contains' | 'startsWith' | 'endsWith' = 'contains'
): string {
  const sanitized = sanitizeLikePattern(search);
  switch (mode) {
    case 'startsWith':
      return `${sanitized}%`;
    case 'endsWith':
      return `%${sanitized}`;
    case 'contains':
    default:
      return `%${sanitized}%`;
  }
}
