import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Search, Save, Upload, Share2 } from 'lucide-react';

const MapComponent = ({ onSavePlan, onLoadFile, onLoadPlan, onSaveFile, setPlace, onShare }) => {
  const [center, setCenter] = useState({ lat: 48.8566, lng: 2.3522 });
  const [searchQuery, setSearchQuery] = useState('');
  const [map, setMap] = useState(null);
  
  // 지도 스타일을 컨테이너에 맞추도록 수정
  const mapStyles = {
    height: "calc(100% - 120px)", // 컨트롤 패널 높이를 고려하여 조정
    width: "100%",
  };

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

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBosOmwvXAAl2z6xYy-L6D2I0agK3XpvXs`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        return data.results[0].formatted_address;
      }
      return '';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return '';
    }
  };

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

  const handleMapClick = async (event) => {
    const { latLng } = event;
    const lat = latLng.lat();
    const lng = latLng.lng();
    const address = await getAddressFromCoordinates(lat, lng);
    if (address) {
      setPlace(address);
    }
  };

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
    <div className="h-full flex flex-col">
      {/* 컨트롤 패널 */}
      <div className="p-4 space-y-4 bg-white border-b">
        {/* 검색 영역 */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
        
        {/* 버튼 그룹 */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={onSavePlan} variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Plan
          </Button>
          <Button onClick={onSaveFile} variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save as File
          </Button>
          <Button onClick={onLoadPlan} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Load Plan
          </Button>
          <Button onClick={onLoadFile} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Load File
          </Button>
          <Button onClick={onShare} variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* 지도 컨테이너 */}
      <div className="flex-1 relative">
        <LoadScript googleMapsApiKey="AIzaSyBosOmwvXAAl2z6xYy-L6D2I0agK3XpvXs">
          <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={13}
            center={center}
            onLoad={onMapLoad}
            onClick={handleMapClick}
          />
        </LoadScript>
      </div>
    </div>
  );
};

export default MapComponent;