import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import '../styles/HeatAirportMap.css';

const airportIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const HeatAirportMap = () => {
  const mapRef = useRef(null);
  useEffect(() => {
    const initMap = async () => {
      if (mapRef.current != null) {
        mapRef.current.remove();
      }

      const map = L.map('map', {
        center: [39.8283, -98.5795],
        zoom: 4,
        dragging: true,
        tap: false,
        inertia: true,
        zoomControl: true,
      });

      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors',
      }).addTo(map);

      try {
        const response = await fetch('/api/popular-map');
        if (!response.ok) throw new Error('Failed to fetch airports and routes');
        const { airports, routes } = await response.json();

        const airportMap = {};
        airports.forEach(ap => {
          airportMap[ap.AirportID] = { lat: ap.Latitude, lng: ap.Longitude };
        });

        const usedAirportCodes = new Set();
        routes.forEach(route => {
          usedAirportCodes.add(route.depAirport);
          usedAirportCodes.add(route.arrAirport);
        });

        usedAirportCodes.forEach(code => {
          const coords = airportMap[code];
          if (coords) {
            L.marker([coords.lat, coords.lng], { icon: airportIcon })
              .addTo(map)
              .bindPopup(`<b>${code}</b>`)
              .bindTooltip(code, { permanent: false, direction: 'top' });
          }
        });

        routes.forEach(route => {
          const dep = airportMap[route.depAirport];
          const arr = airportMap[route.arrAirport];

          if (dep && arr) {
            const line = L.polyline([[dep.lat, dep.lng], [arr.lat, arr.lng]], {
              color: '#2563eb',
              weight: 6,
              opacity: 0.7,
            }).addTo(map).bindPopup(`
              <div>
                <b>${route.depAirport} → ${route.arrAirport}</b><br>
                ${route.searchCount} searches<br>
                <button onclick="window.location.href='/?dep=${route.depAirport}&arr=${route.arrAirport}'">Search Flight Info</button>
              </div>
            `);

            line.on('mouseover', () => {
              line.setStyle({ color: '#f59e0b', weight: 9, opacity: 1 });
            });

            line.on('mouseout', () => {
              line.setStyle({ color: '#2563eb', weight: 6, opacity: 0.7 });
            });
          }
        });
      } catch (err) {
        console.error('❌ Error loading map data:', err);
      }
    };

    initMap();
  }, []);

  return (
    <div className="sl-page">
      <div className="sl-page-head">
        <div>
          <h1 className="sl-page-title">Popular Routes</h1>
          <p className="sl-page-sub">Most searched airports and routes across the network</p>
        </div>
      </div>

      <div className="sl-card sl-map-card">
        <div id="map" className="sl-map"></div>
      </div>
    </div>
  );
};

export default HeatAirportMap;