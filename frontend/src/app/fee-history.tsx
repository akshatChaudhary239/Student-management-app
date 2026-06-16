import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Banknote, ArrowLeft } from 'lucide-react-native';
import apiClient from '../api/client';

export default function FeeHistoryScreen() {
  const router = useRouter();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const response = await apiClient.get('/fees');
      setFees(response.data.data);
    } catch (error) {
      console.error('Failed to fetch fees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Fee History</Text>
      </View>

      <FlatList
        data={fees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.memberName}>{item.member.name}</Text>
              <Text style={styles.amount}>₹{item.amount}</Text>
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.detailText}>
                Paid on: {new Date(item.paymentDate).toLocaleDateString()}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.paymentMethod}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Banknote size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No fee records found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  memberName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  amount: { fontSize: 16, fontWeight: '700', color: '#10b981' },
  cardDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailText: { fontSize: 14, color: '#64748b' },
  badge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#94a3b8' }
});