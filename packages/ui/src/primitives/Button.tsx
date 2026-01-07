import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import styles from './Button.module.css';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost';
  }
>;

export const Button = ({ variant = 'primary', children, className = '', ...rest }: ButtonProps) => {
  const variantClass = styles[variant] || styles.primary;
  return (
    <button className={`${styles.button} ${variantClass} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
};
