import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Modal, Alert, Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../hooks/useStore';
import { COLORS } from '../utils/theme';
import EmptyState from '../components/EmptyState';

export default function FarmersScreen() {
  const nav = useNavigation<any>();
  const { farmers, addFarmer, updateFarmer, deleteFarmer } = useStore();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', mobile: '', village: '' });

  const filtered = farmers.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.mobile.includes(search) || f.village.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm({ name: '', mobile: '', village: '' }); setModal(true); };
  const openEdit = (f: any) => { setEditing(f); setForm({ name: f.name, mobile: f.mobile, village: f.village }); setModal(true); };

  const handleSave = () => {
    if (!form.name || !form.mobile) return Alert.alert('Error', 'Naam aur mobile zaroori hai');
    if (editing) updateFarmer(editing.id, { ...form });
    else addFarmer({ ...form, active: true });
    setModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Kisan', `${name} ko delete karein?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteFarmer(id) }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Search + Add */}
      <View style={styles.topBar}>
        <TextInput style={styles.search} placeholder="🔍 Naam ya mobile khojein..." value={search} onChangeText={setSearch} />
        <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.count}>{filtered.length} Kisan / Farmers</Text>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        ListEmptyComponent={<EmptyState icon="👨‍🌾" title="Koi kisan nahi" subtitle="Upar + button se add karein" />}
        renderItem={({ item: f }) => (
          <TouchableOpacity style={styles.farmerCard} onPress={() => nav.navigate('FarmerDetail', { farmerId: f.id })} activeOpacity={0.85}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{f.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.farmerName}>{f.name}</Text>
              <Text style={styles.farmerSub}>📱 {f.mobile}</Text>
              <Text style={styles.farmerSub}>📍 {f.village}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(f)}>
                <Text style={styles.editBtnText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(f.id, f.name)}>
                <Text style={styles.deleteBtnText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Kisan Edit Karein' : 'Naya Kisan Jodein'}</Text>
            {[
              { label: 'Naam / Name *', key: 'name', placeholder: 'Ramesh Yadav' },
              { label: 'Mobile *', key: 'mobile', placeholder: '9876543210', keyboard: 'phone-pad' },
              { label: 'Gaon / Village', key: 'village', placeholder: 'Sultanpur' },
            ].map(({ label, key, placeholder, keyboard }) => (
              <View key={key} style={{ marginBottom: 12 }}>
                <Text style={styles.inputLabel}>{label}</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChangeText={t => setForm(p => ({ ...p, [key]: t }))}
                  keyboardType={keyboard as any || 'default'}
                />
              </View>
            ))}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>{editing ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: { flexDirection: 'row', padding: 16, gap: 10 },
  search: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  count: { fontSize: 13, color: COLORS.textSecondary, marginHorizontal: 16, marginBottom: 4 },
  farmerCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  farmerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  farmerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  actions: { gap: 6 },
  editBtn: { padding: 6, backgroundColor: '#E3F2FD', borderRadius: 8 },
  editBtnText: { fontSize: 16 },
  deleteBtn: { padding: 6, backgroundColor: COLORS.unpaidBg, borderRadius: 8 },
  deleteBtnText: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 },
  modalInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 12, fontSize: 15 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelBtnText: { fontWeight: '600', color: COLORS.textSecondary },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
  saveBtnText: { fontWeight: '700', color: '#fff', fontSize: 15 },
});
