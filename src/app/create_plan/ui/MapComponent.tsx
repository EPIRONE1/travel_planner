"use client"

import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Search, Save, Upload } from 'lucide-react';

const MapComponent = ({ onSavePlan, onLoadPlan, onSaveFile }) => {
  const [center, setCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Default to Paris initially
  const [searchQuery, setSearchQuery] = useState('');
  const [map, setMap] = useState(null);

  const mapStyles = {
    height: "100%",
    width: "100%",
  };

  // Geocoding function to convert place names to coordinates
  const getCoordinates = async (place) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=AIzaSyBosOmwvXAAl2z6xYy-L6D2I0agK3XpvXs`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        return data.results[0].geometry.location;
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Get user's current location and set as the map's center
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error fetching current location:', error);
          alert('Unable to retrieve your location. Using default location.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;

    const coordinates = await getCoordinates(searchQuery);
    if (coordinates) {
      setCenter({ ...coordinates, userSet: true });
      if (map) {
        map.panTo(coordinates);
        map.setZoom(13);
      }
    } else {
      alert('Location not found. Please try a different search term.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const onMapLoad = (map) => {
    setMap(map);
  };

  return (
    <div className="map-section">
      <div className="map-controls">
        <div className="map-controls-top">
          <div className="search-container">
            <Input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
        <div className="map-controls-buttons">
          <Button onClick={onSavePlan} className="save-plan-button">
            <Save className="w-4 h-4" />
            Save Plan
          </Button>
          <Button onClick={onLoadPlan} className="load-plan-button">
            <Upload className="w-4 h-4" />
            Load Plan
          </Button>
          <Button onClick={onSaveFile} className="save-as-file-button">
            <Save className="w-4 h-4" />
            Save as File
          </Button>
        </div>
      </div>
      <div className="map-container">
        <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
          <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={13}
            center={center}
            onLoad={onMapLoad}
          >
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default MapComponent;
