import * as React from 'react';
import { cn } from '../lib/utils';
import { Label } from './Label';

export type FormProps = React.FormHTMLAttributes<HTMLFormElement>;

const Form = React.forwardRef<HTMLFormElement, FormProps>(({ className, ...props }, ref) => (
  <form ref={ref} className={cn('space-y-6', className)} {...props} />
));
Form.displayName = 'Form';

export type FormItemProps = React.HTMLAttributes<HTMLDivElement>;

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-2', className)} {...props} />
));
FormItem.displayName = 'FormItem';

export type FormLabelProps = React.ComponentPropsWithoutRef<typeof Label>;

const FormLabel = React.forwardRef<React.ElementRef<typeof Label>, FormLabelProps>(
  ({ className, ...props }, ref) => <Label ref={ref} className={className} {...props} />
);
FormLabel.displayName = 'FormLabel';

export type FormControlProps = React.HTMLAttributes<HTMLDivElement>;

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('relative flex w-full items-center', className)} {...props} />
  )
);
FormControl.displayName = 'FormControl';

export type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
FormDescription.displayName = 'FormDescription';

export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: string;
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, error, children, ...props }, ref) => {
    const body = error ? String(error) : children;

    if (!body) {
      return null;
    }

    return (
      <p ref={ref} className={cn('text-sm font-medium text-destructive', className)} {...props}>
        {body}
      </p>
    );
  }
);
FormMessage.displayName = 'FormMessage';

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage };
