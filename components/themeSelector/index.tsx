"use client"

import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { DarkModeSVG, LightModeSVG } from "../svgComps";

export const ThemeSelector = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const current = saved ?? (prefersDark ? 'dark' : 'light');
  
      setTheme(current);
      document.documentElement.setAttribute('data-theme', current);
    }, []);
  
    const toggleTheme = () => {
      const next = theme === 'light' ? 'dark' : 'light';
      setTheme(next);
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    };

    return (
        <button className={styles.themeSelector} onClick={toggleTheme}>
            {theme === "light" ? <DarkModeSVG /> : <LightModeSVG />}
        </button>
    )
}