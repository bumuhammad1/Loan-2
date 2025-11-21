import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PersonDetailScreen = ({ route, navigation }) => {
  const { person, people, setPeople, saveData } = route.params;
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddCredit, setShowAddCredit] = useState(false);
  const [newDebt, setNewDebt] = useState({ description: '', amount: '', date: '' });
  const [newCredit, setNewCredit] = useState({ description: '', amount: '', date: '' });

  const currentPerson = people.find(p => p.id === person.id);

  const addDebt = () => {
    if (!newDebt.description || !newDebt.amount || !newDebt.date) {
      Alert.alert('تنبيه', 'الرجاء ملء جميع الحقول');
      return;
    }
    const item = { id: Date.now(), description: newDebt.description, amount: parseFloat(newDebt.amount), date: newDebt.date };
    const updated = people.map(p => p.id === person.id ? { ...p, debts: [...p.debts, item] } : p);
    setPeople(updated);
    saveData(updated);
    setNewDebt({ description: '', amount: '', date: '' });
    setShowAddDebt(false);
  };

  const addCredit = () => {
    if (!newCredit.description || !newCredit.amount || !newCredit.date) {
      Alert.alert('تنبيه', 'الرجاء ملء جميع الحقول');
      return;
    }
    const item = { id: Date.now(), description: newCredit.description, amount: parseFloat(newCredit.amount), date: newCredit.date };
    const updated = people.map(p => p.id === person.id ? { ...p, credits: [...p.credits, item] } : p);
    setPeople(updated);
    saveData(updated);
    setNewCredit({ description: '', amount: '', date: '' });
    setShowAddCredit(false);
  };

  const deleteItem = (id, type) => {
    Alert.alert('تأكيد الحذف', 'هل تريد حذف هذا العنصر؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => {
        const updated = people.map(p => {
          if (p.id === person.id) {
            if (type === 'debt') return { ...p, debts: p.debts.filter(d => d.id !== id) };
            else return { ...p, credits: p.credits.filter(c => c.id !== id) };
          }
          return p;
        });
        setPeople(updated);
        saveData(updated);
      }}
    ]);
  };

  const totalDebts = currentPerson.debts.reduce((sum, d) => sum + d.amount, 0);
  const totalCredits = currentPerson.credits.reduce((sum, c) => sum + c.amount, 0);
  const netAmount = totalDebts - totalCredits;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#14b8a6', '#06b6d4']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 {currentPerson.name}</Text>
        <Text style={styles.headerSubtitle}>سجل الديون والمستحقات</Text>
      </LinearGradient>

      <LinearGradient colors={netAmount > 0 ? ['#f97316', '#ef4444'] : netAmount < 0 ? ['#3b82f6', '#6366f1'] : ['#6b7280', '#4b5563']} style={styles.netCard}>
        <Text style={styles.netLabel}>الصافي</Text>
        <Text style={styles.netAmount}>{Math.abs(netAmount).toLocaleString()}</Text>
        <Text style={styles.netStatus}>{netAmount > 0 ? '🔴 عليك' : netAmount < 0 ? '🟢 لك' : '⚪ متعادل'}</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💳 الديون عليك</Text>
            <TouchableOpacity style={styles.addButtonRed} onPress={() => setShowAddDebt(true)}>
              <Text style={styles.addButtonText}>+ إضافة</Text>
            </TouchableOpacity>
          </View>

          {currentPerson.debts.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد ديون مسجلة</Text>
          ) : (
            currentPerson.debts.map(debt => (
              <TouchableOpacity key={debt.id} style={styles.itemCardRed} onLongPress={() => deleteItem(debt.id, 'debt')}>
                <Text style={styles.itemDescription}>{debt.description}</Text>
                <Text style={styles.itemAmountRed}>{debt.amount.toLocaleString()} ر.ق</Text>
                <Text style={styles.itemDate}>📅 {debt.date}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleGreen}>💰 المستحقات لك</Text>
            <TouchableOpacity style={styles.addButtonGreen} onPress={() => setShowAddCredit(true)}>
              <Text style={styles.addButtonText}>+ إضافة</Text>
            </TouchableOpacity>
          </View>

          {currentPerson.credits.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد مستحقات مسجلة</Text>
          ) : (
            currentPerson.credits.map(credit => (
              <TouchableOpacity key={credit.id} style={styles.itemCardGreen} onLongPress={() => deleteItem(credit.id, 'credit')}>
                <Text style={styles.itemDescription}>{credit.description}</Text>
                <Text style={styles.itemAmountGreen}>{credit.amount.toLocaleString()} ر.ق</Text>
                <Text style={styles.itemDate}>📅 {credit.date}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* مودالات */}
      <Modal visible={showAddDebt} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إضافة دين عليك</Text>
            <TextInput style={styles.modalInput} placeholder="الوصف" value={newDebt.description} onChangeText={text => setNewDebt({...newDebt, description: text})} />
            <TextInput style={styles.modalInput} placeholder="المبلغ" keyboardType="numeric" value={newDebt.amount} onChangeText={text => setNewDebt({...newDebt, amount: text})} />
            <TextInput style={styles.modalInput} placeholder="التاريخ (YYYY-MM-DD)" value={newDebt.date} onChangeText={text => setNewDebt({...newDebt, date: text})} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={addDebt}><Text style={styles.modalButtonTextPrimary}>حفظ</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonSecondary} onPress={() => setShowAddDebt(false)}><Text style={styles.modalButtonTextSecondary}>إلغاء</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddCredit} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إضافة مستحق لك</Text>
            <TextInput style={styles.modalInput} placeholder="الوصف" value={newCredit.description} onChangeText={text => setNewCredit({...newCredit, description: text})} />
            <TextInput style={styles.modalInput} placeholder="المبلغ" keyboardType="numeric" value={newCredit.amount} onChangeText={text => setNewCredit({...newCredit, amount: text})} />
            <TextInput style={styles.modalInput} placeholder="التاريخ (YYYY-MM-DD)" value={newCredit.date} onChangeText={text => setNewCredit({...newCredit, date: text})} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={addCredit}><Text style={styles.modalButtonTextPrimary}>حفظ</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonSecondary} onPress={() => setShowAddCredit(false)}><Text style={styles.modalButtonTextSecondary}>إلغاء</Text></Text></TouchableOpacity>
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
  backButton: { marginBottom: 12 }, backButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'right' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 8, textAlign: 'right' },
  netCard: { margin: 16, padding: 24, borderRadius: 20, alignItems: 'center' },
  netLabel: { fontSize: 18, color: 'white', marginBottom: 8 },
  netAmount: { fontSize: 48, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  netStatus: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  content: { flex: 1, padding: 16 },
  section: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  sectionTitleGreen: { fontSize: 20, fontWeight: 'bold', color: '#10b981' },
  addButtonRed: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addButtonGreen: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#9ca3af', paddingVertical: 20 },
  itemCardRed: { backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, marginBottom: 8 },
  itemCardGreen: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, marginBottom: 8 },
  itemDescription: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4, textAlign: 'right' },
  itemAmountRed: { fontSize: 18, fontWeight: 'bold', color: '#dc2626', marginBottom: 2 },
  itemAmountGreen: { fontSize: 18, fontWeight: 'bold', color: '#10b981', marginBottom: 2 },
  itemDate: { fontSize: 12, color: '#475569' },
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

export default PersonDetailScreen;
