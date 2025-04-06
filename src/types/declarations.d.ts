declare module '@mapbox/polyline';
declare module 'react-native-permissions/dist/commonjs';
declare module 'react-native-maps' {
  import { ComponentType } from 'react';
  
  export const PROVIDER_GOOGLE: string;
  export interface MapViewProps {
    provider?: string;
    style?: any;
    region?: any;
    showsUserLocation?: boolean;
    showsMyLocationButton?: boolean;
    customMapStyle?: any[];
    onPress?: (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => void;
    [key: string]: any;
  }
  
  const MapView: ComponentType<MapViewProps>;
  export const Marker: ComponentType<any>;
  export const Polyline: ComponentType<any>;
  
  export default MapView;
} 