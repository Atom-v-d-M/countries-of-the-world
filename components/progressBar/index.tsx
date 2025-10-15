'use client';
import styles from './index.module.scss';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <div className={styles.progressBar}>
      <div className={styles.progressBar__track}>
        <div
          className={styles.progressBar__fill}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}