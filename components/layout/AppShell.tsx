import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import styles from "../../styles/components.module.css";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.appShell}>
      <Sidebar />

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}