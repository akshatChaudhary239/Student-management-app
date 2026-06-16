import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../api/client';

import { useAuthStore } from '../store/authStore';

export default function AddMemberScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { config } = useAuthStore();
  
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [address, setAddress] = useState('');
  const [batch, setBatch] = useState('');
  const [notes, setNotes] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [membershipMonths, setMembershipMonths] = useState('1');
  
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !mobile || !feeAmount) {
      Alert.alert('Validation Error', 'Name, Mobile, and Fee Amount are required.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name,
        mobile,
        parentMobile: parentMobile || undefined,
        address: address || undefined,
        batch: config?.features.hasBatches ? (batch || undefined) : undefined,
        notes: notes || undefined,
        resourceName: config?.features.hasResources ? (resourceName || undefined) : undefined,
        feeAmount: parseFloat(feeAmount),
        membershipMonths: parseInt(membershipMonths)
      };

      await apiClient.post('/members', payload);
      
      Alert.alert('Success', `${config?.terminology.member || 'Member'} added successfully!`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create member';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#e0e7ff', '#f3e8ff', '#fdf4ff']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New {config?.terminology.member || 'Member'}</Text>
          <Text style={styles.subtitle}>Enter details below to onboard</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.input} placeholder={`${config?.terminology.member || 'Member'} Name`} value={name} onChangeText={setName} />

          <Text style={styles.label}>Mobile Number *</Text>
          <TextInput style={styles.input} placeholder="Mobile" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />

          <Text style={styles.label}>Parent Mobile</Text>
          <TextInput style={styles.input} placeholder="Parent's Mobile" value={parentMobile} onChangeText={setParentMobile} keyboardType="phone-pad" />

          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />

          {config?.features.hasResources && (
            <>
              <Text style={styles.label}>{config.terminology.resource} Number</Text>
              <TextInput style={styles.input} placeholder={`e.g. ${config?.terminology?.resource} Number (Optional)`} value={resourceName} onChangeText={setResourceName} />
            </>
          )}

          <Text style={styles.label}>Initial Fee Amount (₹) *</Text>
          <TextInput style={styles.input} placeholder="1000" value={feeAmount} onChangeText={setFeeAmount} keyboardType="number-pad" />

          <Text style={styles.label}>Membership Duration (Months) *</Text>
          <TextInput style={styles.input} placeholder="1" value={membershipMonths} onChangeText={setMembershipMonths} keyboardType="number-pad" />

          {config?.features.hasBatches && (
            <>
              <Text style={styles.label}>{config.terminology.batch} (Optional)</Text>
              <TextInput style={styles.input} placeholder={`e.g. Morning ${config?.terminology?.batch}`} value={batch} onChangeText={setBatch} />
            </>
          )}

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput style={[styles.input, { height: 80 }]} placeholder="Any specific notes..." value={notes} onChangeText={setNotes} multiline />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save {config?.terminology.member || 'Member'}</Text>}
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    marginBottom: 20,
    color: '#0f172a',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  button: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
