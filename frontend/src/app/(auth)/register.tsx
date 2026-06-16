import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { getNicheConfig, NicheType } from '../../config/niches';

export default function RegisterScreen() {
  const router = useRouter();
  const { niche } = useLocalSearchParams<{ niche: NicheType }>();
  const nicheConfig = getNicheConfig(niche || 'LIBRARY');
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [totalResources, setTotalResources] = useState('50');
  
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !businessName || !email || !mobile || !password || !address || (nicheConfig.features.hasResources && !totalResources)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/auth/register', { 
        name, 
        libraryName: businessName, // backend maps this currently 
        nicheType: nicheConfig.id,
        email, 
        mobile, 
        password, 
        address, 
        totalResources: nicheConfig.features.hasResources ? parseInt(totalResources) : 0 
      });
      
      const { token, owner, organization } = response.data.data;
      await setAuth(token, owner, organization);
      
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      let message = error.response?.data?.message || 'Registration failed. Please try again.';
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        message = error.response.data.errors[0].message;
      }
      Alert.alert('Registration Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Set up your {nicheConfig.displayName} Dashboard</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Owner Name</Text>
          <TextInput style={styles.input} placeholder="John Doe" value={name} onChangeText={setName} />

          <Text style={styles.label}>{nicheConfig.terminology.businessName}</Text>
          <TextInput style={styles.input} placeholder={`Central ${nicheConfig.displayName}`} value={businessName} onChangeText={setBusinessName} />

          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} placeholder="owner@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput style={styles.input} placeholder="9876543210" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="********" value={password} onChangeText={setPassword} secureTextEntry />

          <Text style={styles.label}>Business Address</Text>
          <TextInput style={styles.input} placeholder="123 Main St" value={address} onChangeText={setAddress} />

          {nicheConfig.features.hasResources && (
            <>
              <Text style={styles.label}>Total {nicheConfig.terminology.resources}</Text>
              <TextInput style={styles.input} placeholder="50" value={totalResources} onChangeText={setTotalResources} keyboardType="number-pad" />
            </>
          )}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.linkText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: '#0f172a',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  linkText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
});
