import AsyncStorage from '@react-native-async-storage/async-storage';
import driverData from '../data/driverData.json';

// Enhanced User interface to include driver-specific fields
export interface User {
  name: string;
  email: string;
  password: string;
  userType: 'driver' | 'passenger';
  rating?: number;
  car?: string;
  plateNumber?: string;
  phone?: string;
}

// Storage keys
const USERS_STORAGE_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

// Save user to AsyncStorage
export const saveUser = async (user: User): Promise<void> => {
  try {
    // Get existing users
    const usersJSON = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const users: Record<string, User> = usersJSON ? JSON.parse(usersJSON) : {};
    
    // Add new user (email as key)
    users[user.email] = user;
    
    // Save back to AsyncStorage
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

// Check if user exists
export const userExists = async (email: string): Promise<boolean> => {
  try {
    const usersJSON = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    if (!usersJSON) return false;
    
    const users: Record<string, User> = JSON.parse(usersJSON);
    return !!users[email];
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
};

// Get user by email
export const getUser = async (email: string): Promise<User | null> => {
  try {
    const usersJSON = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    if (!usersJSON) return null;
    
    const users: Record<string, User> = JSON.parse(usersJSON);
    return users[email] || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Set current logged in user
export const setCurrentUser = async (email: string): Promise<void> => {
  await AsyncStorage.setItem(CURRENT_USER_KEY, email);
};

// Get current logged in user email
export const getCurrentUserEmail = async (): Promise<string | null> => {
  return AsyncStorage.getItem(CURRENT_USER_KEY);
};

// Get current logged in user data
export const getCurrentUser = async (): Promise<User | null> => {
  const email = await getCurrentUserEmail();
  if (!email) return null;
  return getUser(email);
};

// Enhanced logout function
export const logout = async (): Promise<void> => {
  try {
    // Clear current user
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    
    // You might also want to clear any other session-related data
    // For example, tokens, recent ride history, etc.
    // await AsyncStorage.removeItem('SOME_OTHER_SESSION_KEY');
    
    // Verify the user is actually logged out
    const stillLoggedIn = await isAuthenticated();
    if (stillLoggedIn) {
      console.error('Failed to logout properly');
      // Force logout by trying again
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    }
    
    console.log('User successfully logged out');
  } catch (error) {
    console.error('Error during logout:', error);
    // Force clear as a last resort
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Check if user is logged in
export const isAuthenticated = async (): Promise<boolean> => {
  const email = await getCurrentUserEmail();
  return !!email;
};

// Keep the original function to maintain compatibility
export const initializeDefaultDriver = async (): Promise<void> => {
  try {
    const defaultDriver = driverData.drivers[0];
    const driverEmail = defaultDriver.email;
    const driverExists = await userExists(driverEmail);
    
    if (!driverExists) {
      await saveUser(defaultDriver as User);
      console.log('Default driver account created');
    }
  } catch (error) {
    console.error('Error initializing default driver:', error);
  }
};

// Add the new function for initializing all drivers
export const initializeDriverAccounts = async (): Promise<void> => {
  try {
    for (const driver of driverData.drivers) {
      const driverExists = await userExists(driver.email);
      
      if (!driverExists) {
        await saveUser(driver as User);
        console.log(`Driver account created: ${driver.name}`);
      }
    }
    console.log('Driver initialization complete');
  } catch (error) {
    console.error('Error initializing driver accounts:', error);
  }
};

// Add function to check if current user is a driver
export const isCurrentUserDriver = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.userType === 'driver';
}; 