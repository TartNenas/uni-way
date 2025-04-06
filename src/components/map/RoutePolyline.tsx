import React from 'react';
import { Polyline } from 'react-native-maps';
import polyline from '@mapbox/polyline';

interface RoutePolylineProps {
  encodedPolyline: string;
  strokeColor?: string;
  strokeWidth?: number;
}

const RoutePolyline: React.FC<RoutePolylineProps> = ({
  encodedPolyline,
  strokeColor = '#3498db',
  strokeWidth = 4,
}) => {
  // Decode the polyline
  const points = polyline.decode(encodedPolyline).map((point: number[]) => ({
    latitude: point[0],
    longitude: point[1],
  }));

  return (
    <Polyline
      coordinates={points}
      strokeColor={strokeColor}
      strokeWidth={strokeWidth}
      lineDashPattern={[0]}
    />
  );
};

export default RoutePolyline; 