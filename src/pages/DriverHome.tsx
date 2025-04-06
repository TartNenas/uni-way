import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Switch, Dimensions, Platform, Alert, ActivityIndicator
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, CustomMarker } from '../components/maps';
import { CUSTOM_MAP_STYLE } from './Home';
import * as Location from 'expo-location';

interface DriverHomeProps {
  onLogout: () => void;
  onAcceptRide: (rideData: any) => void;
}

const { width } = Dimensions.get('window');

// Mock driver data
const DRIVER = {
  name: "Ahmad",
  rating: 4.8,
  car: "Proton Saga",
  plateNumber: "WTU 4231",
  phone: "+6012345678"
};

// Define interface for ride requests
interface RideRequest {
  id: string;
  pickupLocation: string;
  pickupCoordinates: { latitude: number; longitude: number };
  destination: string;
  destinationCoordinates: { latitude: number; longitude: number };
  distance: string;
  duration: string;
  fare: string;
  passengerName: string;
  passengerRating: number;
}

// Then use the interface to type your array
const MOCK_RIDE_REQUESTS: RideRequest[] = [
  {
    id: 'req-1',
    pickupLocation: 'Sunway University',
    pickupCoordinates: { latitude: 3.0669, longitude: 101.6035 },
    destination: 'Sunway Pyramid',
    destinationCoordinates: { latitude: 3.0728, longitude: 101.6092 },
    distance: '1.5 km',
    duration: '8 min',
    fare: 'RM12.00',
    passengerName: 'John',
    passengerRating: 4.7
  },
  {
    id: 'req-2',
    pickupLocation: 'KLCC',
    pickupCoordinates: { latitude: 3.1588, longitude: 101.7142 },
    destination: 'KL Tower',
    destinationCoordinates: { latitude: 3.1525, longitude: 101.7033 },
    distance: '2.3 km',
    duration: '12 min',
    fare: 'RM15.50',
    passengerName: 'Sarah',
    passengerRating: 4.9
  }
];

