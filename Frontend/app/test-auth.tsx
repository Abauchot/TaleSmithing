import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthContext } from '@/src/contexts/AuthContext';

export default function TestAuth() {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { login, register, logout, user, isAuthenticated, isLoading, error } = useAuthContext();
  const [response, setResponse] = useState('');

  const handleRegister = async () => {
    console.log('=== REGISTER START ===');
    console.log('Email:', email);
    console.log('Username:', username);
    console.log('Password:', password ? '***' : 'empty');
    
    setResponse('');

    try {
      await register({
        email,
        password,
        username,
      });

      Alert.alert('Success', 'Registration successful! You are now logged in.');
      console.log('✅ Registration successful');
      setResponse(JSON.stringify(user, null, 2));
    } catch (error: any) {
      console.error('❌ REGISTER ERROR:', error);
      setResponse(`Error: ${error.message}`);
      Alert.alert('Error', `Registration failed: ${error.message}`);
    } finally {
      console.log('=== REGISTER END ===');
    }
  };

  const handleLogin = async () => {
    console.log('=== LOGIN START ===');
    console.log('Email:', email);
    console.log('Password:', password ? '***' : 'empty');
    
    setResponse('');

    try {
      await login({
        email,
        password,
      });

      Alert.alert('Success', 'Login successful!');
      console.log('✅ Login successful');
      console.log('User:', user);
      setResponse(JSON.stringify(user, null, 2));
    } catch (error: any) {
      console.error('❌ LOGIN ERROR:', error);
      setResponse(`Error: ${error.message}`);
      Alert.alert('Error', `Login failed: ${error.message}`);
    } finally {
      console.log('=== LOGIN END ===');
    }
  };

  const handleLogout = async () => {
    console.log('=== LOGOUT START ===');
    
    try {
      await logout();
      Alert.alert('Success', 'Logged out successfully!');
      console.log('✅ Logout successful');
      clearForm();
    } catch (error: any) {
      console.error('❌ LOGOUT ERROR:', error);
      Alert.alert('Error', `Logout failed: ${error.message}`);
    } finally {
      console.log('=== LOGOUT END ===');
    }
  };

  const handleSubmit = () => {
    if (mode === 'register') {
      if (!email || !password || !username) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }
      handleRegister();
    } else {
      if (!email || !password) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }
      handleLogin();
    }
  };

  const clearForm = () => {
    console.log('🧹 Form cleared');
    setEmail('');
    setPassword('');
    setUsername('');
    setResponse('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Auth Test Page</Text>
        <Text style={styles.subtitle}>
          {isAuthenticated ? `Logged in as: ${user?.email}` : 'Not logged in'}
        </Text>

        {/* Show user info if authenticated */}
        {isAuthenticated && user && (
          <View style={styles.userInfo}>
            <Text style={styles.userInfoTitle}>Current User:</Text>
            <Text style={styles.userInfoText}>ID: {user.id}</Text>
            <Text style={styles.userInfoText}>Email: {user.email}</Text>
            {user.username && <Text style={styles.userInfoText}>Username: {user.username}</Text>}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isAuthenticated && (
          <>
            {/* Mode Switcher */}
            <View style={styles.modeSwitcher}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'register' && styles.modeButtonActive]}
            onPress={() => {
              setMode('register');
              clearForm();
            }}
          >
            <Text style={[styles.modeButtonText, mode === 'register' && styles.modeButtonTextActive]}>
              Register
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]}
            onPress={() => {
              setMode('login');
              clearForm();
            }}
          >
            <Text style={[styles.modeButtonText, mode === 'login' && styles.modeButtonTextActive]}>
              Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="user@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {mode === 'register' && (
            <>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="username123"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </>
          )}

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="password123"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'register' ? 'Register' : 'Login'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={clearForm}>
            <Text style={styles.clearButtonText}>Clear Form</Text>
          </TouchableOpacity>
        </View>
          </>
        )}

        {/* Response Display */}
        {response && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseTitle}>Response:</Text>
            <ScrollView style={styles.responseScroll}>
              <Text style={styles.responseText}>{response}</Text>
            </ScrollView>
          </View>
        )}

        <Text style={styles.debugInfo}>
          ℹ️ Check the console (Metro bundler) for detailed logs
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modeSwitcher: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#007AFF',
  },
  modeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 14,
  },
  responseContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  responseScroll: {
    maxHeight: 200,
  },
  responseText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  debugInfo: {
    marginTop: 20,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  userInfo: {
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2e7d32',
  },
  userInfoText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
