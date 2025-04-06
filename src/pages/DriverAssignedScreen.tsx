import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  Linking,
  Alert
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, CustomMarker, RoutePolyline } from '../components/maps';
import { CUSTOM_MAP_STYLE } from './Home';
import DriverFeedback from './DriverFeedback';

interface DriverAssignedScreenProps {
  pickup: string;
  destination: string;
  pickupCoordinates: { latitude: number; longitude: number };
  destinationCoordinates: { latitude: number; longitude: number };
  routePolyline: string;
  onClose: () => void;
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

const DriverAssignedScreen: React.FC<DriverAssignedScreenProps> = ({
  pickup,
  destination,
  pickupCoordinates,
  destinationCoordinates,
  routePolyline,
  onClose
}) => {
  const [driverCoordinates, setDriverCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const [eta, setEta] = useState("5 min");
  const [countdown, setCountdown] = useState(10); // 10 seconds instead of 300
  const [isAtPickup, setIsAtPickup] = useState(true);
  const [destinationCountdown, setDestinationCountdown] = useState(20); // 20 seconds for destination
  const [currentScreen, setCurrentScreen] = useState('driver');

  // Generate random driver location near pickup
  useEffect(() => {
    if (pickupCoordinates) {
      // Random offset between -0.01 and 0.01 (approximately 1 km)
      const latOffset = (Math.random() - 0.5) * 0.02;
      const lngOffset = (Math.random() - 0.5) * 0.02;
      
      setDriverCoordinates({
        latitude: pickupCoordinates.latitude + latOffset,
        longitude: pickupCoordinates.longitude + lngOffset
      });
    }
  }, [pickupCoordinates]);

  // Modify the countdown timer useEffect
  useEffect(() => {
    if (isAtPickup && countdown <= 0) {
      // When pickup countdown ends, switch to destination phase
      setIsAtPickup(false);
      return;
    }
    
    if (!isAtPickup && destinationCountdown <= 0) {
      // When destination countdown ends, show the completion dialog
      Alert.alert(
        "Arrived at Destination",
        "You have reached your destination. Thank you for riding with us!",
        [
          {
            text: "Leave Feedback",
            onPress: () => setCurrentScreen('feedback')
          },
          {
            text: "Exit",
            onPress: onClose
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
  }, [countdown, destinationCountdown, isAtPickup]);

  // Update the format countdown function
  const formatCountdown = () => {
    const timeValue = isAtPickup ? countdown : destinationCountdown;
    return `${timeValue} sec`;
  };

  // Calculate region to show all markers
  const mapRegion = React.useMemo(() => {
    if (!pickupCoordinates || !destinationCoordinates || !driverCoordinates) {
      return {
        latitude: 3.1390,
        longitude: 101.6869,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
    
    // Calculate center and span to include all three points
    const minLat = Math.min(pickupCoordinates.latitude, destinationCoordinates.latitude, driverCoordinates.latitude);
    const maxLat = Math.max(pickupCoordinates.latitude, destinationCoordinates.latitude, driverCoordinates.latitude);
    const minLng = Math.min(pickupCoordinates.longitude, destinationCoordinates.longitude, driverCoordinates.longitude);
    const maxLng = Math.max(pickupCoordinates.longitude, destinationCoordinates.longitude, driverCoordinates.longitude);
    
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    
    // Add padding
    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;
    
    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(0.02, latDelta),
      longitudeDelta: Math.max(0.02, lngDelta),
    };
  }, [pickupCoordinates, destinationCoordinates, driverCoordinates]);

  // Update header title based on phase
  const headerTitle = isAtPickup ? "Driver on the way" : "On route to destination";

  return (
    <>
      {currentScreen === 'driver' && (
        <ScrollView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <View style={styles.etaContainer}>
              <Text style={styles.etaText}>ETA: {formatCountdown()}</Text>
            </View>
          </View>

          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              style={styles.map}
              region={mapRegion}
              customMapStyle={CUSTOM_MAP_STYLE}
            >
              {pickupCoordinates && (
                <CustomMarker
                  coordinate={pickupCoordinates}
                  title="Pickup Location"
                  description={pickup}
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
              
              {driverCoordinates && (
                <Marker
                  coordinate={driverCoordinates}
                  title="Driver Location"
                  description={`${DRIVER.name} - ${DRIVER.car}`}
                  pinColor="green"
                />
              )}
              
              {routePolyline && (
                <RoutePolyline
                  encodedPolyline={routePolyline}
                  strokeColor="#0066ff"
                  strokeWidth={6}
                />
              )}
            </MapView>
          </View>

          {/* Driver details */}
          <View style={styles.driverCard}>
            <View style={styles.driverHeader}>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{DRIVER.name}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingIcon}>⭐</Text>
                  <Text style={styles.ratingText}>{DRIVER.rating}</Text>
                </View>
              </View>
              <View style={styles.carInfo}>
                <Text style={styles.carModel}>{DRIVER.car}</Text>
                <Text style={styles.carPlate}>{DRIVER.plateNumber}</Text>
              </View>
            </View>
            
            <View style={styles.contactActions}>
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => Linking.openURL(`tel:${DRIVER.phone}`)}
              >
                <Text style={styles.contactButtonIcon}>📞</Text>
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => alert('Message sent to driver')}
              >
                <Text style={styles.contactButtonIcon}>💬</Text>
                <Text style={styles.contactButtonText}>Message</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => setCurrentScreen('feedback')}
              >
                <Text style={styles.contactButtonIcon}>⭐</Text>
                <Text style={styles.contactButtonText}>Feedback</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => {
                  Alert.alert(
                    "Cancel Booking",
                    "Are you sure you want to cancel this ride?",
                    [
                      {
                        text: "No",
                        style: "cancel"
                      },
                      { 
                        text: "Yes", 
                        onPress: () => {
                          Alert.alert("Booking Canceled", "Your ride has been canceled successfully");
                          onClose();
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.contactButtonIcon}>❌</Text>
                <Text style={styles.contactButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Trip details */}
          <View style={styles.tripDetails}>
            <View style={styles.locationItem}>
              <Text style={styles.locationLabel}>PICKUP</Text>
              <Text style={styles.locationText}>{pickup}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.locationItem}>
              <Text style={styles.locationLabel}>DESTINATION</Text>
              <Text style={styles.locationText}>{destination}</Text>
            </View>
          </View>
        </ScrollView>
      )}
      
      {currentScreen === 'feedback' && (
        <DriverFeedback
          driverName={DRIVER.name}
          carModel={DRIVER.car}
          plateNumber={DRIVER.plateNumber}
          driverRating={DRIVER.rating}
          onSubmit={(rating, comment) => {
            Alert.alert("Thank You!", "Your feedback has been submitted.");
            setCurrentScreen('driver');
          }}
          onCancel={() => setCurrentScreen('driver')}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
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
  mapContainer: {
    height: 250,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  driverCard: {
    margin: 16,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 14,
  },
  carInfo: {
    alignItems: 'flex-end',
  },
  carModel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  carPlate: {
    color: '#aaa',
    fontSize: 14,
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 2,
    backgroundColor: '#2c3e50',
    borderRadius: 8,
  },
  contactButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  tripDetails: {
    margin: 16,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
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
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 12,
  },
  carMarkerContainer: {
    backgroundColor: 'rgba(46, 204, 113, 0.9)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  carMarkerIcon: {
    fontSize: 20,
  },
});

export default DriverAssignedScreen; 