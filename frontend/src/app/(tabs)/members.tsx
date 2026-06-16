import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Search, UserPlus, Phone, MapPin, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../api/client';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Member {
  id: string;
  name: string;
  mobile: string;
  address: string | null;
  resourceId: string | null;
  resource: { resourceName: string } | null;
  status: string;
}

import { useAuthStore } from '../../store/authStore';

export default function StudentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { config } = useAuthStore();
  const [members, setStudents] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get(`/members?search=${search}`);
      setStudents(response.data.data.members);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const renderStudent = ({ item }: { item: Member }) => {
    const isCancelled = item.status === 'LEFT';
    // Backwards compatibility check: if it's active but doesn't have an explicit membership it will still be "ACTIVE"
    const isActive = item.status === 'ACTIVE';

    return (
      <TouchableOpacity 
        onPress={() => router.push(`/member/${item.id}` as any)}
        style={{ marginBottom: 16 }}
      >
        <BlurView intensity={80} tint="light" style={styles.card}>
          <View style={styles.cardHeader}>
          <View>
            <Text style={styles.studentName}>{item.name}</Text>
            {config?.features.hasResources && (
              <Text style={styles.studentSeat}>{config.terminology.resource}: {item.resource?.resourceName || 'Unassigned'}</Text>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: isCancelled ? '#f3f4f6' : isActive ? '#dcfce7' : '#fee2e2' }]}>
            <Text style={[styles.badgeText, { color: isCancelled ? '#6b7280' : isActive ? '#16a34a' : '#ef4444' }]}>
              {isCancelled ? 'CANCELLED' : isActive ? 'ACTIVE' : 'EXPIRED'}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Phone size={16} color="#64748b" />
            <Text style={styles.infoText}>{item.mobile}</Text>
          </View>
          {item.address && (
            <View style={styles.infoRow}>
              <MapPin size={16} color="#64748b" />
              <Text style={styles.infoText}>{item.address}</Text>
            </View>
          )}
        </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#e0e7ff', '#f3e8ff', '#fdf4ff']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <BlurView intensity={90} tint="light" style={[styles.header, { paddingTop: insets.top + 60 }]}>
        <View style={styles.searchContainer}>
          <Search color="#94a3b8" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${config?.terminology.members.toLowerCase()}...`}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: '#f1f5f9', marginRight: 8 }]} onPress={() => router.push('/import')}>
            <UserPlus color="#3b82f6" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-member')}>
            <UserPlus color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      </BlurView>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={renderStudent}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No {config?.terminology.members.toLowerCase()} found.</Text>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginRight: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#0f172a',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#0f172a',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  list: {
    padding: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  studentSeat: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
    fontSize: 16,
  },
});
