import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Save, Upload, Share2 } from 'lucide-react';

interface Day {
  title: string;
  activities: {
    place: string;
    time: string;
    period: string;
    activity: string;
  }[];
}

interface MapComponentProps {
  days: Day[];
  onSavePlan: () => void;
  onLoadFile: () => void;
  onLoadPlan: () => Promise<void>;
  onSaveFile: () => void;
  onShare: () => void;
  setPlace: (place: string) => void;
}

const MapComponent = ({ 
  days, 
  onSavePlan, 
  onLoadFile, 
  onLoadPlan, 
  onSaveFile, 
  setPlace, 
  onShare 
}: MapComponentProps) => {
  const [center, setCenter] = useState({ lat: 48.8566, lng: 2.3522 });
  const [searchQuery, setSearchQuery] = useState('');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  const mapStyles = {
    height: "calc(100% - 120px)",
    width: "100%",
  };

  const getCoordinates = async (place: string) => {
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

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
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

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    const latLng = event.latLng;
    if (latLng) {
      const lat = latLng.lat();
      const lng = latLng.lng();
      const address = await getAddressFromCoordinates(lat, lng);
      if (address) {
        setPlace(address);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    const coordinates = await getCoordinates(searchQuery);
    if (coordinates) {
      setCenter({ ...coordinates });
      if (map) {
        map.panTo(coordinates);
        map.setZoom(13);
      }
    } else {
      alert('Location not found. Please try a different search term.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-4 bg-white border-b">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="장소 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            검색
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={onSavePlan} variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
          <Button onClick={onSaveFile} variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            파일로 저장
          </Button>
          <Button onClick={onLoadPlan} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            불러오기
          </Button>
          <Button onClick={onLoadFile} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            파일 불러오기
          </Button>
          <Button onClick={onShare} variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            공유
          </Button>
        </div>
      </div>

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