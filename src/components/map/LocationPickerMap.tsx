import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, MapPin } from 'lucide-react';

const pickerPinIcon = L.divIcon({
  className: 'custom-picker-pin',
  html: `
    <div style="width: 32px; height: 32px; display: flex; items: center; justify-content: center; position: relative;">
      <div style="width: 24px; height: 24px; border-radius: 50%; background: #ef4444; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
        <div style="width: 6px; height: 6px; border-radius: 50%; background: white;"></div>
      </div>
      <div style="position: absolute; bottom: 0; width: 2px; height: 8px; background: #ef4444;"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

// Inner click handler component for Leaflet
const MapClickHandler: React.FC<{ onLocationPicked: (lat: number, lng: number) => void }> = ({
  onLocationPicked,
}) => {
  useMapEvents({
    click: (e) => {
      onLocationPicked(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
    },
  });
  return null;
};

export const LocationPickerMap: React.FC<LocationPickerProps> = ({
  lat,
  lng,
  onChange,
  className = 'h-64',
}) => {
  const [locating, setLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(Number(pos.coords.latitude.toFixed(5)), Number(pos.coords.longitude.toFixed(5)));
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const center: [number, number] = [lat || 37.7749, lng || -122.4194];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="flex items-center gap-1.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-red-400" />
          <span>Click anywhere on map to pin coordinates:</span>
        </span>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={locating}
          className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded border border-red-500/30 transition-colors"
        >
          <Crosshair className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Detecting...' : 'Use My GPS Location'}</span>
        </button>
      </div>

      <div className={`relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 ${className}`}>
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationPicked={onChange} />
          {lat !== 0 && lng !== 0 && (
            <Marker position={[lat, lng]} icon={pickerPinIcon} />
          )}
        </MapContainer>
      </div>

      {/* Manual Coordinate Display / Fallback */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Latitude Coordinate
          </label>
          <input
            type="number"
            step="0.0001"
            value={lat}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0, lng)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Longitude Coordinate
          </label>
          <input
            type="number"
            step="0.0001"
            value={lng}
            onChange={(e) => onChange(lat, parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
          />
        </div>
      </div>
    </div>
  );
};
