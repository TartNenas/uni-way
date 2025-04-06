import React, { useState } from 'react';
import { Alert, View, Text, StatusBar, SafeAreaView, ActivityIndicator } from 'react-native';
import DriverFeedback from './pages/DriverFeedback';
import Home from './pages/Home';
import DriverAssignedScreen from './pages/DriverAssignedScreen';
import DriverHome from './pages/DriverHome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookingConfirmation from './pages/BookingConfirmation';
import ErrorBoundary from './components/ErrorBoundary';
import Animated from 'react-native-reanimated';

// Define the feedback data type
interface FeedbackData {
  driverName: string;
}

// Mock driver data
const DRIVER = {
  name: "Ahmad",
  rating: 4.8,
  car: "Proton Saga",
  plateNumber: "WTU 4231",
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'driver' | 'passenger'>('passenger');
  const [showLogin, setShowLogin] = useState(true);
  const [slideAnim, setSlideAnim] = useState(0);
  const [opacityAnim, setOpacityAnim] = useState(1);
  const [bookingData, setBookingData] = useState<any>(null);

  const navigateToFeedback = (driverName: string) => {
    setFeedbackData({ driverName });
    setCurrentScreen('feedback');
  };

  const handleFeedbackSubmit = (rating: number, comment: string) => {
    console.log(`Driver Rating: ${rating}, Comment: ${comment}`);
    Alert.alert("Thank You!", "Your feedback has been submitted successfully.");
    setCurrentScreen('home');
  };

  const handleFeedbackCancel = () => {
    setCurrentScreen('driverAssigned');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType('passenger');
    setCurrentScreen('home');
  };

  const handleUserLogin = () => {
    setIsLoggedIn(true);
    setUserType('passenger');
    setCurrentScreen('home');
  };

  const handleDriverLogin = () => {
    setIsLoggedIn(true);
    setUserType('driver');
    setCurrentScreen('home');
  };

  const navigateToSignup = () => {
    setShowLogin(false);
  };

  const navigateToLogin = () => {
    setShowLogin(true);
  };

  const handleAcceptRide = (rideData: any) => {
    console.log("Ride accepted:", rideData);
    setBookingData(rideData);
    setCurrentScreen('booking');
  };

  const handleRejectRide = () => {
    // Implementation needed
  };

  // Define props objects for components
  const homeProps = {
    onLogout: handleLogout,
    onBookRide: (data: any) => {
      setBookingData(data);
      setCurrentScreen('booking');
    }
  };

  const driverAssignedProps = {
    pickup: "Sunway University",
    destination: "Sunway Pyramid",
    pickupCoordinates: { latitude: 3.0669, longitude: 101.6035 },
    destinationCoordinates: { latitude: 3.0728, longitude: 101.6092 },
    routePolyline: "encoded_polyline_string_here",
    onClose: () => setCurrentScreen('home')
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    animatedContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {isLoggedIn ? (
          userType === 'driver' ? (
            <DriverHome 
              onLogout={handleLogout}
              onAcceptRide={handleAcceptRide}
            />
          ) : currentScreen === 'home' ? (
            <Home {...homeProps} />
          ) : bookingData ? (
            <BookingConfirmation
              {...bookingData}
              onClose={() => setCurrentScreen('home')}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498db" />
            </View>
          )
        ) : (
          <Animated.View 
            style={[
              styles.animatedContainer,
              {
                transform: [{ translateX: slideAnim }],
                opacity: opacityAnim
              }
            ]}
          >
            {showLogin ? (
              <Login 
                onUserLogin={handleUserLogin}
                onDriverLogin={handleDriverLogin}
                onNavigateToSignup={navigateToSignup} 
              />
            ) : (
              <Signup 
                onSignup={handleUserLogin} 
                onNavigateToLogin={navigateToLogin} 
              />
            )}
          </Animated.View>
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
}

export default App; 