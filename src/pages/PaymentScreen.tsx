import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import DriverAssignedScreen from './DriverAssignedScreen';

interface PaymentScreenProps {
  amount: string;
  rideDetails: {
    pickup: string;
    destination: string;
    rideType: string;
    pickupCoordinates: { latitude: number; longitude: number };
    destinationCoordinates: { latitude: number; longitude: number };
    routePolyline: string;
  };
  onPaymentComplete: () => void;
  onBack: () => void;
}

const { width } = Dimensions.get('window');

const PAYMENT_METHODS = [
  { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
  { id: 'credit', name: 'Credit Card', icon: '💳' },
  { id: 'cash', name: 'Cash', icon: '💵' },
  { id: 'uniway', name: 'UniWay Wallet', icon: '👛' },
];

const PaymentScreen: React.FC<PaymentScreenProps> = ({
  amount,
  rideDetails,
  onPaymentComplete,
  onBack
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [showDriverScreen, setShowDriverScreen] = useState(false);

  const handlePayment = () => {
    if (!selectedMethod) return;
    
    setProcessing(true);
    
    // Mock payment processing with a timeout
    setTimeout(() => {
      setProcessing(false);
      setPaymentComplete(true);
      
      // Show success message then navigate to driver screen
      setTimeout(() => {
        setShowDriverScreen(true);
      }, 2000);
    }, 1500);
  };

  if (showDriverScreen) {
    return (
      <DriverAssignedScreen
        pickup={rideDetails.pickup}
        destination={rideDetails.destination}
        pickupCoordinates={rideDetails.pickupCoordinates}
        destinationCoordinates={rideDetails.destinationCoordinates}
        routePolyline={rideDetails.routePolyline}
        onClose={onPaymentComplete}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      {!paymentComplete ? (
        <>
          {/* Ride summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Ride Summary</Text>
            <View style={styles.summaryDetail}>
              <Text style={styles.summaryLabel}>From</Text>
              <Text style={styles.summaryValue}>{rideDetails.pickup}</Text>
            </View>
            <View style={styles.summaryDetail}>
              <Text style={styles.summaryLabel}>To</Text>
              <Text style={styles.summaryValue}>{rideDetails.destination}</Text>
            </View>
            <View style={styles.summaryDetail}>
              <Text style={styles.summaryLabel}>Service</Text>
              <Text style={styles.summaryValue}>{rideDetails.rideType}</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Amount</Text>
              <Text style={styles.amountValue}>{amount}</Text>
            </View>
          </View>
          
          {/* Payment methods */}
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <View style={styles.paymentMethodsContainer}>
            {PAYMENT_METHODS.map(method => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedMethod === method.id && styles.selectedPaymentMethod
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                <Text style={styles.paymentMethodName}>{method.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Pay button */}
          <TouchableOpacity 
            style={[
              styles.payButton,
              (!selectedMethod || processing) && styles.disabledButton
            ]} 
            onPress={handlePayment}
            disabled={!selectedMethod || processing}
          >
            <Text style={styles.payButtonText}>
              {processing ? 'Processing...' : 'Pay Now'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successMessage}>Your ride has been booked.</Text>
          <Text style={styles.successMessage}>A driver will be assigned shortly.</Text>
        </View>
      )}
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
  summaryContainer: {
    margin: 16,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  summaryDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#999',
    fontSize: 14,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 14,
    maxWidth: '70%',
    textAlign: 'right',
  },
  amountContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountLabel: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountValue: {
    color: '#3498db',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 8,
    justifyContent: 'space-between',
  },
  paymentMethodCard: {
    width: (width / 2) - 24,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  selectedPaymentMethod: {
    backgroundColor: '#2c3e50',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  paymentMethodIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  paymentMethodName: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  payButton: {
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
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 50,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default PaymentScreen; 