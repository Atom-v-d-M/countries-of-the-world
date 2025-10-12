"use client";

import styles from "./page.module.scss";
import { Map } from "@vis.gl/react-maplibre";
import { useRef, useState } from "react";

export default function Home() {
  const mapRef = useRef<any>(null);
  const [labelsVisible, setLabelsVisible] = useState(true);

  // List of all 197 countries in the world
  const allowedCountries = [
    // North America
    'United States', 'Canada', 'Mexico', 'Guatemala', 'Belize', 'El Salvador', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panama',
    
    // South America
    'Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Guyana', 'Suriname',
    
    // Europe
    'United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Luxembourg', 'Switzerland', 'Austria', 'Czech Republic', 'Slovakia', 'Poland', 'Hungary', 'Slovenia', 'Croatia', 'Bosnia and Herzegovina', 'Serbia', 'Montenegro', 'Albania', 'North Macedonia', 'Bulgaria', 'Romania', 'Moldova', 'Ukraine', 'Belarus', 'Lithuania', 'Latvia', 'Estonia', 'Finland', 'Sweden', 'Norway', 'Denmark', 'Iceland', 'Ireland', 'Malta', 'Cyprus', 'Greece', 'Turkey', 'Russia',
    
    // Asia
    'China', 'Japan', 'South Korea', 'North Korea', 'Mongolia', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Tajikistan', 'Kyrgyzstan', 'Afghanistan', 'Pakistan', 'India', 'Nepal', 'Bhutan', 'Bangladesh', 'Sri Lanka', 'Maldives', 'Myanmar', 'Thailand', 'Laos', 'Cambodia', 'Vietnam', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Brunei', 'East Timor', 'Taiwan', 'Hong Kong', 'Macau',
    
    // Middle East
    'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Bahrain', 'Kuwait', 'Oman', 'Yemen', 'Iraq', 'Iran', 'Israel', 'Palestine', 'Jordan', 'Lebanon', 'Syria', 'Turkey',
    
    // Africa
    'Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco', 'Sudan', 'South Sudan', 'Ethiopia', 'Eritrea', 'Djibouti', 'Somalia', 'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'Democratic Republic of the Congo', 'Republic of the Congo', 'Central African Republic', 'Chad', 'Cameroon', 'Nigeria', 'Niger', 'Mali', 'Burkina Faso', 'Ghana', 'Togo', 'Benin', 'Côte d\'Ivoire', 'Liberia', 'Sierra Leone', 'Guinea', 'Guinea-Bissau', 'Senegal', 'Gambia', 'Mauritania', 'Cape Verde', 'São Tomé and Príncipe', 'Equatorial Guinea', 'Gabon', 'Angola', 'Zambia', 'Malawi', 'Mozambique', 'Madagascar', 'Mauritius', 'Seychelles', 'Comoros', 'South Africa', 'Lesotho', 'Swaziland', 'Botswana', 'Namibia', 'Zimbabwe',
    
    // Oceania
    'Australia', 'New Zealand', 'Papua New Guinea', 'Fiji', 'Solomon Islands', 'Vanuatu', 'Samoa', 'Tonga', 'Kiribati', 'Tuvalu', 'Nauru', 'Palau', 'Marshall Islands', 'Micronesia', 'Cook Islands', 'Niue'
  ];

  // Helper function to identify country labels
  const isCountryLabel = (layer: any) => {
    console.log("layer", layer)
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

    // Debug: Log all symbol layers to help identify country labels
    // console.log('Available symbol layers:');
    // map.getStyle().layers.forEach((layer: any) => {
    //   if (layer.type === 'symbol') {
    //     console.log(layer, `- ${layer.id}:`, layer.layout?.['text-field']);
    //   }
    // });

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
            console.log(`Set English text field for: ${layer.id}`);
          } catch (error) {
            console.log(`Could not set text field for ${layer.id}:`, error);
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
            console.log(`Applied multi-property country filter to: ${layer.id}`);
          } catch (error) {
            console.log(`Could not apply filter to ${layer.id}:`, error);
            // If filtering fails, we'll show all country labels
          }
        }
      }
    });
  };

  const handleZoom = () => {
    if (!mapRef.current) return;
    
    const zoom = mapRef.current.getZoom();
    
    // mapRef.current.getStyle().layers.forEach((layer: any) => {
    //   if (layer.type === 'symbol') {
    //     // Show country labels at zoom 3+, hide others
    //     const shouldShow = isCountryLabel(layer) && zoom >= 6;
    //     mapRef.current.setLayoutProperty(layer.id, 'visibility', shouldShow ? 'visible' : 'none');
    //   }
    // });
  };

  const toggleLabels = () => {
    if (!mapRef.current) return;
    
    setLabelsVisible(!labelsVisible);
    
    mapRef.current.getStyle().layers.forEach((layer: any) => {
      if (layer.type === 'symbol') {
        // Only toggle country labels
        if (isCountryLabel(layer)) {
          const newVisibility = labelsVisible ? 'none' : 'visible';
          mapRef.current.setLayoutProperty(layer.id, 'visibility', newVisibility);
        }
      }
    });
  };

  return (
    <div className={styles.page}>
      <button onClick={toggleLabels} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
        {labelsVisible ? 'Hide Labels' : 'Show Labels'}
      </button>
      
      <Map
        initialViewState={{
          zoom: 1.5
        }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        onLoad={handleMapLoad}
        onZoom={handleZoom}
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