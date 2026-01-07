// Core utilities
export { cn } from './lib/utils';

// Components (shadcn/ui style)
export { Button, buttonVariants, type ButtonProps } from './components/Button';
export { Input, type InputProps } from './components/Input';
export { Label } from './components/Label';
export { Badge, badgeVariants, type BadgeProps } from './components/Badge';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/Card';
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/Dialog';
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from './components/Select';
export { Alert, AlertTitle, AlertDescription } from './components/Alert';
export { Spinner } from './components/Spinner';
export { Skeleton } from './components/Skeleton';

// New components
export { Tabs, TabsList, TabsTrigger, TabsContent, type TabsProps } from './components/Tabs';
export { Avatar, type AvatarProps } from './components/Avatar';
export { DataTable, type DataTableProps, type Column } from './components/DataTable';
export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  type FormProps,
} from './components/Form';

// Layout
export { AppShell } from './components/AppShell';
