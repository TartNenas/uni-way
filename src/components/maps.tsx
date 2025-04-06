import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

// Type definitions to match the native components
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface MapViewProps {
  style?: any;
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  provider?: string;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  customMapStyle?: any[];
  onPress?: (event: { nativeEvent: { coordinate: Coordinates } }) => void;
  children?: React.ReactNode;
}

interface MarkerProps {
  coordinate: Coordinates;
  title?: string;
  description?: string;
  pinColor?: string;
}

interface PolylineProps {
  coordinates: Coordinates[];
  strokeColor?: string;
  strokeWidth?: number;
  lineDashPattern?: number[];
}

interface CustomMarkerProps {
  coordinate: Coordinates;
  title: string;
  description?: string;
  color?: string;
  type?: 'pickup' | 'destination';
}

interface RoutePolylineProps {
  encodedPolyline: string;
  strokeColor?: string;
  strokeWidth?: number;
}

// Default web implementation - will be overridden on native by maps.native.tsx
const MapView: React.FC<MapViewProps> = (props) => {
  const { region, onPress, children } = props;
  const coordinate = region ? `${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}` : 'No location set';

  return (
    <View style={[styles.container, props.style]}>
      <Text style={styles.text}>Maps are optimized for mobile devices</Text>
      <Text style={styles.subText}>Coordinates: {coordinate}</Text>
      
      {onPress && (
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            // Simulate map press with dummy coordinates
            onPress({
              nativeEvent: {
                coordinate: {
                  latitude: 3.1390,
                  longitude: 101.6869
                }
              }
            });
          }}
        >
          <Text style={styles.buttonText}>Set Default Location</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Web stub components with proper props
export const Marker: React.FC<MarkerProps> = () => null;
export const Polyline: React.FC<PolylineProps> = () => null;
export const PROVIDER_GOOGLE = 'google';
export const CustomMarker: React.FC<CustomMarkerProps> = () => null;
export const RoutePolyline: React.FC<RoutePolylineProps> = () => null;

const styles = StyleSheet.create({
  container: {
    height: 250,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subText: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default MapView; 