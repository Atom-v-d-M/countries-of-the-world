"use client";

import Link from "next/link";
import styles from "./page.module.scss";

export default function Home() {

  return (
    <div className={styles.home}>
      <div className={styles.home__navMenu}>
        <Link className={styles.home__navLink} href="/mapLibre">Geo Quiz - MapLibre</Link>
      </div>
    </div>
  );
}