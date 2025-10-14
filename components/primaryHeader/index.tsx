"use client"

import { ReactNode } from "react";
import styles from "./index.module.scss";
import { ThemeSelector } from "../themeSelector";
import Link from "next/link";

export const PrimaryHeader = ({children}: {children: ReactNode}) => {

    return (
        <div className={styles.primaryHeader}>
            <div className={styles.primaryHeader__wrapper}>
                <Link className={styles.primaryHeader__heading} href="/">GeoQuiz</Link>
                <div className={styles.primaryHeader__childrenWrapper}>
                    {children}
                </div>
                <ThemeSelector />
            </div>
        </div>
    )
}