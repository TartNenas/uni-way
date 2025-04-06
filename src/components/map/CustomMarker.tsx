import React from 'react';
import { Platform } from 'react-native';
import { Marker } from 'react-native-maps';

interface CustomMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description?: string;
  color?: string;
  type?: 'pickup' | 'destination';
}

// On web, use a simple wrapper component
const CustomMarker: React.FC<CustomMarkerProps> = ({
  coordinate,
  title,
  description,
  color = '#3498db',
  type = 'pickup',
}) => {
  // Use native pin on all platforms for simplicity and reliability
  return (
    <Marker
      coordinate={coordinate}
      title={title}
      description={description}
      pinColor={type === 'pickup' ? '#3498db' : '#e74c3c'}
    />
  );
};

export default CustomMarker; 