import type { PropsWithChildren, ReactNode } from 'react';
import styles from './AppShell.module.css';

interface AppShellProps extends PropsWithChildren {
  header?: ReactNode;
  footer?: ReactNode;
}

export const AppShell = ({ header, footer, children }: AppShellProps) => (
  <div className={styles.root}>
    {header && <header className={styles.header}>{header}</header>}
    <main className={styles.main}>{children}</main>
    {footer && <footer className={styles.footer}>{footer}</footer>}
  </div>
);
