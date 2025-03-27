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
import Overlay from 'ol/Overlay';
import '../styles/Map.css';

const MapComponent = ({ locations }) => {
  const [map, setMap] = useState(null);
  const [overlay, setOverlay] = useState(null);

  const getIconSVG = (location) => {
    if (location.type === 'custom') {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8" fill="yellow"/></svg>';
    }
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><polygon points="12,2 22,22 2,22" fill="red"/></svg>';
  };

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

    const overlayContainer = document.getElementById('popup');
    const overlayContent = document.getElementById('popup-content');
    const overlayCloser = document.getElementById('popup-closer');

    const overlay = new Overlay({
      element: overlayContainer,
      autoPan: false, // Disable autoPan by default
    });

    overlayCloser.onclick = function () {
      overlay.setPosition(undefined);
      overlayCloser.blur();
      return false;
    };

    initialMap.addOverlay(overlay);
    setMap(initialMap);
    setOverlay(overlay);
  }, []);

  useEffect(() => {
    if (map) {
      const features = locations.map(location => {
        const [longitude, latitude] = location.coordinates;
        const marker = new Feature({
          geometry: new Point(fromLonLat([longitude, latitude])),
          name: location.name,
          points: location.points,
        });
        marker.setStyle(new Style({
          image: new Icon({
            src: getIconSVG(location),
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

      const displayFeatureInfo = (pixel, autoPan = false) => {
        const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
          return feature;
        });
        if (feature) {
          const coordinates = feature.getGeometry().getCoordinates();
          overlay.setPosition(coordinates);
          document.getElementById('popup-content').innerHTML = `${feature.get('name')} - ${feature.get('points')} points`;
          if (autoPan) {
            overlay.getOptions().autoPan = {
              animation: {
                duration: 250,
              },
            };
          } else {
            overlay.getOptions().autoPan = false;
          }
        } else {
          overlay.setPosition(undefined);
        }
      };

      map.on('pointermove', function (evt) {
        if (evt.dragging) {
          overlay.setPosition(undefined);
          return;
        }
        const pixel = map.getEventPixel(evt.originalEvent);
        displayFeatureInfo(pixel);
      });

      map.on('click', function (evt) {
        const pixel = map.getEventPixel(evt.originalEvent);
        displayFeatureInfo(pixel, true); // Enable autoPan for click events
      });
    }
  }, [map, locations, overlay]);

  return (
    <div>
      <div id="map" className="map"></div>
      <div id="popup" className="ol-popup">
        <a href="#" id="popup-closer" className="ol-popup-closer"></a>
        <div id="popup-content"></div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        {locations.length > 0 ? 'Connected to API' : 'Not connected to API'}
      </div>
    </div>
  );
};

export default MapComponent;