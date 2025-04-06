// Native-specific implementation
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import CustomMarkerComponent from './map/CustomMarker';
import RoutePolylineComponent from './map/RoutePolyline';

// Re-export the components
export { PROVIDER_GOOGLE, Marker, Polyline };

// Export our custom components with consistent names
export const CustomMarker = CustomMarkerComponent;
export const RoutePolyline = RoutePolylineComponent;

export default MapView; 