import Link from "next/link";
import styles from "../../styles/components.module.css";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>A</div>

        <div>
          <div className={styles.logoTitle}>Agentic</div>
          <div className={styles.logoSubtitle}>Engineering Platform</div>
        </div>
      </div>

      <nav className={styles.navigation}>
        <Link href="/" className={styles.navItem}>
          <span>⌂</span>
          <span>Dashboard</span>
        </Link>

        <Link href="/#runs" className={styles.navItem}>
          <span>◈</span>
          <span>Runs</span>
        </Link>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.systemStatus}>
          <span className={styles.statusDot} />
          <span>System Online</span>
        </div>
      </div>
    </aside>
  );
}