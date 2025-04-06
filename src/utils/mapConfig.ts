// Google Maps Configuration
import * as Location from 'expo-location';

// API Keys
export const GOOGLE_MAPS_API_KEY = 'AIzaSyD16iZPW3YVJ5gKCO8XmcjWa8AfuhinDnQ';  // Replace with your actual API key

// Default region (Kuala Lumpur)
export const DEFAULT_REGION = {
  latitude: 3.1390,
  longitude: 101.6869,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Dark mode map style - already defined in Home.tsx
export { CUSTOM_MAP_STYLE } from '../pages/Home';

// Map utilities
export const geocodeAddress = async (address: string) => {
  try {
    console.log(`Attempting to geocode address: ${address}`);
    
    // Try using Expo Location first
    try {
      const locations = await Location.geocodeAsync(address);
      
      console.log(`Expo geocoding results:`, locations);
      
      if (locations && locations.length > 0) {
        const { latitude, longitude } = locations[0];
        const addressInfo = await reverseGeocode(latitude, longitude);
        
        console.log(`Successfully geocoded with Expo: ${latitude}, ${longitude}`);
        
        return {
          latitude,
          longitude,
          address: addressInfo || address,
        };
      } else {
        console.log('Expo geocoding returned no results, trying Google API');
      }
    } catch (expoError) {
      console.error('Error with Expo geocoding:', expoError);
    }
    
    // Fallback to Google API if Expo geocoding fails
    try {
      // Make sure the address is properly encoded
      const encodedAddress = encodeURIComponent(address.trim());
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;
      
      console.log(`Making Google Geocoding API request for: ${address}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`Google Geocoding API response status: ${data.status}`);
      
      if (data.status === 'OK' && data.results && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        
        console.log(`Successfully geocoded with Google: ${lat}, ${lng}`);
        
        return {
          latitude: lat,
          longitude: lng,
          address: data.results[0].formatted_address,
        };
      } else {
        console.error('Google Geocoding failed:', data.status, data.error_message);
        return null;
      }
    } catch (googleError) {
      console.error('Error with Google geocoding:', googleError);
      return null;
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

export const reverseGeocode = async (latitude: number, longitude: number) => {
  try {
    // Try using Expo Location first
    const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
    
    if (addresses && addresses.length > 0) {
      const address = addresses[0];
      return `${address.name || ''} ${address.street || ''}, ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`;
    }
    
    // Fallback to Google API if Expo geocoding fails
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results[0]) {
      return data.results[0].formatted_address;
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

// Add this function to generate a mock polyline between two points
export const generateMockPolyline = (
  startLat: number, 
  startLng: number, 
  endLat: number, 
  endLng: number
): string => {
  const points = [];
  
  // Add starting point
  points.push({ latitude: startLat, longitude: startLng });
  
  // Create a more realistic route with street-like patterns
  // Calculate the midpoint
  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;
  
  // Create a zigzag pattern with at least one 90-degree turn
  // First segment: Move horizontally
  points.push({ latitude: startLat, longitude: midLng + (Math.random() * 0.005) });
  
  // Second segment: Move vertically 
  points.push({ latitude: midLat + (Math.random() * 0.005), longitude: midLng + (Math.random() * 0.005) });
  
  // Add some random points to make it look more natural
  for (let i = 0; i < 3; i++) {
    const ratio = (i + 2) / 5;
    const lat = midLat + (endLat - midLat) * ratio;
    const lng = midLng + (endLng - midLng) * ratio;
    
    // Add some variation
    const latVariation = (Math.random() - 0.5) * 0.006;
    const lngVariation = (Math.random() - 0.5) * 0.006;
    
    points.push({ latitude: lat + latVariation, longitude: lng + lngVariation });
  }
  
  // Add end point
  points.push({ latitude: endLat, longitude: endLng });
  
  // Return JSON string of points
  return JSON.stringify(points);
};

// Helper functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

function encodePoints(points: {latitude: number, longitude: number}[]): string {
  // This is a simplified encoder for our mock polyline
  return JSON.stringify(points);
}

// Update getDirections to use the mock implementation
export const getDirections = async (
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number
) => {
  try {
    // Generate mock polyline
    const mockPolyline = generateMockPolyline(startLat, startLng, destLat, destLng);
    
    // Calculate distance - add 30% to direct distance to account for non-straight paths
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(destLat - startLat);
    const dLon = deg2rad(destLng - startLng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(startLat)) * Math.cos(deg2rad(destLat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const directDistance = R * c; // Direct distance in km
    
    // Add 30% to account for winding roads
    const distance = directDistance * 1.3;
    
    // Set duration to 1 minute per km
    const durationMinutes = Math.round(distance);
    
    return {
      distance: `${distance.toFixed(1)} km`,
      duration: `${durationMinutes} min`,
      steps: [],
      polyline: mockPolyline,
    };
  } catch (error) {
    console.error('Error generating mock directions:', error);
    return null;
  }
}; 