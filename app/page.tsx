"use client";

import styles from "./page.module.scss";
import { Map } from "@vis.gl/react-maplibre";
import { useRef, useState } from "react";
import countryData from "./countryData.json";

// Create allowedCountries array from JSON data
const allowedCountries = countryData.map(country => country.primaryName);


export default function Home() {
  const mapRef = useRef<any>(null);

  const [foundCountries, setFoundCountries] = useState<string[]>([])
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [searchInput, setSearchInput] = useState<string>('');

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
        console.log('Found matching countries:', matchingCountries.map(c => c.primaryName));
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

  // Helper function to check if a country name is in our allowed list
  const isAllowedCountry = (countryName: string) => {
    return allowedCountries.some(country => 
      countryName.toLowerCase().includes(country.toLowerCase()) ||
      country.toLowerCase().includes(countryName.toLowerCase())
    );
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
          
          // Apply filter to only show specific countries
          try {
            // Create a filter that prioritizes English name properties
            const filter = [
              'any',
              // Prioritize English name properties first
              ['in', ['get', 'name_en'], ['literal', allowedCountries]],
              ['in', ['get', 'NAME_EN'], ['literal', allowedCountries]],
              ['in', ['get', 'name_english'], ['literal', allowedCountries]],
              ['in', ['get', 'NAME_english'], ['literal', allowedCountries]],
              // Fallback to other properties only if English names don't match
              ['in', ['get', 'name'], ['literal', allowedCountries]],
              ['in', ['get', 'NAME'], ['literal', allowedCountries]],
              ['in', ['get', 'country'], ['literal', allowedCountries]],
              ['in', ['get', 'COUNTRY'], ['literal', allowedCountries]],
              ['in', ['get', 'admin'], ['literal', allowedCountries]],
              ['in', ['get', 'ADMIN'], ['literal', allowedCountries]]
            ];
            map.setFilter(layer.id, filter);
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
          if (labelsVisible) {
            // Hide labels - show question marks
            mapRef.current.setLayoutProperty(layer.id, 'visibility', 'visible');
            mapRef.current.setLayoutProperty(layer.id, 'text-field', '?');
          } else {
            // Show labels - restore original text field
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
          }
        }
      }
    });
  };

  return (
    <div className={styles.page}>
      <button onClick={toggleLabels} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
        {labelsVisible ? 'Hide Labels' : 'Show Labels'}
      </button>
      <input 
        type="text"
        placeholder="Search countries..."
        value={searchInput}
        onChange={handleSearchChange}
        onKeyDown={handleSearchSubmit}
        style={{
          position: 'absolute',
          top: '10px',
          left: '220px',
          zIndex: 1,
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px',
          width: '200px'
        }}
      />
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
  );
}