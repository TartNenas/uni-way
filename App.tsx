import React, { useState, useEffect, ErrorInfo, useRef } from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  Platform, 
  StatusBar as RNStatusBar, 
  ActivityIndicator, 
  View, 
  Text,
  Animated,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Login from './src/pages/Login';
import Signup from './src/pages/Signup';
import Home from './src/pages/Home';
import DriverHome from './src/pages/DriverHome';
import BookingConfirmation from './src/pages/BookingConfirmation';
import { isAuthenticated, initializeDefaultDriver, logout } from './src/utils/authStorage';

const { width } = Dimensions.get('window');

// Define the interface in App.tsx
interface BookingConfirmationProps {
  pickup: string;
  destination: string;
  rideType: string;
  price: string;
  distance: string;
  duration: string;
  onClose: () => void;
}

// Error boundary for catching runtime errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  // App states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [bookingData, setBookingData] = useState<Omit<BookingConfirmationProps, 'onClose'> | null>(null);
  const [userType, setUserType] = useState<'driver' | 'passenger' | null>(null);
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Check if user is already logged in on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authStatus = await isAuthenticated();
        setIsLoggedIn(authStatus);
        setLoading(false);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    // Initialize the default driver account
    initializeDefaultDriver();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      // Call the actual logout function
      await logout();
      
      // Update state
      setIsLoggedIn(false);
      setShowLogin(true);
      setUserType(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Still update UI state even if there's an error
      setIsLoggedIn(false);
      setShowLogin(true);
    }
  };

  const navigateToSignup = () => {
    // Animate out login screen
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowLogin(false);
      // Reset animation values for signup screen
      slideAnim.setValue(width);
      opacityAnim.setValue(0);
      
      // Animate in signup screen
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const navigateToLogin = () => {
    // Animate out signup screen
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowLogin(true);
      // Reset animation values for login screen
      slideAnim.setValue(-width);
      opacityAnim.setValue(0);
      
      // Animate in login screen
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  // Reset animation when screens change
  useEffect(() => {
    slideAnim.setValue(0);
    opacityAnim.setValue(1);
  }, [isLoggedIn]);

  // Add these two specific handlers
  const handleUserLogin = () => {
    setUserType('passenger');
    setIsLoggedIn(true);
  };

  const handleDriverLogin = () => {
    setUserType('driver');
    setIsLoggedIn(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        {isLoggedIn ? (
          userType === 'driver' ? (
            <DriverHome 
              onLogout={handleLogout}
              onAcceptRide={(rideData) => {
                console.log("Ride accepted:", rideData);
              }}
            />
          ) : currentPage === 'home' ? (
            <Home 
              onLogout={handleLogout}
              onBookRide={(data) => {
                setBookingData(data);
                setCurrentPage('booking');
              }}
            />
          ) : bookingData ? (
            <BookingConfirmation
              {...bookingData}
              onClose={() => setCurrentPage('home')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  errorMessage: {
    fontSize: 16,
    color: '#aaa',
  },
  animatedContainer: {
    flex: 1,
    width: '100%',
  }
});
