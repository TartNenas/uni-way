import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { getUser, setCurrentUser } from '../utils/authStorage';
import driverData from '../data/driverData.json';

interface LoginProps {
  onUserLogin: () => void;
  onDriverLogin: () => void;
  onNavigateToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onUserLogin, onDriverLogin, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const user = await getUser(email);
      
      if (!user) {
        setError('User not found');
        setLoading(false);
        return;
      }

      // Add debugging to see what's being compared
      console.log('Entered password:', password);
      console.log('Stored password:', user.password);
      
      if (user.password !== password) {
        setError(`Incorrect password. Expected: ${user.password}`);
        setLoading(false);
        return;
      }

      // Login successful
      await setCurrentUser(email);
      setError('');
      setLoading(false);
      
      // Navigate based on user type
      if (user.userType === 'driver') {
        onDriverLogin();
      } else {
        onUserLogin();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error: ${errorMessage}`);
      console.error(err);
      setLoading(false);
    }
  };

  // Add function to fill in credentials for demo purposes
  const fillDriverCredentials = () => {
    const defaultDriver = driverData.drivers[0];
    setEmail(defaultDriver.email);
    setPassword(defaultDriver.password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
        
        {/* Add a "Demo Driver Login" button */}
        <TouchableOpacity 
          style={styles.demoButton} 
          onPress={fillDriverCredentials}
          disabled={loading}
        >
          <Text style={styles.demoButtonText}>Use Demo Driver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onNavigateToSignup} disabled={loading}>
          <Text style={styles.linkText}>
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    color: '#fff',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#3498db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#3498db',
    marginTop: 20,
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 10,
  },
  // Add style for demo button
  demoButton: {
    width: '100%',
    height: 40,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  demoButtonText: {
    color: '#3498db',
    fontSize: 14,
  },
});

export default Login; 