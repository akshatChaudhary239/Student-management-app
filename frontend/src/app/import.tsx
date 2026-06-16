import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { FileUp, FileText, CheckCircle, AlertCircle } from 'lucide-react-native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function ImportScreen() {
  const { config } = useAuthStore();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'text/csv', // .csv
          'application/vnd.ms-excel' // .xls
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
        setResult(null); // Reset previous result
      }
    } catch (err) {
      console.error('Failed to pick document', err);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);

      const response = await apiClient.post('/import/members', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data.data);
      Alert.alert('Success', 'Import completed successfully!');
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.data?.errors) {
        setResult(errorData.data);
        Alert.alert('Import Finished with Errors', 'Please check the report below.');
      } else {
        Alert.alert('Error', errorData?.message || 'Failed to upload file');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bulk Import {config?.terminology?.members || 'Members'}</Text>
        <Text style={styles.subtitle}>Upload an Excel (.xlsx) or CSV file</Text>
      </View>

      <View style={styles.uploadCard}>
        <View style={styles.iconCircle}>
          <FileUp color="#3b82f6" size={32} />
        </View>
        <Text style={styles.instructionText}>
          Ensure your file has the following column headers:
          {'\n'}<Text style={{ fontWeight: '700' }}>Name, Mobile, Parent Mobile, Address</Text>
        </Text>

        {file ? (
          <View style={styles.fileSelectedBox}>
            <FileText color="#0f172a" size={20} />
            <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.selectButton} onPress={pickDocument}>
            <Text style={styles.selectButtonText}>Select File</Text>
          </TouchableOpacity>
        )}

        {file && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setFile(null)} disabled={loading}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={uploadFile} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.uploadButtonText}>Upload</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Import Report</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{result.totalProcessed}</Text>
              <Text style={styles.statLabel}>Processed</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#dcfce7' }]}>
              <Text style={[styles.statValue, { color: '#16a34a' }]}>{result.successCount}</Text>
              <Text style={[styles.statLabel, { color: '#16a34a' }]}>Success</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#fee2e2' }]}>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{result.failureCount}</Text>
              <Text style={[styles.statLabel, { color: '#ef4444' }]}>Failed</Text>
            </View>
          </View>

          {result.errors && result.errors.length > 0 && (
            <View style={styles.errorsContainer}>
              <Text style={styles.errorsTitle}>Errors:</Text>
              {result.errors.map((err: any, idx: number) => (
                <View key={idx} style={styles.errorRow}>
                  <AlertCircle color="#ef4444" size={16} />
                  <Text style={styles.errorText}>Row {err.row}: {err.error}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 8 },
  
  uploadCard: { backgroundColor: '#ffffff', margin: 16, padding: 24, borderRadius: 16, alignItems: 'center', elevation: 2, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  instructionText: { textAlign: 'center', color: '#334155', fontSize: 14, lineHeight: 22, marginBottom: 24 },
  
  selectButton: { backgroundColor: '#f1f5f9', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  selectButtonText: { color: '#0f172a', fontWeight: '600', fontSize: 16 },
  
  fileSelectedBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', width: '100%', marginBottom: 16, gap: 12 },
  fileName: { flex: 1, color: '#0f172a', fontWeight: '600' },
  
  actionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelButtonText: { color: '#64748b', fontSize: 16, fontWeight: '600' },
  uploadButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#3b82f6', alignItems: 'center' },
  uploadButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },

  resultCard: { backgroundColor: '#ffffff', margin: 16, padding: 24, borderRadius: 16, elevation: 2, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  resultTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: '600' },
  
  errorsContainer: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  errorsTitle: { fontSize: 16, fontWeight: '600', color: '#ef4444', marginBottom: 12 },
  errorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  errorText: { flex: 1, color: '#334155', fontSize: 14 },
});
