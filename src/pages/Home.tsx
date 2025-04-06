import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  Alert,
  Linking
} from 'react-native';
import * as Location from 'expo-location';
import { getCurrentUser } from '../utils/authStorage';
import { 
  DEFAULT_REGION, 
  GOOGLE_MAPS_API_KEY, 
  geocodeAddress,
  reverseGeocode,
  getDirections 
} from '../utils/mapConfig';

// Import map components - will automatically use the right version for each platform
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, CustomMarker, RoutePolyline } from '../components/maps';

interface HomeProps {
  onLogout: () => void;
  onBookRide: (data: any) => void;
}

interface Location {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface RouteInfo {
  distance: string;
  duration: string;
  polyline: string;
}

const { width } = Dimensions.get('window');

const RIDE_TYPES = [
  { id: 1, name: 'Economy', multiplier: 1.0, icon: '🚗', eta: '3 min', baseFare: 5 },
  { id: 2, name: 'Premium', multiplier: 1.2, icon: '🚙', eta: '5 min', baseFare: 7 },
  { id: 3, name: 'Family', multiplier: 1.75, icon: '🚐', eta: '7 min', baseFare: 10 },
];

const POPULAR_DESTINATIONS = [
  { 
    id: 1, 
    name: 'Sunway University',
    coordinates: { latitude: 3.0669, longitude: 101.6035 }
  },
  { 
    id: 2, 
    name: 'KLCC Mall',
    coordinates: { latitude: 3.1577, longitude: 101.7122 }
  },
  { 
    id: 3, 
    name: 'KL Tower',
    coordinates: { latitude: 3.1529, longitude: 101.7042 }
  },
  { 
    id: 4, 
    name: 'KLIA',
    coordinates: { latitude: 2.7446, longitude: 101.7093 }
  },
];

// Custom dark style for Google Maps
export const CUSTOM_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];

// Replace the decodePolyline function with this:
const decodePolyline = (encoded: string): {latitude: number, longitude: number}[] => {
  try {
    // Parse our mock format
    return JSON.parse(encoded);
  } catch (e) {
    console.error('Failed to decode polyline:', e);
    return [];
  }
};

// Add a function to calculate price based on distance
const calculatePrice = (distanceText: string, rideType: number): string => {
  // Extract numeric distance from string like "17.4 km"
  const distanceMatch = distanceText.match(/(\d+\.\d+|\d+)/);
  if (!distanceMatch) return `RM${RIDE_TYPES.find(r => r.id === rideType)?.baseFare.toFixed(2) || '5.00'}`;
  
  const distance = parseFloat(distanceMatch[0]);
  const selectedRide = RIDE_TYPES.find(r => r.id === rideType);
  
  if (!selectedRide) return 'RM5.00';
  
  // Calculate price: base fare + distance-based fare, then apply multiplier
  const baseFare = selectedRide.baseFare;
  const distanceFare = distance * 1.0; // RM1 per km
  const totalFare = (baseFare + distanceFare) * selectedRide.multiplier;
  
  // Format to RM with 2 decimal places
  return `RM${totalFare.toFixed(2)}`;
};

