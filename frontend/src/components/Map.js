import React, { useEffect, useState } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [locations, setLocations] = useState([]);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          setApiConnected(true);
        }
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setApiConnected(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const initialMap = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([127.755, 26.355]), // Kadena Air Base coordinates
        zoom: 13,
      }),
    });
    setMap(initialMap);
  }, []);

  useEffect(() => {
    if (map && locations.length > 0) {
      locations.forEach(location => {
        const marker = new Feature({
          geometry: new Point(fromLonLat([location.longitude, location.latitude])),
        });
        marker.setStyle(new Style({
          image: new Icon({
            src: 'https://openlayers.org/en/latest/examples/data/icon.png',
            scale: 0.05,
          }),
        }));
        map.addLayer(new VectorLayer({
          source: new VectorSource({
            features: [marker],
          }),
        }));
      });
    }
  }, [map, locations]);

  return (
    <div>
      <div id="map" className="map" style={{ height: '90vh', width: '100%' }}></div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        {apiConnected ? 'Connected to API' : 'Not connected to API'}
      </div>
    </div>
  );
};

export default MapComponent;