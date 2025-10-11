"use client";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";


import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <ComposableMap projection="geoMercator">
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any }) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => alert(geo.properties.NAME)}
                  style={{
                    default: { fill: "#D6D6DA", outline: "none" },
                    hover: { fill: "#F53", outline: "none" },
                    pressed: { fill: "#E42", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
