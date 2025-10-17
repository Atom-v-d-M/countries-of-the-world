'use client';

import styles from './index.module.scss';
import { ReactNode } from 'react';

interface StandardButtonProps {
  label: string;
  clickCallback: () => void;
  type?: "standard" | "highlight" | "warning"
  svgComp?: ReactNode;
}

export const StandardButton = ({ label, clickCallback, type = "standard", svgComp }: StandardButtonProps) => {
  return (
    <button className={`${styles.standardButton} ${type === "highlight" && `${styles["standardButton--highlight"]}`} ${type === "warning" && `${styles["standardButton--warning"]}`}`} onClick={clickCallback}>
      {svgComp && svgComp}
      {label}
    </button>
  );
}