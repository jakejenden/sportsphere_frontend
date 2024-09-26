import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapboxMap.css'

mapboxgl.accessToken = 'pk.eyJ1IjoiamFrZWplbmRlbiIsImEiOiJjbTFpMm5mOHcwaWo0MmpzaXBkZ2s2eWMzIn0.GV26kFhLYpyeTc_xNh6Stw';

interface MapboxMapProps {
  gpxData: string; // GPX data in string format
}

const MapboxMap: React.FC<MapboxMapProps> = ({ gpxData }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapInstance.current && mapContainerRef.current) {
      mapInstance.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [-0.09, 51.505], // Default map center
        zoom: 13,
      });

      mapInstance.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

    const map = mapInstance.current;

    if (gpxData) {
      const decodedGPX = atob(gpxData);
      console.log('Decoded GPX:', decodedGPX);
      let gpxParser = require('gpxparser');

      // Parse GPX data to GeoJSON (make sure you use the correct function)
      var gpx = new gpxParser();
      gpx.parse(decodedGPX);
      const geojson = gpx.toGeoJSON(); // Ensure this is correct

      if (geojson && geojson.features && geojson.features.length > 0) {
        console.log('Parsed GeoJSON:', geojson);

        map?.on('load', () => {  // Use optional chaining here
          map.addSource('gpxRoute', {
            type: 'geojson',
            data: geojson,
          });

          map.addLayer({
            id: 'gpxRouteLine',
            type: 'line',
            source: 'gpxRoute',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#FF0000',
              'line-width': 4,
            },
          });

          // add the digital elevation model tiles
          map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 20
          });
          map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1 });

          const coordinates = geojson.features[0].geometry.coordinates;
          console.log('Coordinates for fitBounds:', coordinates); // Log coordinates

          // Fit map to GPX route bounds
          if (Array.isArray(coordinates) && coordinates.length > 0) {
            const bounds = coordinates.reduce((bounds: any, coord: any) => {
              return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

            map.fitBounds(bounds, { padding: 20 });
          } else {
            console.error('No valid coordinates found for fitting bounds:', coordinates);
          }
        });
      } else {
        console.error('Invalid GeoJSON structure or empty features:', geojson);
      }
    }

    return () => {
      // Check if mapInstance.current is initialized before calling remove
      if (mapInstance.current) {
        mapInstance.current.remove();  // Clean up the map instance
        mapInstance.current = null; // Clear reference to allow re-initialization
      }
    };
  }, [gpxData]);


  return <div className='map-container'>
            <div ref={mapContainerRef} className='map' />;
          </div>
};

export default MapboxMap;
