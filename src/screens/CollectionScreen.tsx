import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../hooks/useStore';
import { calculateRate, calculateAmount, formatCurrency } from '../utils/calculations';
import { COLORS } from '../utils/theme';

const TODAY = '2024-01-15';

export default function CollectionScreen() {
  const nav = useNavigation<any>();
  const { farmers, collections, addCollection, updateCollection, deleteCollection, activeCycle } = useStore();
  const [search, setSearch] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [shift, setShift] = useState<'morning' | 'evening'>('morning');
  const [qty, setQty] = useState('');
  const [fat, setFat] = useState('');
  const [snf, setSnf] = useState('');
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState(TODAY);
  const [editModal, setEditModal] = useState<any>(null);
  const [editForm, setEditForm] = useState({ qty: '', fat: '', snf: '' });

  const qtyRef = useRef<TextInput>(null);
  const fatRef = useRef<TextInput>(null);
  const snfRef = useRef<TextInput>(null);

  const filteredFarmers = farmers.filter(f =>
    f.active && (f.name.toLowerCase().includes(search.toLowerCase()) || f.mobile.includes(search))
  );

  const rate = fat && snf ? calculateRate(parseFloat(fat), parseFloat(snf)) : 0;
  const amount = qty && rate ? calculateAmount(parseFloat(qty), rate) : 0;

  const dateCollections = collections.filter(c => c.date === dateFilter);
  const totalMilk = dateCollections.reduce((s, c) => s + c.quantity, 0);
  const totalAmt = dateCollections.reduce((s, c) => s + c.amount, 0);

  // Get unique dates for filter
  const allDates = [...new Set(collections.map(c => c.date))].sort().reverse();

  const handleSave = () => {
    if (!selectedFarmer) return Alert.alert('Error', 'Kisan chunein');
    if (!qty || !fat || !snf) return Alert.alert('Error', 'Sab fields bharen');
    const q = parseFloat(qty), f = parseFloat(fat), s = parseFloat(snf);
    if (isNaN(q) || isNaN(f) || isNaN(s)) return Alert.alert('Error', 'Sahi number dalein');
    addCollection({ farmerId: selectedFarmer.id, date: TODAY, shift, quantity: q, fat: f, snf: s, rate, amount, cycleId: activeCycle?.id || 'cyc2' });
    setSaved(true);
    setQty(''); setFat(''); setSnf('');
    setTimeout(() => setSaved(false), 2000);
  };

  const openEdit = (c: any) => {
    setEditModal(c);
    setEditForm({ qty: String(c.quantity), fat: String(c.fat), snf: String(c.snf) });
  };

  const handleEditSave = () => {
    if (!editModal) return;
    const q = parseFloat(editForm.qty), f = parseFloat(editForm.fat), s = parseFloat(editForm.snf);
    const r = calculateRate(f, s);
    const a = calculateAmount(q, r);
    updateCollection(editModal.id, { quantity: q, fat: f, snf: s, rate: r, amount: a });
    setEditModal(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Ye entry delete karein?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCollection(id) }
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Shift Selector */}
        <View style={styles.shiftRow}>
          {(['morning', 'evening'] as const).map(s => (
            <TouchableOpacity key={s} style={[styles.shiftBtn, shift === s && (s === 'morning' ? styles.morningActive : styles.eveningActive)]}
              onPress={() => setShift(s)} activeOpacity={0.8}>
              <Text style={styles.shiftIcon}>{s === 'morning' ? '🌅' : '🌙'}</Text>
              <Text style={[styles.shiftText, shift === s && styles.shiftTextActive]}>
                {s === 'morning' ? 'Subah' : 'Shaam'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Farmer Search */}
        <View style={styles.section}>
          <Text style={styles.label}>👨‍🌾 Kisan Chunein</Text>
          <TextInput style={styles.input} placeholder="Naam ya mobile se khojein..."
            value={selectedFarmer ? selectedFarmer.name : search}
            onChangeText={t => { setSearch(t); setSelectedFarmer(null); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)} />
          {showDropdown && search.length > 0 && !selectedFarmer && (
            <View style={styles.dropdown}>
              {filteredFarmers.slice(0, 6).map(f => (
                <TouchableOpacity key={f.id} style={styles.dropItem}
                  onPress={() => { setSelectedFarmer(f); setSearch(''); setShowDropdown(false); qtyRef.current?.focus(); }}>
                  <View style={styles.dropAvatar}><Text style={styles.dropAvatarTxt}>{f.name[0]}</Text></View>
                  <View>
                    <Text style={styles.dropName}>{f.name}</Text>
                    <Text style={styles.dropSub}>{f.mobile} • {f.village}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {selectedFarmer && (
            <View style={styles.selectedBox}>
              <View style={styles.dropAvatar}><Text style={styles.dropAvatarTxt}>{selectedFarmer.name[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dropName}>{selectedFarmer.name}</Text>
                <Text style={styles.dropSub}>{selectedFarmer.mobile}</Text>
              </View>
              <TouchableOpacity onPress={() => { setSelectedFarmer(null); setSearch(''); }}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Inputs */}
        <View style={styles.section}>
          <Text style={styles.label}>🥛 Matra (Liters)</Text>
          <TextInput ref={qtyRef} style={styles.inputBig} placeholder="0.0" keyboardType="decimal-pad"
            value={qty} onChangeText={setQty} returnKeyType="next" onSubmitEditing={() => fatRef.current?.focus()} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Fat %</Text>
              <TextInput ref={fatRef} style={styles.inputBig} placeholder="0.0" keyboardType="decimal-pad"
                value={fat} onChangeText={setFat} returnKeyType="next" onSubmitEditing={() => snfRef.current?.focus()} />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>SNF %</Text>
              <TextInput ref={snfRef} style={styles.inputBig} placeholder="0.0" keyboardType="decimal-pad"
                value={snf} onChangeText={setSnf} returnKeyType="done" />
            </View>
          </View>
        </View>

        {/* Live Calc */}
        {rate > 0 && (
          <View style={styles.calcBox}>
            <View style={styles.calcRow}><Text style={styles.calcLbl}>Rate/Liter</Text><Text style={styles.calcVal}>{formatCurrency(rate)}</Text></View>
            <View style={styles.calcRow}><Text style={styles.calcLbl}>Matra</Text><Text style={styles.calcVal}>{qty || 0} L</Text></View>
            <View style={[styles.calcRow, styles.calcTotalRow]}>
              <Text style={styles.calcTotalLbl}>💰 Kul Rashi</Text>
              <Text style={styles.calcTotalVal}>{formatCurrency(amount)}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnDone]} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnTxt}>{saved ? '✅ Entry Sehejaya!' : '💾 Entry Save Karein'}</Text>
        </TouchableOpacity>

        {/* Date Filter */}
        <Text style={styles.sectionTitle}>📋 Entries Dekho</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {allDates.map(d => (
            <TouchableOpacity key={d} style={[styles.dateChip, dateFilter === d && styles.dateChipActive]} onPress={() => setDateFilter(d)}>
              <Text style={[styles.dateChipTxt, dateFilter === d && styles.dateChipTxtActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary for selected date */}
        <View style={styles.dateSummary}>
          <View style={styles.dateSumCard}>
            <Text style={styles.dateSumVal}>{totalMilk} L</Text>
            <Text style={styles.dateSumLbl}>Kul Doodh</Text>
          </View>
          <View style={styles.dateSumCard}>
            <Text style={styles.dateSumVal}>{dateCollections.length}</Text>
            <Text style={styles.dateSumLbl}>Entries</Text>
          </View>
          <View style={styles.dateSumCard}>
            <Text style={[styles.dateSumVal, { color: COLORS.primary }]}>{formatCurrency(totalAmt)}</Text>
            <Text style={styles.dateSumLbl}>Kul Rashi</Text>
          </View>
        </View>

        {/* Entries List */}
        {dateCollections.length === 0 ? (
          <Text style={styles.emptyTxt}>Is din koi entry nahi</Text>
        ) : (
          dateCollections.map((c) => {
            const farmer = farmers.find(f => f.id === c.farmerId);
            return (
              <TouchableOpacity key={c.id} style={styles.entryCard}
                onPress={() => nav.navigate('FarmerDetail', { farmerId: c.farmerId })} activeOpacity={0.8}>
                <View style={[styles.shiftDot, { backgroundColor: c.shift === 'morning' ? COLORS.morning : COLORS.evening }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.entryName}>{farmer?.name || 'Unknown'}</Text>
                  <Text style={styles.entrySub}>{c.shift === 'morning' ? '🌅 Subah' : '🌙 Shaam'} • {c.quantity}L • Fat:{c.fat} • SNF:{c.snf}</Text>
                </View>
                <Text style={styles.entryAmt}>{formatCurrency(c.amount)}</Text>
                <View style={styles.entryActions}>
                  <TouchableOpacity onPress={() => openEdit(c)} style={styles.editBtn}>
                    <Text>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(c.id)} style={styles.delBtn}>
                    <Text>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={!!editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>✏️ Entry Edit Karein</Text>
            {[
              { label: 'Matra (L)', key: 'qty' },
              { label: 'Fat %', key: 'fat' },
              { label: 'SNF %', key: 'snf' },
            ].map(({ label, key }) => (
              <View key={key} style={{ marginBottom: 12 }}>
                <Text style={styles.label}>{label}</Text>
                <TextInput style={styles.input} keyboardType="decimal-pad"
                  value={(editForm as any)[key]} onChangeText={t => setEditForm(p => ({ ...p, [key]: t }))} />
              </View>
            ))}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(null)}>
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn2} onPress={handleEditSave}>
                <Text style={styles.saveBtnTxt}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  shiftRow: { flexDirection: 'row', margin: 16, gap: 12 },
  shiftBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14, backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.border },
  morningActive: { backgroundColor: COLORS.morningBg, borderColor: COLORS.morning },
  eveningActive: { backgroundColor: COLORS.eveningBg, borderColor: COLORS.evening },
  shiftIcon: { fontSize: 22 },
  shiftText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  shiftTextActive: { color: COLORS.text },
  section: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 12, fontSize: 15, backgroundColor: '#FAFAFA' },
  inputBig: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: 24, fontWeight: '700', backgroundColor: '#FAFAFA', textAlign: 'center', color: COLORS.primary, marginBottom: 4 },
  row: { flexDirection: 'row', marginTop: 8 },
  dropdown: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, marginTop: 4, backgroundColor: '#fff', maxHeight: 220 },
  dropItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  dropAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  dropAvatarTxt: { color: '#fff', fontWeight: '700' },
  dropName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  dropSub: { fontSize: 12, color: COLORS.textSecondary },
  selectedBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, padding: 10, backgroundColor: COLORS.paidBg, borderRadius: 12 },
  clearBtn: { fontSize: 16, color: COLORS.textSecondary, padding: 4 },
  calcBox: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#F0FFF0', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#C8E6C9' },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  calcLbl: { fontSize: 14, color: COLORS.textSecondary },
  calcVal: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  calcTotalRow: { borderTopWidth: 1, borderTopColor: '#C8E6C9', marginTop: 6, paddingTop: 10 },
  calcTotalLbl: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  calcTotalVal: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  saveBtn: { marginHorizontal: 16, backgroundColor: COLORS.primary, padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 16, elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  saveBtnDone: { backgroundColor: '#388E3C' },
  saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginHorizontal: 16, marginBottom: 8 },
  dateChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border },
  dateChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateChipTxt: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  dateChipTxtActive: { color: '#fff' },
  dateSummary: { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 10 },
  dateSumCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', elevation: 1 },
  dateSumVal: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  dateSumLbl: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2 },
  entryCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  shiftDot: { width: 10, height: 10, borderRadius: 5 },
  entryName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  entrySub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  entryAmt: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  entryActions: { flexDirection: 'row', gap: 4 },
  editBtn: { padding: 6, backgroundColor: '#E3F2FD', borderRadius: 8 },
  delBtn: { padding: 6, backgroundColor: COLORS.unpaidBg, borderRadius: 8 },
  emptyTxt: { textAlign: 'center', color: COLORS.textSecondary, padding: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelTxt: { fontWeight: '600', color: COLORS.textSecondary },
  saveBtn2: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
});
