import * as React from 'react';
import { cn } from '../lib/utils';
import { Spinner } from './Spinner';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
}

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className,
  ...props
}: DataTableProps<T>) {
  const getValue = (item: T, key: keyof T | string): unknown => {
    if (typeof key === 'string' && key.includes('.')) {
      return key
        .split('.')
        .reduce<unknown>((obj, k) => (obj as Record<string, unknown>)?.[k], item as unknown);
    }
    return (item as Record<string, unknown>)[key as string];
  };

  return (
    <div className={cn('w-full overflow-auto', className)} {...props}>
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center">
                <Spinner className="mx-auto" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                onClick={() => onRowClick?.(item, index)}
                className={cn(
                  'border-b transition-colors hover:bg-muted/50',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className={cn('p-4 align-middle', col.className)}>
                    {col.render ? col.render(item, index) : String(getValue(item, col.key) ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export { DataTable };
