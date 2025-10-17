"use client";

import styles from "./page.module.scss";
import { Map } from "@vis.gl/react-maplibre";
import { useRef, useState, useEffect, useMemo } from "react";
import countryData from "./countryData.json";
import { PrimaryHeader } from "@/components/primaryHeader";
import { ProgressBar } from "@/components/progressBar";
import { StandardButton } from "@/components/standardButton";
import { FlagSVG, PauseSVG, RefreshSVG } from "@/components/svgComps";

// Create allowedCountries array from JSON data
const allowedCountries = countryData.map(country => country.primaryName);

type QuizState = "paused" | "playing" | "awaitingStart"

export default function MapLibrePage() {
  const mapRef = useRef<any>(null);

  const [quizState, setQuizState] = useState<QuizState>("awaitingStart")

  const [foundCountries, setFoundCountries] = useState<string[]>([])
  const [labelsVisible, setLabelsVisible] = useState(false);
  const [searchInput, setSearchInput] = useState<string>('');

  // Update map filter when foundCountries or labelsVisible changes
  useEffect(() => {
    if (!mapRef.current) return;
    
    mapRef.current.getStyle().layers.forEach((layer: any) => {
      if (layer.type === 'symbol' && isCountryLabel(layer)) {
        try {
          if (labelsVisible) {
            // When labelsVisible is true, show all countries (override any filters)
            const filter = [
              'any',
              ['in', ['get', 'name_en'], ['literal', allowedCountries]],
              ['in', ['get', 'NAME_EN'], ['literal', allowedCountries]],
              ['in', ['get', 'name_english'], ['literal', allowedCountries]],
              ['in', ['get', 'NAME_english'], ['literal', allowedCountries]],
              ['in', ['get', 'name'], ['literal', allowedCountries]],
              ['in', ['get', 'NAME'], ['literal', allowedCountries]],
              ['in', ['get', 'country'], ['literal', allowedCountries]],
              ['in', ['get', 'COUNTRY'], ['literal', allowedCountries]],
              ['in', ['get', 'admin'], ['literal', allowedCountries]],
              ['in', ['get', 'ADMIN'], ['literal', allowedCountries]]
            ];
            mapRef.current.setFilter(layer.id, filter);
          } else {
            // When labelsVisible is false, show all countries but with conditional text
            const filter = [
              'any',
              ['in', ['get', 'name_en'], ['literal', allowedCountries]],
              ['in', ['get', 'NAME_EN'], ['literal', allowedCountries]],
              ['in', ['get', 'name_english'], ['literal', allowedCountries]],
              ['in', ['get', 'NAME_english'], ['literal', allowedCountries]],
              ['in', ['get', 'name'], ['literal', allowedCountries]],
              ['in', ['get', 'NAME'], ['literal', allowedCountries]],
              ['in', ['get', 'country'], ['literal', allowedCountries]],
              ['in', ['get', 'COUNTRY'], ['literal', allowedCountries]],
              ['in', ['get', 'admin'], ['literal', allowedCountries]],
              ['in', ['get', 'ADMIN'], ['literal', allowedCountries]]
            ];
            mapRef.current.setFilter(layer.id, filter);
            
            // Set conditional text field: show name if found, question mark if not
            mapRef.current.setLayoutProperty(layer.id, 'text-field', [
              'case',
              // Check if country is in foundCountries (check all possible name properties)
              ['any',
                ['in', ['get', 'name'], ['literal', foundCountries]],
                ['in', ['get', 'name_en'], ['literal', foundCountries]],
                ['in', ['get', 'NAME_EN'], ['literal', foundCountries]],
                ['in', ['get', 'name_english'], ['literal', foundCountries]],
                ['in', ['get', 'NAME_english'], ['literal', foundCountries]],
                ['in', ['get', 'country'], ['literal', foundCountries]],
                ['in', ['get', 'COUNTRY'], ['literal', foundCountries]],
                ['in', ['get', 'admin'], ['literal', foundCountries]],
                ['in', ['get', 'ADMIN'], ['literal', foundCountries]]
              ],
              // If found, show the actual name
              [
                'coalesce',
                ['get', 'name_en'],
                ['get', 'NAME_EN'],
                ['get', 'name_english'],
                ['get', 'NAME_english'],
                ['get', 'name'],
                ['get', 'NAME'],
                ['get', 'country'],
                ['get', 'COUNTRY'],
                ['get', 'admin'],
                ['get', 'ADMIN']
              ],
              // If not found, show question mark
              '?'
            ]);
          }
        } catch (error) {
          console.log(`Could not apply filter to ${layer.id}:`, error);
        }
      }
    });
  }, [foundCountries, labelsVisible]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Handle search on Enter key press
  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Search input:', searchInput);

      // Search for matching countries
      const searchTerm = searchInput.toLowerCase().trim();
      const matchingCountries = countryData.filter(country => {
        // Check primary name (exact match)
        if (country.primaryName.toLowerCase() === searchTerm) {
          return true;
        }
        // Check alternative names (exact match)
        return country.alternativeNames.some(altName => 
          altName.toLowerCase() === searchTerm
        );
      });

      if (matchingCountries.length > 0) {
        const foundCountry = matchingCountries[0]; // Should only be one match
        console.log('Found country:', foundCountry.primaryName);
        setFoundCountries((prev) => [...prev, foundCountry.primaryName]);
      } else {
        console.log('No countries found matching:', searchTerm);
      }
      
      setSearchInput(''); // Clear the input
    }
  };

  // Helper function to identify country labels
  const isCountryLabel = (layer: any) => {
    // First check if it's a symbol layer that could contain country names
    const isSymbolLayer = layer.type === 'symbol';
    const hasTextField = layer.layout && layer.layout['text-field'];
    
    if (!isSymbolLayer || !hasTextField) return false;
    
    // Check if it's a country label layer by ID patterns
    const isCountryLayer = layer.id.includes('country')
                          // layer.id.includes('admin') || 
                          // layer.id.includes('place-country') ||
                          // layer.id.includes('country-label') ||
                          // layer.id.includes('place_label');
    
    return isCountryLayer;
  };

  const handleMapLoad = (event: any) => {
    const map = event.target;
    mapRef.current = map;

    // Show only country labels, hide all other symbol layers
    map.getStyle().layers.forEach((layer: any) => {
      if (layer.type === 'symbol') {
        const shouldShow = isCountryLabel(layer);
        map.setLayoutProperty(layer.id, 'visibility', shouldShow ? 'visible' : 'none');
        
        if (shouldShow) {
          // console.log(`Showing country label: ${layer.id}`);
          
          // Set text field to prioritize English names
          try {
            map.setLayoutProperty(layer.id, 'text-field', [
              'coalesce',
              ['get', 'name_en'],
              ['get', 'NAME_EN'],
              ['get', 'name_english'],
              ['get', 'NAME_english'],
              ['get', 'name'],
              ['get', 'NAME'],
              ['get', 'country'],
              ['get', 'COUNTRY'],
              ['get', 'admin'],
              ['get', 'ADMIN']
            ]);
            // console.log(`Set English text field for: ${layer.id}`);
          } catch (error) {
            // console.log(`Could not set text field for ${layer.id}:`, error);
          }
          
          // Apply filter based on labelsVisible state
          try {
            if (labelsVisible) {
              // When labelsVisible is true, show all countries
              const filter = [
                'any',
                ['in', ['get', 'name_en'], ['literal', allowedCountries]],
                ['in', ['get', 'NAME_EN'], ['literal', allowedCountries]],
                ['in', ['get', 'name_english'], ['literal', allowedCountries]],
                ['in', ['get', 'NAME_english'], ['literal', allowedCountries]],
                ['in', ['get', 'name'], ['literal', allowedCountries]],
                ['in', ['get', 'NAME'], ['literal', allowedCountries]],
                ['in', ['get', 'country'], ['literal', allowedCountries]],
                ['in', ['get', 'COUNTRY'], ['literal', allowedCountries]],
                ['in', ['get', 'admin'], ['literal', allowedCountries]],
                ['in', ['get', 'ADMIN'], ['literal', allowedCountries]]
              ];
              map.setFilter(layer.id, filter);
            } else {
              // When labelsVisible is false, show all countries but with conditional text
              const filter = [
                'any',
                ['in', ['get', 'name_en'], ['literal', allowedCountries]],
                ['in', ['get', 'NAME_EN'], ['literal', allowedCountries]],
                ['in', ['get', 'name_english'], ['literal', allowedCountries]],
                ['in', ['get', 'NAME_english'], ['literal', allowedCountries]],
                ['in', ['get', 'name'], ['literal', allowedCountries]],
                ['in', ['get', 'NAME'], ['literal', allowedCountries]],
                ['in', ['get', 'country'], ['literal', allowedCountries]],
                ['in', ['get', 'COUNTRY'], ['literal', allowedCountries]],
                ['in', ['get', 'admin'], ['literal', allowedCountries]],
                ['in', ['get', 'ADMIN'], ['literal', allowedCountries]]
              ];
              map.setFilter(layer.id, filter);
              
              // Set conditional text field: show name if found, question mark if not
              map.setLayoutProperty(layer.id, 'text-field', [
                'case',
                // Check if country is in foundCountries (check all possible name properties)
                ['any',
                  ['in', ['get', 'name'], ['literal', foundCountries]],
                  ['in', ['get', 'name_en'], ['literal', foundCountries]],
                  ['in', ['get', 'NAME_EN'], ['literal', foundCountries]],
                  ['in', ['get', 'name_english'], ['literal', foundCountries]],
                  ['in', ['get', 'NAME_english'], ['literal', foundCountries]],
                  ['in', ['get', 'country'], ['literal', foundCountries]],
                  ['in', ['get', 'COUNTRY'], ['literal', foundCountries]],
                  ['in', ['get', 'admin'], ['literal', foundCountries]],
                  ['in', ['get', 'ADMIN'], ['literal', foundCountries]]
                ],
                // If found, show the actual name
                [
                  'coalesce',
                  ['get', 'name_en'],
                  ['get', 'NAME_EN'],
                  ['get', 'name_english'],
                  ['get', 'NAME_english'],
                  ['get', 'name'],
                  ['get', 'NAME'],
                  ['get', 'country'],
                  ['get', 'COUNTRY'],
                  ['get', 'admin'],
                  ['get', 'ADMIN']
                ],
                // If not found, show question mark
                '?'
              ]);
            }
            // console.log(`Applied multi-property country filter to: ${layer.id}`);
          } catch (error) {
            // console.log(`Could not apply filter to ${layer.id}:`, error);
            // If filtering fails, we'll show all country labels
          }
        }
      }
    });
  };

  const toggleLabels = () => {
    if (!mapRef.current) return;
    
    setLabelsVisible(!labelsVisible);
    
    mapRef.current.getStyle().layers.forEach((layer: any) => {
      if (layer.type === 'symbol') {
        // Only toggle country labels
        if (isCountryLabel(layer)) {
          if (!labelsVisible) {
            // Switching to show labels - restore original text field
            mapRef.current.setLayoutProperty(layer.id, 'visibility', 'visible');
            mapRef.current.setLayoutProperty(layer.id, 'text-field', [
              'coalesce',
              ['get', 'name_en'],
              ['get', 'NAME_EN'],
              ['get', 'name_english'],
              ['get', 'NAME_english'],
              ['get', 'name'],
              ['get', 'NAME'],
              ['get', 'country'],
              ['get', 'COUNTRY'],
              ['get', 'admin'],
              ['get', 'ADMIN']
            ]);
          } else {
            // Switching to hide labels - show question marks
            mapRef.current.setLayoutProperty(layer.id, 'visibility', 'visible');
            mapRef.current.setLayoutProperty(layer.id, 'text-field', '?');
          }
        }
      }
    });
  };


  // need some modal view to appear when landing on the page similar to the quiz finished screen that allows you to start the quiz
  // should hide all header actiaons and footer search bar and most likely the map while modal is displayed. 
  // then add timer functionaltiy 
  // will need to create a button comp to be used for the various buttons
  // mobile first styling

  const progressPercentageValue = useMemo(() => {
    const decimalValue = Number((foundCountries?.length / allowedCountries.length).toFixed(2))
    return decimalValue * 100
  }, [foundCountries, allowedCountries])

  return (
    <div className={styles.mapLibrePage}>
      <PrimaryHeader>
        <div className={styles.header}>
          <div className={styles.header__progressWrapper}>
            <span className={styles.header__progressText}>{`Progress: ${foundCountries?.length} / ${allowedCountries?.length}`}</span>
            <ProgressBar progress={progressPercentageValue} />
          </div>
          <span>{`15:00`}</span>
          <div className={styles.header__buttonsWrapper}>
            <StandardButton label="Pause" clickCallback={() => {console.log("click")}} svgComp={<PauseSVG width={16} height={16} fill="#13A4EC" />} />
            <StandardButton label="Reset" clickCallback={() => {console.log("click")}} svgComp={<RefreshSVG width={16} height={16} fill="#13A4EC" />} />
            <StandardButton label="Give Up" clickCallback={() => {console.log("click")}} type="warning" svgComp={<FlagSVG width={16} height={16} fill="#EF4444" />} />
          </div>
        </div>
      </PrimaryHeader>
      <div className={styles.mapLibrePage__searchArea}>
          <input 
            className={styles.mapLibrePage__searchInput}
            type="text"
            placeholder="Type the country name..."
            value={searchInput}
            onChange={handleSearchChange}
            onKeyDown={handleSearchSubmit}
          />
      </div>
      <div className={styles.mapLibrePage__content}>
        {/* <button onClick={toggleLabels} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
          {labelsVisible ? 'Hide Labels' : 'Show Labels'}
        </button> */}
        <div className={styles.mapLibrePage__mapWrapper}>
          <Map
            initialViewState={{
              zoom: 1.5
            }}
            mapStyle="https://tiles.openfreemap.org/styles/liberty"
            onLoad={handleMapLoad}
            minZoom={1.5}
            maxZoom={5}
            // Disable 3D view and rotation
            pitch={0}
            bearing={0}
            // Disable drag rotation
            dragRotate={false}
            // Disable touch rotation
            touchPitch={false}
            // Disable keyboard rotation
            keyboard={false}
            // Disable double-click zoom (can cause pitch changes)
            doubleClickZoom={false}
            // Disable box zoom (can cause pitch changes)
            boxZoom={false}
          />
        </div>
      </div>
    </div>
  );
}