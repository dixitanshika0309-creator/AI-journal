import React, { useState, useEffect } from 'react';
import { JournalLocation } from '../types';
import { MapPin, Search, Navigation, X, Check, Globe, Sparkles, ExternalLink } from 'lucide-react';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: JournalLocation;
  onSelectLocation: (loc: JournalLocation | undefined) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<JournalLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLocations('');
    }
  }, [isOpen]);

  const fetchLocations = async (query: string) => {
    setIsLoading(true);
    setGeoError(null);
    try {
      const res = await fetch(`/api/maps/places?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err: any) {
      console.error('Failed to load places:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLocations(searchQuery);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/maps/geocode?lat=${latitude}&lng=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const newLoc: JournalLocation = {
              name: data.name || 'Current Location',
              address: data.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              lat: latitude,
              lng: longitude,
              category: 'Current Spot',
              mapUrl: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
            };
            onSelectLocation(newLoc);
            onClose();
          } else {
            const fallbackLoc: JournalLocation = {
              name: `Present Location (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
              address: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              lat: latitude,
              lng: longitude,
              category: 'Current Spot',
              mapUrl: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
            };
            onSelectLocation(fallbackLoc);
            onClose();
          }
        } catch {
          setGeoError('Unable to reverse geocode current coordinates.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setGeoError(err.message || 'Location permission denied.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  if (!isOpen) return null;

  return (
    <div
      id="location-picker-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        id="location-picker-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pin Journal Location</h3>
              <p className="text-xs text-slate-500">Attach a reflective sanctuary or current place to this entry</p>
            </div>
          </div>
          <button
            id="close-location-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-6 space-y-4 border-b border-slate-100">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="location-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sanctuary, city, park, or café..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
            <button
              id="search-locations-btn"
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              id="use-current-gps-btn"
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border border-emerald-200 text-xs font-semibold transition"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
            </button>

            {currentLocation && (
              <button
                id="remove-pinned-location-btn"
                type="button"
                onClick={() => {
                  onSelectLocation(undefined);
                  onClose();
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium underline"
              >
                Remove Pinned Location
              </button>
            )}
          </div>

          {geoError && (
            <p className="text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
              {geoError}
            </p>
          )}
        </div>

        {/* Places List */}
        <div className="p-6 overflow-y-auto space-y-3 max-h-[360px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {searchQuery ? 'Search Results' : 'Mindful Sanctuaries & Places'}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-500" />
              Google Maps Platform
            </span>
          </div>

          <div className="space-y-2">
            {results.map((place, idx) => {
              const isSelected =
                currentLocation?.name === place.name ||
                (currentLocation?.lat === place.lat && currentLocation?.lng === place.lng);

              return (
                <div
                  key={`${place.name}-${idx}`}
                  id={`place-item-${idx}`}
                  onClick={() => {
                    const locData: JournalLocation = {
                      ...place,
                      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        place.name + ' ' + (place.address || '')
                      )}`,
                    };
                    onSelectLocation(locData);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200/80 hover:border-emerald-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{place.name}</span>
                        {place.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {place.category}
                          </span>
                        )}
                      </div>
                      {place.address && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{place.address}</p>
                      )}
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {place.lat.toFixed(4)}°, {place.lng.toFixed(4)}°
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Locations securely stored in Firestore user subcollection.</span>
          </div>
          <button
            id="done-location-picker-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