const DriverHome: React.FC<DriverHomeProps> = ({ onLogout, onAcceptRide }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRideRequests, setActiveRideRequests] = useState<RideRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [acceptedRide, setAcceptedRide] = useState<RideRequest | null>(null);
  const [countdown, setCountdown] = useState(10); // 10 seconds for pickup
  const [destinationCountdown, setDestinationCountdown] = useState(20); // 20 seconds for destination
  const [isAtPickup, setIsAtPickup] = useState(true);

  // Get driver's current location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required for driver mode.');
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        
        const { latitude, longitude } = position.coords;
        setDriverLocation({ latitude, longitude });
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Unable to get your current location.');
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  // Toggle online status and simulate ride requests
  useEffect(() => {
    if (isOnline) {
      // Simulate incoming ride requests when driver goes online
      const timer = setTimeout(() => {
        setActiveRideRequests(MOCK_RIDE_REQUESTS);
        // Auto-select the first request
        setSelectedRequest(MOCK_RIDE_REQUESTS[0].id);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setActiveRideRequests([]);
      setSelectedRequest(null);
    }
  }, [isOnline]);

  // Handle accepting a ride
  const handleAcceptRide = (rideId: string) => {
    const rideRequest = activeRideRequests.find(request => request.id === rideId);
    
    if (!rideRequest) {
      Alert.alert('Error', 'Ride request not found.');
      return;
    }
    
    // Store the accepted ride
    setAcceptedRide(rideRequest);
    
    Alert.alert('Ride Accepted', `You've accepted the ride to ${rideRequest.destination}.`);
    
    // Navigate to the ride screen
    onAcceptRide(rideRequest);
    
    // Clear other ride requests
    setActiveRideRequests([]);
    setSelectedRequest(null);
  };

  const handleRejectRide = (rideId: string) => {
    // Remove the rejected ride request
    setActiveRideRequests(prev => prev.filter(request => request.id !== rideId));
    setSelectedRequest(activeRideRequests.length > 1 ? activeRideRequests[1].id : null);
  };

  const toggleOnlineStatus = () => {
    if (!isOnline) {
      if (!driverLocation) {
        Alert.alert('Error', 'Unable to determine your location. Please try again.');
        return;
      }
      
      setIsOnline(true);
    } else {
      Alert.alert(
        'Go Offline',
        'Are you sure you want to go offline? You will not receive new ride requests.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Go Offline',
            onPress: () => setIsOnline(false),
          }
        ]
      );
    }
  };

  // Add this useEffect for the countdown timer when a ride is accepted
  useEffect(() => {
    if (!acceptedRide) return;
    
    if (isAtPickup && countdown <= 0) {
      // When pickup countdown ends, switch to destination phase
      setIsAtPickup(false);
      return;
    }
    
    if (!isAtPickup && destinationCountdown <= 0) {
      // When destination countdown ends, show completion
      Alert.alert(
        "Ride Completed",
        "You have reached the destination and completed the ride!",
        [
          {
            text: "OK",
            onPress: () => {
              setAcceptedRide(null);
              setIsAtPickup(true);
              setCountdown(10);
              setDestinationCountdown(20);
            }
          }
        ]
      );
      return;
    }
    
    const timer = setInterval(() => {
      if (isAtPickup) {
        setCountdown(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            clearInterval(timer);
            return 0;
          }
          return newValue;
        });
      } else {
        setDestinationCountdown(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            clearInterval(timer);
            return 0;
          }
          return newValue;
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown, destinationCountdown, isAtPickup, acceptedRide]);

  // Add this helper function to format the countdown
  const formatCountdown = () => {
    const timeValue = isAtPickup ? countdown : destinationCountdown;
    return `${timeValue} sec`;
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Driver Dashboard</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#2ecc71' : '#e74c3c' }]} />
            <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          region={
            acceptedRide ? {
              latitude: (acceptedRide.pickupCoordinates.latitude + 
                        acceptedRide.destinationCoordinates.latitude) / 2,
              longitude: (acceptedRide.pickupCoordinates.longitude + 
                         acceptedRide.destinationCoordinates.longitude) / 2,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            } : 
            driverLocation ? {
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            } : {
              latitude: 3.1390,
              longitude: 101.6869,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }
          }
          customMapStyle={CUSTOM_MAP_STYLE}
        >
          {driverLocation && (
            <Marker
              coordinate={driverLocation}
              title="Your Location"
              pinColor="#3498db"
            />
          )}
          
          {acceptedRide && (
            <>
              <CustomMarker
                coordinate={acceptedRide.pickupCoordinates}
                title="Pickup"
                description={acceptedRide.pickupLocation}
                color="#2ecc71"
                type="pickup"
              />
              <CustomMarker
                coordinate={acceptedRide.destinationCoordinates}
                title="Destination"
                description={acceptedRide.destination}
                color="#e74c3c"
                type="destination"
              />
              {driverLocation && (
                <Polyline
                  coordinates={[
                    driverLocation,
                    acceptedRide.pickupCoordinates,
                  ]}
                  strokeColor="#3498db"
                  strokeWidth={4}
                  lineDashPattern={[1, 3]}
                />
              )}
            </>
          )}
          
          {!acceptedRide && selectedRequest && activeRideRequests.map(request => (
            request.id === selectedRequest && (
              <React.Fragment key={request.id}>
                <CustomMarker
                  coordinate={request.pickupCoordinates}
                  title="Pickup"
                  description={request.pickupLocation}
                  color="#2ecc71"
                  type="pickup"
                />
                <CustomMarker
                  coordinate={request.destinationCoordinates}
                  title="Destination"
                  description={request.destination}
                  color="#e74c3c"
                  type="destination"
                />
              </React.Fragment>
            )
          ))}
        </MapView>
      </View>

      {/* Online toggle */}
      <View style={styles.onlineToggleContainer}>
        <Text style={styles.onlineToggleText}>
          {isOnline ? 'You are online and receiving ride requests' : 'Go online to receive ride requests'}
        </Text>
        <Switch
          value={isOnline}
          onValueChange={toggleOnlineStatus}
          trackColor={{ false: '#767577', true: '#2ecc71' }}
          thumbColor={isOnline ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* Accepted Ride Details */}
      {acceptedRide && (
        <View style={styles.acceptedRideContainer}>
          <View style={styles.acceptedRideHeader}>
            <Text style={styles.sectionTitle}>
              {isAtPickup ? "Heading to pickup" : "Heading to destination"}
            </Text>
            <View style={styles.etaContainer}>
              <Text style={styles.etaText}>ETA: {formatCountdown()}</Text>
            </View>
          </View>
          
          <View style={styles.acceptedRideDetails}>
            <View style={styles.locationItem}>
              <Text style={styles.locationLabel}>PASSENGER</Text>
              <Text style={styles.locationText}>{acceptedRide.passengerName}</Text>
            </View>
            <View style={styles.locationItem}>
              <Text style={styles.locationLabel}>
                {isAtPickup ? "PICKUP" : "CURRENT"}
              </Text>
              <Text style={styles.locationText}>{acceptedRide.pickupLocation}</Text>
            </View>
            <View style={styles.locationItem}>
              <Text style={styles.locationLabel}>DESTINATION</Text>
              <Text style={styles.locationText}>{acceptedRide.destination}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Ride Requests */}
      {isOnline && !acceptedRide && activeRideRequests.length > 0 && (
        <View style={styles.rideRequestsContainer}>
          <Text style={styles.sectionTitle}>
            {activeRideRequests.length} Ride Request{activeRideRequests.length !== 1 ? 's' : ''} Available
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {activeRideRequests.map(request => (
              <TouchableOpacity 
                key={request.id}
                style={[
                  styles.rideRequestCard,
                  selectedRequest === request.id && styles.selectedRideRequest
                ]}
                onPress={() => setSelectedRequest(request.id)}
              >
                <View style={styles.rideRequestHeader}>
                  <Text style={styles.passengerName}>{request.passengerName}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingIcon}>⭐</Text>
                    <Text style={styles.ratingText}>{request.passengerRating}</Text>
                  </View>
                </View>
                
                <View style={styles.rideDetails}>
                  <View style={styles.locationItem}>
                    <Text style={styles.locationLabel}>FROM</Text>
                    <Text style={styles.locationText}>{request.pickupLocation}</Text>
                  </View>
                  
                  <View style={styles.locationItem}>
                    <Text style={styles.locationLabel}>TO</Text>
                    <Text style={styles.locationText}>{request.destination}</Text>
                  </View>
                </View>
                
                <View style={styles.rideInfoRow}>
                  <Text style={styles.rideInfoText}>{request.distance}</Text>
                  <Text style={styles.rideInfoText}>{request.duration}</Text>
                  <Text style={styles.rideInfoText}>{request.fare}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Accept/Decline Buttons */}
      {isOnline && !acceptedRide && selectedRequest && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.declineButton}
            onPress={() => handleRejectRide(selectedRequest)}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleAcceptRide(selectedRequest)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* No rides message */}
      {isOnline && !acceptedRide && activeRideRequests.length === 0 && (
        <View style={styles.noRidesContainer}>
          <Text style={styles.noRidesText}>
            Waiting for ride requests...
          </Text>
          <ActivityIndicator size="small" color="#3498db" style={styles.waitingIndicator} />
        </View>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}
      
      {/* Add extra padding at the bottom */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: '#aaa',
    fontSize: 14,
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
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  onlineToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
  },
  onlineToggleText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  acceptedRideContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
  },
  acceptedRideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  etaContainer: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  etaText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  acceptedRideDetails: {
    marginTop: 8,
  },
  rideRequestsContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  rideRequestCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    width: width - 80,
    marginRight: 12,
    marginBottom: 8,
  },
  selectedRideRequest: {
    borderColor: '#3498db',
    borderWidth: 2,
  },
  rideRequestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 16,
    marginRight: 4,
    color: '#FFD700',
  },
  ratingText: {
    color: '#fff',
    fontSize: 14,
  },
  rideDetails: {
    marginBottom: 12,
  },
  locationItem: {
    marginBottom: 8,
  },
  locationLabel: {
    color: '#3498db',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 16,
    color: '#fff',
  },
  rideInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  rideInfoText: {
    color: '#aaa',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 40,
  },
  declineButton: {
    backgroundColor: '#2c3e50',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  acceptButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noRidesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  noRidesText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  waitingIndicator: {
    marginBottom: 30,
  },
  bottomPadding: {
    height: 70,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  }
});

export default DriverHome; 