const Home: React.FC<HomeProps> = ({ onLogout, onBookRide }) => {
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState('');
  const [pickup, setPickup] = useState('');
  const [selectedRideType, setSelectedRideType] = useState(1);
  const [currentLocation, setCurrentLocation] = useState<Location>(DEFAULT_REGION);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [pickupCoordinates, setPickupCoordinates] = useState<Coordinates | null>(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState<Coordinates | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [destinationDistances, setDestinationDistances] = useState<{[key: number]: string}>({});

  // Add this function to get prices for each ride type
  const getPrices = (): { [key: number]: string } => {
    const prices: { [key: number]: string } = {};
    
    if (routeInfo && routeInfo.distance) {
      RIDE_TYPES.forEach(ride => {
        prices[ride.id] = calculatePrice(routeInfo.distance, ride.id);
      });
    } else {
      // Default prices when no route is selected
      RIDE_TYPES.forEach(ride => {
        prices[ride.id] = `RM${ride.baseFare.toFixed(2)}`;
      });
    }
    
    return prices;
  };
  
  // Add state to track ride prices
  const [ridePrices, setRidePrices] = useState<{[key: number]: string}>({});
  
  // Update prices when route changes
  useEffect(() => {
    setRidePrices(getPrices());
  }, [routeInfo]);

  // Add a function to calculate distances to popular destinations
  const calculateDistancesToDestinations = async (userLat: number, userLng: number) => {
    const distances: {[key: number]: string} = {};
    
    for (const dest of POPULAR_DESTINATIONS) {
      try {
        const route = await getDirections(
          userLat, 
          userLng, 
          dest.coordinates.latitude, 
          dest.coordinates.longitude
        );
        
        if (route) {
          distances[dest.id] = route.distance;
        } else {
          // Fallback to a simple calculation if route API fails
          const distKm = calculateSimpleDistance(
            userLat, 
            userLng, 
            dest.coordinates.latitude, 
            dest.coordinates.longitude
          );
          distances[dest.id] = `${distKm.toFixed(1)} km`;
        }
      } catch (error) {
        console.error(`Error calculating distance to ${dest.name}:`, error);
        // Fallback calculation
        const distKm = calculateSimpleDistance(
          userLat, 
          userLng, 
          dest.coordinates.latitude, 
          dest.coordinates.longitude
        );
        distances[dest.id] = `${distKm.toFixed(1)} km`;
      }
    }
    
    setDestinationDistances(distances);
  };
  
  // Simple distance calculation using Haversine formula
  const calculateSimpleDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  // Get current position
  const getCurrentPosition = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this app properly.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const { latitude, longitude } = position.coords;
      setCurrentLocation({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setPickupCoordinates({ latitude, longitude });
      
      // Reverse geocode to get address
      const address = await reverseGeocode(latitude, longitude);
      if (address) {
        setPickup(address);
      }
      
      // Calculate distances to popular destinations
      calculateDistancesToDestinations(latitude, longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your current location.');
    }
  };

  // Search destination coordinates
  const searchDestination = async () => {
    if (!destination || destination.trim().length < 3) {
      Alert.alert('Error', 'Please enter a valid destination address (at least 3 characters)');
      return;
    }
    
    setIsSearchingAddress(true);
    try {
      // Check if the destination is one of the popular destinations
      const popularDest = POPULAR_DESTINATIONS.find(
        dest => dest.name.toLowerCase() === destination.toLowerCase()
      );
      
      // If it's a popular destination, use a more specific query
      const searchQuery = popularDest 
        ? `${popularDest.name}, Kuala Lumpur, Malaysia` 
        : `${destination}, Malaysia`;
      
      console.log(`Searching for destination: ${searchQuery}`);
      
      const result = await geocodeAddress(searchQuery);
      if (result) {
        setDestinationCoordinates({
          latitude: result.latitude,
          longitude: result.longitude,
        });
        setDestination(result.address);
        
        // Get route if pickup coordinates exist
        if (pickupCoordinates) {
          getRoute(
            pickupCoordinates.latitude,
            pickupCoordinates.longitude,
            result.latitude,
            result.longitude
          );
        }
      } else {
        console.error('Geocoding returned null result');
        Alert.alert(
          'Address Not Found', 
          'Could not find the destination address. Please try a more specific address or select from popular destinations.'
        );
      }
    } catch (error) {
      console.error('Error searching destination:', error);
      Alert.alert('Error', 'An error occurred while searching for the destination. Please try again.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Get route between pickup and destination
  const getRoute = async (startLat: number, startLng: number, destLat: number, destLng: number) => {
    try {
      const route = await getDirections(startLat, startLng, destLat, destLng);
      if (route) {
        setRouteInfo(route);
      }
    } catch (error) {
      console.error('Error getting route:', error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserName(user.name);
        }
        await getCurrentPosition();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Updated handle book ride
  const handleBookRide = () => {
    if (!pickup || !destination) {
      Alert.alert('Error', 'Please enter pickup and destination locations');
      return;
    }
    
    if (!pickupCoordinates || !destinationCoordinates) {
      Alert.alert('Error', 'Could not determine coordinates for pickup or destination');
      return;
    }
    
    const selectedRide = RIDE_TYPES.find(r => r.id === selectedRideType);
    const currentPrice = ridePrices[selectedRideType] || `RM${selectedRide?.baseFare.toFixed(2) || '5.00'}`;
    
    // Navigate to booking confirmation page with all required data
    onBookRide({
      pickup,
      destination,
      rideType: selectedRide?.name || '',
      price: currentPrice,
      distance: routeInfo?.distance || '',
      duration: routeInfo?.duration || '',
      pickupCoordinates,
      destinationCoordinates,
      routePolyline: routeInfo?.polyline || ''
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hello, {userName}!</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          region={currentLocation}
          showsUserLocation={true}
          showsMyLocationButton={true}
          customMapStyle={CUSTOM_MAP_STYLE}
          onPress={(e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
            // Set destination by tapping on map
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setDestinationCoordinates({ latitude, longitude });
            reverseGeocode(latitude, longitude).then(address => {
              if (address) setDestination(address);
            });
            
            if (pickupCoordinates) {
              getRoute(
                pickupCoordinates.latitude,
                pickupCoordinates.longitude,
                latitude,
                longitude
              );
            }
          }}
        >
          {pickupCoordinates && (
            <CustomMarker
              coordinate={pickupCoordinates}
              title="Pickup Location"
              description={pickup || "Your current location"}
              color="#3498db"
              type="pickup"
            />
          )}
          
          {destinationCoordinates && (
            <CustomMarker
              coordinate={destinationCoordinates}
              title="Destination"
              description={destination}
              color="#e74c3c"
              type="destination"
            />
          )}
          
          {routeInfo && routeInfo.polyline && (
            <RoutePolyline
              encodedPolyline={routeInfo.polyline}
              strokeColor="#0066ff"
              strokeWidth={6}
            />
          )}
        </MapView>
        
        {isSearchingAddress && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3498db" />
          </View>
        )}
        
        {routeInfo && (
          <View style={styles.mapRouteInfoOverlay}>
            <View style={styles.mapRouteInfoCard}>
              <Text style={styles.mapRouteInfoTime}>{routeInfo.duration}</Text>
              <Text style={styles.mapRouteInfoDistance}>{routeInfo.distance}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Location inputs - Updated */}
      <View style={styles.locationContainer}>
        <View style={styles.locationInputWrapper}>
          <Text style={styles.locationLabel}>PICKUP</Text>
          <TextInput
            style={styles.locationInput}
            placeholder="Enter pickup location"
            placeholderTextColor="#888"
            value={pickup}
            onChangeText={setPickup}
            onSubmitEditing={async () => {
              if (pickup) {
                setIsSearchingAddress(true);
                try {
                  const result = await geocodeAddress(pickup);
                  if (result) {
                    setPickupCoordinates({
                      latitude: result.latitude,
                      longitude: result.longitude,
                    });
                    setPickup(result.address);
                    setCurrentLocation({
                      latitude: result.latitude,
                      longitude: result.longitude,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    });
                    
                    if (destinationCoordinates) {
                      getRoute(
                        result.latitude,
                        result.longitude,
                        destinationCoordinates.latitude,
                        destinationCoordinates.longitude
                      );
                    }
                  }
                } finally {
                  setIsSearchingAddress(false);
                }
              }
            }}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.locationInputWrapper}>
          <Text style={styles.locationLabel}>DESTINATION</Text>
          <TextInput
            style={styles.locationInput}
            placeholder="Where to?"
            placeholderTextColor="#888"
            value={destination}
            onChangeText={setDestination}
            onSubmitEditing={searchDestination}
          />
        </View>
      </View>

      {/* Show route information if available */}
      {routeInfo && (
        <View style={styles.routeInfoContainer}>
          <Text style={styles.routeInfoText}>Distance: {routeInfo.distance}</Text>
          <Text style={styles.routeInfoText}>ETA: {routeInfo.duration}</Text>
        </View>
      )}

      {/* Ride types - Unchanged */}
      <Text style={styles.sectionTitle}>Select ride type</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.rideTypesContainer}
      >
        {RIDE_TYPES.map(ride => (
          <TouchableOpacity
            key={ride.id}
            style={[
              styles.rideTypeCard,
              selectedRideType === ride.id && styles.selectedRideType
            ]}
            onPress={() => setSelectedRideType(ride.id)}
          >
            <Text style={styles.rideTypeIcon}>{ride.icon}</Text>
            <Text style={styles.rideTypeName}>{ride.name}</Text>
            <Text style={styles.rideTypePrice}>
              {ridePrices[ride.id] || `RM${ride.baseFare.toFixed(2)}`}
            </Text>
            <Text style={styles.rideTypeEta}>ETA: {ride.eta}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Popular destinations with dynamic distances */}
      <Text style={styles.sectionTitle}>Popular destinations</Text>
      <View style={styles.popularDestinationsContainer}>
        {POPULAR_DESTINATIONS.map(dest => (
          <TouchableOpacity
            key={dest.id}
            style={styles.destinationCard}
            onPress={() => {
              setDestination(dest.name);
              // Use predefined coordinates
              setDestinationCoordinates(dest.coordinates);
              setIsSearchingAddress(true);
              
              // Try to get a proper address for display
              reverseGeocode(dest.coordinates.latitude, dest.coordinates.longitude)
                .then(address => {
                  if (address) {
                    setDestination(address);
                  }
                  
                  // Get route if pickup coordinates exist
                  if (pickupCoordinates) {
                    // Update the map to show both locations
                    setCurrentLocation({
                      latitude: (pickupCoordinates.latitude + dest.coordinates.latitude) / 2,
                      longitude: (pickupCoordinates.longitude + dest.coordinates.longitude) / 2,
                      latitudeDelta: 0.15, // Increased to show more area
                      longitudeDelta: 0.15,
                    });
                    
                    // Calculate route
                    getRoute(
                      pickupCoordinates.latitude,
                      pickupCoordinates.longitude,
                      dest.coordinates.latitude,
                      dest.coordinates.longitude
                    );
                  }
                })
                .catch(error => {
                  console.error('Error reverse geocoding popular destination:', error);
                })
                .finally(() => {
                  setIsSearchingAddress(false);
                });
            }}
          >
            <Text style={styles.destinationName}>{dest.name}</Text>
            <Text style={styles.destinationDistance}>
              {destinationDistances[dest.id] || 'Calculating...'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Book ride button */}
      <TouchableOpacity 
        style={[
          styles.bookButton,
          (!pickupCoordinates || !destinationCoordinates) && styles.disabledButton
        ]} 
        onPress={handleBookRide}
        disabled={!pickupCoordinates || !destinationCoordinates}
      >
        <Text style={styles.bookButtonText}>Book Ride</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutText: {
    color: '#3498db',
    fontSize: 14,
  },
  mapContainer: {
    height: 250,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    margin: 16,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
  },
  locationInputWrapper: {
    marginBottom: 8,
  },
  locationLabel: {
    color: '#3498db',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  locationInput: {
    fontSize: 16,
    color: '#fff',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 8,
  },
  routeInfoContainer: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeInfoText: {
    color: '#3498db',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  rideTypesContainer: {
    paddingHorizontal: 8,
  },
  rideTypeCard: {
    width: width / 3 - 24,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  selectedRideType: {
    backgroundColor: '#2c3e50',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  rideTypeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  rideTypeName: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rideTypePrice: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  rideTypeEta: {
    color: '#3498db',
    fontSize: 12,
  },
  popularDestinationsContainer: {
    padding: 16,
  },
  destinationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  destinationName: {
    color: '#fff',
    fontSize: 16,
  },
  destinationDistance: {
    color: '#888',
    fontSize: 14,
  },
  bookButton: {
    backgroundColor: '#3498db',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#333',
    opacity: 0.7,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mapRouteInfoOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    alignItems: 'center',
  },
  mapRouteInfoCard: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapRouteInfoTime: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  mapRouteInfoDistance: {
    color: '#cccccc',
    fontSize: 14,
  },
});

export default Home; 