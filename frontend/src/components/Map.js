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
import '../styles/Map.css';

const MapComponent = ({ locations }) => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    const initialMap = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([127.771759, 26.337825]), // Kadena Air Base coordinates
        zoom: 15,
      }),
    });
    setMap(initialMap);
  }, []);

  useEffect(() => {
    if (map) {
      const features = locations.map(location => {
        const [longitude, latitude] = location.coordinates;
        const marker = new Feature({
          geometry: new Point(fromLonLat([longitude, latitude])),
        });
        marker.setStyle(new Style({
          image: new Icon({
            src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="red"/></svg>',
            scale: 1,
          }),
        }));
        return marker;
      });
      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features,
        }),
      });
      map.addLayer(vectorLayer);
    }
  }, [map, locations]);

  return (
    <div>
      <div id="map" className="map"></div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        {locations.length > 0 ? 'Connected to API' : 'Not connected to API'}
      </div>
    </div>
  );
};

export default MapComponent;