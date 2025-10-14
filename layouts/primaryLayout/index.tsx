import { PrimaryHeader } from "@/components/primaryHeader";
import { ReactNode } from "react";
import styles from "./index.module.scss"


export default function PrimaryLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <PrimaryHeader>
                <></>
            </PrimaryHeader>
            <main className={styles.content}>{children}</main>
        </>
    );
}