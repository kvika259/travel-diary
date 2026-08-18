import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapView.module.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapView({ markers, center, zoom = 6 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(
      [center?.lat || 50, center?.lng || 10],
      zoom
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    markers.forEach((m) => {
      const marker = L.marker([m.coords.lat, m.coords.lng], {
        icon: m.visited ? greenIcon : greyIcon,
      }).addTo(map);

      marker.bindPopup(`
        <div style="text-align:center;font-size:14px">
          <strong>${m.name}</strong><br/>
          <a href="${m.link}" style="color:#667eea;text-decoration:none;font-size:12px">Подробнее →</a>
        </div>
      `);

      marker.on('click', () => {
        navigate(m.link);
      });
    });
  }, [markers, navigate]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView([center.lat, center.lng], zoom);
  }, [center, zoom]);

  return <div ref={mapRef} className={styles.map} />;
}