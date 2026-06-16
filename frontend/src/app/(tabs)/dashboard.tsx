import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, UserCheck, LayoutGrid, AlertCircle, Banknote } from 'lucide-react-native';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface DashboardData {
  totalStudents: number;
  activeStudents: number;
  availableSeats: number;
  expiringSoon: number;
  overdueFees: number;
}

import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { owner, organization, config } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await apiClient.get('/dashboard/metrics');
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#e0e7ff', '#f3e8ff', '#fdf4ff']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <ScrollView 
        contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
      >
        <LinearGradient colors={['#0f172a', '#1e293b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
            <Text style={styles.greeting}>Welcome back, {owner?.name?.split(' ')[0]}</Text>
            <Text style={styles.libraryName}>{organization?.businessName || 'Dashboard'}</Text>
          </View>
          <View style={styles.welcomeAccent} />
        </LinearGradient>

      <View style={styles.grid}>
        {/* Metric Cards */}
        <BlurView intensity={80} tint="light" style={styles.card}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardLabel}>Total {config?.terminology.members || 'Members'}</Text>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Users color="#3b82f6" size={18} />
            </View>
          </View>
          <Text style={styles.cardValue}>{data?.totalStudents || 0}</Text>
        </BlurView>

        <BlurView intensity={80} tint="light" style={styles.card}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardLabel}>Active Now</Text>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
              <UserCheck color="#22c55e" size={18} />
            </View>
          </View>
          <Text style={styles.cardValue}>{data?.activeStudents || 0}</Text>
        </BlurView>


        <BlurView intensity={80} tint="light" style={styles.card}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardLabel}>Expiring Soon</Text>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <AlertCircle color="#ef4444" size={18} />
            </View>
          </View>
          <Text style={styles.cardValue}>{data?.expiringSoon || 0}</Text>
        </BlurView>

        <TouchableOpacity onPress={() => router.push('/fee-history')} style={{ width: '48%', marginBottom: 16 }}>
          <BlurView intensity={80} tint="light" style={styles.fullCard}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardLabel}>Fee History</Text>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                <Banknote color="#a855f7" size={18} />
              </View>
            </View>
            <Text style={styles.cardValue}>₹{data?.overdueFees || 0}</Text>
          </BlurView>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
  },
  welcomeCard: {
    margin: 16,
    padding: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeContent: {
    position: 'relative',
    zIndex: 2,
  },
  dateText: {
    color: '#e0e7ff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  libraryName: {
    fontSize: 16,
    color: '#cbd5e1',
    marginTop: 6,
    fontWeight: '500',
  },
  welcomeAccent: {
    position: 'absolute',
    right: -40,
    bottom: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    zIndex: 1,
  },
  grid: {
    padding: 16,
    paddingTop: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  fullCard: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  cardLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    flex: 1,
    paddingRight: 8,
    lineHeight: 18,
  },
});
