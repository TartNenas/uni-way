import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, CustomMarker, RoutePolyline } from '../components/maps';
import { CUSTOM_MAP_STYLE } from './Home';
import PaymentScreen from './PaymentScreen';

interface BookingConfirmationProps {
  pickup: string;
  destination: string;
  rideType: string;
  price: string;
  distance: string;
  duration: string;
  onClose: () => void;
  // Add these coordinates for the map
  pickupCoordinates?: { latitude: number; longitude: number };
  destinationCoordinates?: { latitude: number; longitude: number };
  routePolyline?: string;
}

const { width } = Dimensions.get('window');

// Helper function to decode polyline
const decodePolyline = (encoded: string): {latitude: number, longitude: number}[] => {
  try {
    return JSON.parse(encoded);
  } catch (e) {
    console.error('Failed to decode polyline:', e);
    return [];
  }
};

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  pickup,
  destination,
  rideType,
  price,
  distance,
  duration,
  onClose,
  pickupCoordinates,
  destinationCoordinates,
  routePolyline
}) => {
  const [showPayment, setShowPayment] = useState(false);

  // Calculate the region to show both pickup and destination
  const mapRegion = React.useMemo(() => {
    if (pickupCoordinates && destinationCoordinates) {
      const midLat = (pickupCoordinates.latitude + destinationCoordinates.latitude) / 2;
      const midLng = (pickupCoordinates.longitude + destinationCoordinates.longitude) / 2;
      const latDelta = Math.abs(pickupCoordinates.latitude - destinationCoordinates.latitude) * 1.5;
      const lngDelta = Math.abs(pickupCoordinates.longitude - destinationCoordinates.longitude) * 1.5;
      
      return {
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: Math.max(0.02, latDelta),
        longitudeDelta: Math.max(0.02, lngDelta),
      };
    }
    return {
      latitude: 3.1390,
      longitude: 101.6869,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  }, [pickupCoordinates, destinationCoordinates]);

  if (showPayment) {
    return (
      <PaymentScreen 
        amount={price}
        rideDetails={{
          pickup,
          destination,
          rideType,
          pickupCoordinates: pickupCoordinates || { latitude: 0, longitude: 0 },
          destinationCoordinates: destinationCoordinates || { latitude: 0, longitude: 0 },
          routePolyline: routePolyline || ''
        }}
        onPaymentComplete={onClose}
        onBack={() => setShowPayment(false)}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Confirmation</Text>
      </View>

      {/* Map preview */}
      <View style={styles.mapPreview}>
        {pickupCoordinates && destinationCoordinates ? (
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
            
            {routePolyline && (
              <RoutePolyline
                encodedPolyline={routePolyline}
                strokeColor="#0066ff"
                strokeWidth={6}
              />
            )}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Map Preview</Text>
          </View>
        )}
      </View>

      {/* Booking details */}
      <View style={styles.detailsContainer}>
        <View style={styles.locationDetails}>
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

        <View style={styles.tripDetails}>
          <View style={styles.tripInfoItem}>
            <Text style={styles.tripInfoLabel}>Ride type</Text>
            <Text style={styles.tripInfoValue}>{rideType}</Text>
          </View>
          <View style={styles.tripInfoItem}>
            <Text style={styles.tripInfoLabel}>Price</Text>
            <Text style={styles.tripInfoValue}>{price}</Text>
          </View>
          <View style={styles.tripInfoItem}>
            <Text style={styles.tripInfoLabel}>Distance</Text>
            <Text style={styles.tripInfoValue}>{distance}</Text>
          </View>
          <View style={styles.tripInfoItem}>
            <Text style={styles.tripInfoLabel}>ETA</Text>
            <Text style={styles.tripInfoValue}>{duration}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={() => setShowPayment(true)}
        >
          <Text style={styles.confirmButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    color: '#3498db',
    fontSize: 16,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  mapPreview: {
    height: 250,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    color: '#555',
    fontSize: 16,
  },
  detailsContainer: {
    padding: 16,
  },
  locationDetails: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  tripDetails: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tripInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tripInfoLabel: {
    color: '#999',
    fontSize: 14,
  },
  tripInfoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
  },
});

export default BookingConfirmation; 