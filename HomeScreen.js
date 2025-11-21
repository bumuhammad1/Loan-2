import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = ({ navigation }) => {
  const [people, setPeople] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('people-data');
      if (data) setPeople(JSON.parse(data));
    } catch (error) {}
  };

  const saveData = async (data) => {
    try {
      await AsyncStorage.setItem('people-data', JSON.stringify(data));
    } catch (error) {}
  };

  const addPerson = () => {
    if (!newPersonName.trim()) return;
    const newPerson = { id: Date.now(), name: newPersonName, debts: [], credits: [] };
    const updated = [...people, newPerson];
    setPeople(updated);
    saveData(updated);
    setNewPersonName('');
    setShowAddModal(false);
  };

  const deletePerson = (id) => {
    Alert.alert('تأكيد الحذف', 'هل تريد حذف هذا الشخص؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => {
        const updated = people.filter(p => p.id !== id);
        setPeople(updated);
        saveData(updated);
      }}
    ]);
  };

  const calculateTotals = (person) => {
    const debtsTotal = person.debts.reduce((sum, d) => sum + d.amount, 0);
    const creditsTotal = person.credits.reduce((sum, c) => sum + c.amount, 0);
    return { debtsTotal, creditsTotal, net: debtsTotal - creditsTotal };
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#14b8a6', '#06b6d4']} style={styles.header}>
        <Text style={styles.headerTitle}>💎 تسجيل القروض</Text>
        <Text style={styles.headerSubtitle}>إدارة القروض والمستحقات</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👥 الأشخاص</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Text style={styles.addButtonText}>+ إضافة</Text>
            </TouchableOpacity>
          </View>

          {people.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>لا يوجد أشخاص مسجلين</Text>
            </View>
          ) : (
            people.map(person => {
              const totals = calculateTotals(person);
              return (
                <TouchableOpacity key={person.id} style={styles.personCard} onPress={() => navigation.navigate('PersonDetail', { person, people, setPeople, saveData })} onLongPress={() => deletePerson(person.id)}>
                  <View style={styles.personInfo}>
                    <View style={styles.personIcon}><Text style={styles.personIconText}>👤</Text></View>
                    <View style={styles.personDetails}>
                      <Text style={styles.personName}>{person.name}</Text>
                      <View style={styles.personStats}>
                        <View style={styles.statBadge}><Text style={styles.statLabel}>ديون: </Text><Text style={styles.statValueRed}>{totals.debtsTotal.toLocaleString()}</Text></View>
                        <View style={styles.statBadge}><Text style={styles.statLabel}>مستحقات: </Text><Text style={styles.statValueGreen}>{totals.creditsTotal.toLocaleString()}</Text></View>
                        <View style={styles.statBadge}><Text style={styles.statLabel}>صافي: </Text><Text style={[styles.statValueNet, totals.net > 0 ? styles.netRed : styles.netBlue]}>{Math.abs(totals.net).toLocaleString()}</Text></View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إضافة شخص جديد</Text>
            <TextInput style={styles.modalInput} placeholder="اسم الشخص" value={newPersonName} onChangeText={setNewPersonName} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={addPerson}><Text style={styles.modalButtonTextPrimary}>حفظ</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonSecondary} onPress={() => setShowAddModal(false)}><Text style={styles.modalButtonTextSecondary}>إلغاء</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdfa' },
  header: { padding: 40, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'right' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 8, textAlign: 'right' },
  content: { flex: 1, padding: 16 },
  section: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  addButton: { backgroundColor: '#14b8a6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 18, color: '#9ca3af' },
  personCard: { backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: '#e5e7eb' },
  personInfo: { flexDirection: 'row-reverse', alignItems: 'center' },
  personIcon: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#14b8a6', justifyContent: 'center', alignItems: 'center' },
  personIconText: { fontSize: 28 },
  personDetails: { flex: 1, marginRight: 16 },
  personName: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 8, textAlign: 'right' },
  personStats: { flexDirection: 'row-reverse', gap: 8, flexWrap: 'wrap' },
  statBadge: { flexDirection: 'row-reverse', backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statLabel: { fontSize: 12, color: '#6b7280' },
  statValueRed: { fontSize: 12, fontWeight: 'bold', color: '#ef4444' },
  statValueGreen: { fontSize: 12, fontWeight: 'bold', color: '#10b981' },
  statValueNet: { fontSize: 12, fontWeight: 'bold' },
  netRed: { color: '#f97316' }, netBlue: { color: '#3b82f6' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'right' },
  modalInput: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 16, textAlign: 'right' },
  modalButtons: { flexDirection: 'row-reverse', gap: 12 },
  modalButtonPrimary: { flex: 1, backgroundColor: '#14b8a6', padding: 14, borderRadius: 12, alignItems: 'center' },
  modalButtonTextPrimary: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalButtonSecondary: { flex: 1, backgroundColor: '#e5e7eb', padding: 14, borderRadius: 12, alignItems: 'center' },
  modalButtonTextSecondary: { color: '#374151', fontWeight: 'bold', fontSize: 16 }
});

export default HomeScreen;
