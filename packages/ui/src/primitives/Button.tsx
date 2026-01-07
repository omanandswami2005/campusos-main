import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost';
  }
>;

const base = 'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400',
  ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-300'
};

export const Button = ({ variant = 'primary', children, className = '', ...rest }: ButtonProps) => (
  <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
    {children}
  </button>
);
import * as React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export const Button: React.FC<Props> = ({ variant = 'primary', className = '', ...rest }) => {
  const base = 'inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium';
  const style =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200';
  return <button className={[base, style, className].join(' ')} {...rest} />;
};
