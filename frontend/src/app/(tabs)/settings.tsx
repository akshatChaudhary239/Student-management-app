import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import * as Device from 'expo-device';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shield, Bell, Activity, LogOut } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';

// Push notifications are unsupported in Expo Go SDK 53+
// Removed top-level setNotificationHandler to prevent crash on Android

export default function SettingsScreen() {
  const { logout, organization, owner } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [subscription, setSubscription] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, actRes] = await Promise.all([
        apiClient.get('/subscriptions/current'),
        apiClient.get('/activities?limit=10')
      ]);
      setSubscription(subRes.data.data);
      setActivities(actRes.data.data.activities);
    } catch (error) {
      console.error('Failed to fetch settings data', error);
    } finally {
      setLoading(false);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    Alert.alert('Notice', 'Push notifications are not supported in Expo Go.');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#e0e7ff', '#f3e8ff', '#fdf4ff']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: 120 }}>
        {owner?.role !== 'STAFF' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield color="#3b82f6" size={20} />
            <Text style={styles.sectionTitle}>SaaS Subscription</Text>
          </View>
          <BlurView intensity={80} tint="light" style={styles.card}>
            <Text style={styles.planName}>{subscription?.plan?.name || 'Unknown Plan'}</Text>
            <Text style={styles.planStatus}>Status: {subscription?.status}</Text>
            <View style={styles.usageBar}>
              <View style={[styles.usageFill, { width: `${(subscription?.usage?.currentStudents / subscription?.usage?.maxStudents) * 100}%` }]} />
            </View>
            <Text style={styles.usageText}>
              {subscription?.usage?.currentStudents} / {subscription?.usage?.maxStudents} Members
            </Text>
          </BlurView>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell color="#3b82f6" size={20} />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        <BlurView intensity={80} tint="light" style={styles.actionCard}>
          <TouchableOpacity style={styles.actionButton} onPress={registerForPushNotificationsAsync}>
            <Text style={styles.actionText}>{pushToken ? 'Push Enabled ✅' : 'Enable Push Notifications'}</Text>
          </TouchableOpacity>
        </BlurView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Activity color="#3b82f6" size={20} />
          <Text style={styles.sectionTitle}>Activity Feed</Text>
        </View>
        <BlurView intensity={80} tint="light" style={styles.card}>
          {activities.length === 0 ? (
            <Text style={styles.emptyText}>No recent activity.</Text>
          ) : (
            activities.map((act) => (
              <View key={act.id} style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityAction}>{act.action.replace('_', ' ')}</Text>
                  <Text style={styles.activityDate}>{new Date(act.createdAt).toLocaleString()}</Text>
                </View>
              </View>
            ))
          )}
        </BlurView>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <LogOut color="#fff" size={20} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  actionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  planName: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  planStatus: { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 16 },
  usageBar: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  usageFill: { height: '100%', backgroundColor: '#3b82f6' },
  usageText: { fontSize: 14, color: '#64748b', textAlign: 'right' },
  actionButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionText: { color: '#3b82f6', fontSize: 16, fontWeight: '600' },
  activityItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6', marginTop: 6 },
  activityContent: { flex: 1 },
  activityAction: { fontSize: 14, fontWeight: '600', color: '#334155' },
  activityDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  emptyText: { color: '#94a3b8', textAlign: 'center' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  logoutText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
