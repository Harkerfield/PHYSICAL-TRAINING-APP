import React, { useRef, useEffect, useState } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import { Icon, Style, Text, Fill, Stroke } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Overlay from 'ol/Overlay';
import FullScreen from 'ol/control/FullScreen';
import Geolocation from 'ol/Geolocation';
import './Map.css';

const MapComponent = ({ locations }) => {
  const [map, setMap] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const mapRef = useRef(null);

  const getIconSVG = (location) => {
    if (location.type === 'custom') {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8" fill="yellow"/></svg>';
    }
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><polygon points="12,2 22,22 2,22" fill="red"/></svg>';
  };

  useEffect(() => {
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([127.771759, 26.337825]), // Kadena Air Base coordinates
        zoom: 15,
      }),
      controls: [
        new FullScreen(), // Add fullscreen control
      ],
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
    const adjustMapHeight = () => {
      const mapContainer = document.querySelector('.map-container');
      if (mapContainer) {
        const rect = mapContainer.getBoundingClientRect();
        const remainingHeight = window.innerHeight - rect.top - 20; // Calculate remaining space to the bottom
        mapContainer.style.height = `${remainingHeight}px`;
        if (map) {
          map.updateSize(); // Notify OpenLayers map to update its size
        }
      }
    };

    // Ensure the adjustment happens after the map is rendered
    const timeoutId = setTimeout(adjustMapHeight, 0);

    return () => clearTimeout(timeoutId); // Cleanup timeout
  }, [map]);

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
          document.getElementById('popup-content').innerHTML = `${feature.get('name') ? feature.get('name') : ''} ${feature.get('points') ? '- ' + feature.get('points') + 'points' : ''}`;
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

  useEffect(() => {
    if (map) {
      const geolocation = new Geolocation({
        tracking: true,
        projection: map.getView().getProjection(),
      });

      geolocation.on('change:position', () => {
        const coordinates = geolocation.getPosition();
        if (coordinates) {
          const userPositionFeature = new Feature({
            geometry: new Point(coordinates),
          });
          userPositionFeature.setStyle(new Style({
            image: new Icon({
              src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="5" fill="blue"/></svg>',
              scale: 1,
            }),
            text: new Text({
              text: 'Current Location',
              offsetY: -15,
              fill: new Fill({ color: 'black' }),
              stroke: new Stroke({ color: 'white', width: 2 }),
            }),
          }));

          userPositionFeature.set('name', null); // Ensure no hover text is displayed
          userPositionFeature.set('points', null); // Ensure no hover text is displayed

          const userLayer = new VectorLayer({
            source: new VectorSource({
              features: [userPositionFeature],
            }),
          });

          map.addLayer(userLayer);
          map.getView().setCenter(coordinates);
        }
      });
    }
  }, [map]);

  return (
    <div className="map-container" >
      <div ref={mapRef} className="map"></div>
      <div id="popup" className="ol-popup">
        <a href="#" id="popup-closer" className="ol-popup-closer"></a>
        <div id="popup-content"></div>
      </div>
    </div>
  );
};

export default MapComponent;