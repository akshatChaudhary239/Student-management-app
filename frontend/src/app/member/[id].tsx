import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Phone, User, Calendar, CreditCard, Clock, Activity, XCircle, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../api/client';

import { useAuthStore } from '../../store/authStore';

export default function StudentProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { config } = useAuthStore();

  const [member, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Renew Modal State
  const [renewVisible, setRenewVisible] = useState(false);
  const [feeAmount, setFeeAmount] = useState('');
  const [months, setMonths] = useState('1');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [renewing, setRenewing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [removing, setRemoving] = useState(false);

  const fetchStudent = async () => {
    try {
      const response = await apiClient.get(`/members/${id}?t=${Date.now()}`);
      setStudent(response.data.data);
    } catch (error) {
      console.error('Failed to fetch member:', error);
      Alert.alert('Error', 'Failed to load member profile');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const handleRenew = async () => {
    if (!feeAmount || !months) {
      Alert.alert('Error', 'Please enter fee amount and months');
      return;
    }

    try {
      setRenewing(true);
      await apiClient.post(`/members/${id}/renew`, {
        feeAmount: parseFloat(feeAmount),
        paymentMode,
        months: parseInt(months)
      });
      
      Alert.alert('Success', 'Membership renewed successfully');
      setRenewVisible(false);
      setFeeAmount('');
      setMonths('1');
      fetchStudent(); // refresh data
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to renew membership');
    } finally {
      setRenewing(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Membership',
      `Are you sure you want to cancel the membership for ${member?.name}? This action will mark them as inactive and free up their resource (if any).`,
      [
        { text: 'No, Keep it', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await apiClient.post(`/members/${id}/cancel`);
              Alert.alert('Success', 'Membership cancelled successfully');
              fetchStudent(); // refresh data
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel membership');
            } finally {
              setCancelling(false);
            }
          }
        }
      ]
    );
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Member',
      `Are you absolutely sure you want to completely remove ${member?.name}? This action is irreversible and will delete all their records permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              setRemoving(true);
              await apiClient.delete(`/members/${id}`);
              Alert.alert('Success', 'Member removed successfully');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to remove member');
            } finally {
              setRemoving(false);
            }
          }
        }
      ]
    );
  };

  if (loading || !member) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const now = new Date();
  // Check if member status is explicitly not ACTIVE
  const isCancelled = member.status === 'LEFT';
  
  const activeMembership = !isCancelled ? member.memberships?.find((m: any) => new Date(m.endDate) >= now) : null;
  // Fallback to member.status if no memberships exist (for backwards compatibility with old records)
  const isActive = !isCancelled && (!!activeMembership || (member.memberships?.length === 0 && member.status === 'ACTIVE'));

  const totalFees = member.memberships?.reduce((sum: number, m: any) => sum + (m.feeAmount || 0), 0) || 0;
  
  const totalMonths = member.memberships?.reduce((sum: number, m: any) => {
    const start = new Date(m.startDate);
    const end = new Date(m.endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return sum + Math.max(1, months);
  }, 0) || (member.status === 'ACTIVE' ? 1 : 0);

  return (
    <LinearGradient colors={['#e0e7ff', '#f3e8ff', '#fdf4ff']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{member.name.substring(0, 1).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{member.name}</Text>
          <View style={[styles.badge, { backgroundColor: isCancelled ? '#f3f4f6' : isActive ? '#dcfce7' : '#fee2e2' }]}>
            <Text style={[styles.badgeText, { color: isCancelled ? '#6b7280' : isActive ? '#16a34a' : '#ef4444' }]}>
              {isCancelled ? 'CANCELLED' : isActive ? 'ACTIVE' : 'EXPIRED'}
            </Text>
          </View>
        </View>

        <BlurView intensity={80} tint="light" style={styles.card}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          <View style={styles.infoRow}>
            <Phone size={18} color="#64748b" />
            <Text style={styles.infoText}>{member.mobile}</Text>
          </View>
          {member.parentMobile && (
            <View style={styles.infoRow}>
              <Phone size={18} color="#64748b" />
              <Text style={styles.infoText}>{member.parentMobile} (Parent)</Text>
            </View>
          )}
          {member.address && (
            <View style={styles.infoRow}>
              <MapPin size={18} color="#64748b" />
              <Text style={styles.infoText}>{member.address}</Text>
            </View>
          )}
        </BlurView>

        <BlurView intensity={80} tint="light" style={styles.card}>
          <Text style={styles.sectionTitle}>{config?.terminology.member || 'Member'}'s Info</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>₹{totalFees}</Text>
              <Text style={styles.statLabel}>Total Fees Paid</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalMonths}</Text>
              <Text style={styles.statLabel}>Months Active</Text>
            </View>
          </View>

          {config?.features.hasResources && (
            <View style={styles.infoRow}>
              <MapPin size={18} color="#64748b" />
              <Text style={styles.infoText}>{config.terminology.resource}: {member.resource?.resourceName || 'Unassigned'}</Text>
            </View>
          )}
          {config?.features.hasBatches && member.batch && (
            <View style={styles.infoRow}>
              <Calendar size={18} color="#64748b" />
              <Text style={styles.infoText}>{config.terminology.batch}: {member.batch}</Text>
            </View>
          )}
          {activeMembership && (
            <View style={styles.infoRow}>
              <Calendar size={18} color="#64748b" />
              <Text style={styles.infoText}>Expires: {new Date(activeMembership.endDate).toLocaleDateString()}</Text>
            </View>
          )}

          {member.memberships && member.memberships.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Renewal History</Text>
              {member.memberships.map((m: any, index: number) => (
                <View key={m.id || index} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyDate}>
                      {new Date(m.startDate).toLocaleDateString()} - {new Date(m.endDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.historyAmount}>₹{m.feeAmount || 0}</Text>
                </View>
              ))}
            </View>
          )}
        </BlurView>

        <TouchableOpacity style={styles.renewButton} onPress={() => setRenewVisible(true)}>
          <CreditCard color="#fff" size={20} />
          <Text style={styles.renewButtonText}>Renew Membership</Text>
        </TouchableOpacity>

        {isActive && !isCancelled && (
          <TouchableOpacity 
            style={[styles.cancelMembershipButton, cancelling && { opacity: 0.7 }]} 
            onPress={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? <ActivityIndicator color="#ef4444" size="small" /> : <XCircle color="#ef4444" size={20} />}
            <Text style={styles.cancelMembershipText}>Cancel Membership</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.cancelMembershipButton, { backgroundColor: '#fef2f2', marginTop: 12 }, removing && { opacity: 0.7 }]} 
          onPress={handleRemove}
          disabled={removing}
        >
          {removing ? <ActivityIndicator color="#ef4444" size="small" /> : <Trash2 color="#ef4444" size={20} />}
          <Text style={styles.cancelMembershipText}>Remove Member</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Renew Modal */}
      <Modal visible={renewVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          style={styles.modalContainer} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Renew Membership</Text>
            
            <Text style={styles.label}>Fee Amount (₹)</Text>
            <TextInput style={styles.input} value={feeAmount} onChangeText={setFeeAmount} keyboardType="numeric" placeholder="1000" />
            
            <Text style={styles.label}>Duration (Months)</Text>
            <TextInput style={styles.input} value={months} onChangeText={setMonths} keyboardType="numeric" placeholder="1" />
            
            <Text style={styles.label}>Payment Mode</Text>
            <View style={styles.paymentModes}>
              {['CASH', 'UPI', 'BANK_TRANSFER'].map(mode => (
                <TouchableOpacity 
                  key={mode} 
                  style={[styles.modeButton, paymentMode === mode && styles.modeButtonActive]}
                  onPress={() => setPaymentMode(mode)}
                >
                  <Text style={[styles.modeText, paymentMode === mode && styles.modeTextActive]}>
                    {mode.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setRenewVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleRenew} disabled={renewing}>
                {renewing ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Confirm Renew</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#ffffff' },
  name: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 12, letterSpacing: -0.5 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  card: { borderRadius: 20, padding: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#64748b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  infoText: { fontSize: 16, color: '#334155', fontWeight: '500' },
  renewButton: { backgroundColor: '#0f172a', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 16, marginTop: 8, gap: 8, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  renewButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  cancelMembershipButton: { backgroundColor: '#fee2e2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, marginTop: 12, gap: 8 },
  cancelMembershipText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  
  historyContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  historyTitle: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 12 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  historyLeft: { flex: 1 },
  historyDate: { fontSize: 14, color: '#334155', fontWeight: '500' },
  historyAmount: { fontSize: 14, fontWeight: '600', color: '#16a34a' },
  
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginTop: 8 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a' },
  paymentModes: { flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 16 },
  modeButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  modeButtonActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  modeText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  modeTextActive: { color: '#3b82f6' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelButtonText: { color: '#64748b', fontSize: 16, fontWeight: '600' },
  submitButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#3b82f6', alignItems: 'center' },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
