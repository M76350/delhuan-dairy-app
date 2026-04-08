import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Modal, ScrollView, ActivityIndicator
} from 'react-native';
import { useStore } from '../hooks/useStore';
import { COLORS } from '../utils/theme';
import { formatCurrency, formatDate } from '../utils/calculations';
import Badge from '../components/Badge';

type ViewMode = 'today' | 'date' | 'month' | 'cycle';

export default function PaymentsScreen() {
  const { farmers, payments, collections, cycles, markAsPaid } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [selectedDate, setSelectedDate] = useState('2024-01-15');
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [selectedCycle, setSelectedCycle] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [payMode, setPayMode] = useState<'UPI' | 'Cash'>('UPI');
  const [paying, setPaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const allDates = [...new Set(collections.map(c => c.date))].sort().reverse();
  const allMonths = [...new Set(allDates.map(d => d.slice(0, 7)))];

  const getFilteredPayments = () => {
    let base = payments;
    if (viewMode === 'today') {
      const todayFarmerIds = [...new Set(collections.filter(c => c.date === '2024-01-15').map(c => c.farmerId))];
      base = payments.filter(p => todayFarmerIds.includes(p.farmerId));
    } else if (viewMode === 'date') {
      const farmerIds = [...new Set(collections.filter(c => c.date === selectedDate).map(c => c.farmerId))];
      base = payments.filter(p => farmerIds.includes(p.farmerId));
    } else if (viewMode === 'month') {
      const farmerIds = [...new Set(collections.filter(c => c.date.startsWith(selectedMonth)).map(c => c.farmerId))];
      base = payments.filter(p => farmerIds.includes(p.farmerId));
    } else if (viewMode === 'cycle' && selectedCycle) {
      base = payments.filter(p => p.cycleId === selectedCycle.id);
    }
    if (statusFilter !== 'all') base = base.filter(p => p.status === statusFilter);
    return base;
  };

  const filtered = getFilteredPayments();
  const totalPending = payments.filter(p => p.status === 'unpaid').reduce((s, p) => s + p.totalAmount, 0);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.totalAmount, 0);

  const handlePay = () => {
    if (!selectedPayment) return;
    setPaying(true);
    setTimeout(() => {
      markAsPaid(selectedPayment.id, payMode);
      setPaying(false);
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); setSelectedPayment(null); }, 2000);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.sumCard, { backgroundColor: COLORS.unpaidBg }]}>
          <Text style={[styles.sumVal, { color: COLORS.unpaid }]}>{formatCurrency(totalPending)}</Text>
          <Text style={styles.sumLbl}>🔴 Baki</Text>
        </View>
        <View style={[styles.sumCard, { backgroundColor: COLORS.paidBg }]}>
          <Text style={[styles.sumVal, { color: COLORS.paid }]}>{formatCurrency(totalPaid)}</Text>
          <Text style={styles.sumLbl}>🟢 Kiya</Text>
        </View>
      </View>

      {/* View Mode Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {([
          { key: 'today', label: '📅 Aaj' },
          { key: 'date', label: '🗓️ Date' },
          { key: 'month', label: '📆 Month' },
          { key: 'cycle', label: '🔄 Cycle' },
        ] as const).map(m => (
          <TouchableOpacity key={m.key} style={[styles.modeChip, viewMode === m.key && styles.modeChipActive]}
            onPress={() => setViewMode(m.key)}>
            <Text style={[styles.modeChipTxt, viewMode === m.key && styles.modeChipTxtActive]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sub-filters */}
      {viewMode === 'date' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {allDates.map(d => (
            <TouchableOpacity key={d} style={[styles.subChip, selectedDate === d && styles.subChipActive]} onPress={() => setSelectedDate(d)}>
              <Text style={[styles.subChipTxt, selectedDate === d && styles.subChipTxtActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {viewMode === 'month' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {allMonths.map(m => (
            <TouchableOpacity key={m} style={[styles.subChip, selectedMonth === m && styles.subChipActive]} onPress={() => setSelectedMonth(m)}>
              <Text style={[styles.subChipTxt, selectedMonth === m && styles.subChipTxtActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {viewMode === 'cycle' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {cycles.map(c => (
            <TouchableOpacity key={c.id} style={[styles.subChip, selectedCycle?.id === c.id && styles.subChipActive]}
              onPress={() => setSelectedCycle(c)}>
              <Text style={[styles.subChipTxt, selectedCycle?.id === c.id && styles.subChipTxtActive]}>
                {c.id} ({c.startDate}→{c.endDate})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Status Filter */}
      <View style={styles.statusRow}>
        {(['all', 'unpaid', 'paid'] as const).map(s => (
          <TouchableOpacity key={s} style={[styles.statusBtn, statusFilter === s && styles.statusBtnActive]} onPress={() => setStatusFilter(s)}>
            <Text style={[styles.statusTxt, statusFilter === s && styles.statusTxtActive]}>
              {s === 'all' ? 'Sab' : s === 'unpaid' ? '🔴 Baki' : '🟢 Paid'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListEmptyComponent={<Text style={styles.emptyTxt}>Koi record nahi</Text>}
        renderItem={({ item: p }) => {
          const farmer = farmers.find(f => f.id === p.farmerId);
          return (
            <TouchableOpacity style={styles.payCard} onPress={() => setSelectedPayment(p)} activeOpacity={0.85}>
              <View style={styles.payRow}>
                <View style={styles.avatar}><Text style={styles.avatarTxt}>{farmer?.name?.[0]}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.farmerName}>{farmer?.name}</Text>
                  <Text style={styles.paySub}>{p.totalMilk}L • {p.cycleId}</Text>
                  {p.paymentDate && <Text style={styles.paySub}>📅 {formatDate(p.paymentDate)} • {p.paymentMode}</Text>}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[styles.payAmt, { color: p.status === 'paid' ? COLORS.paid : COLORS.unpaid }]}>
                    {formatCurrency(p.totalAmount)}
                  </Text>
                  <Badge status={p.status} size="sm" />
                </View>
              </View>
              {p.status === 'unpaid' && (
                <TouchableOpacity style={styles.payNowBtn} onPress={() => setSelectedPayment(p)}>
                  <Text style={styles.payNowTxt}>💳 Payment Karo</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Payment Modal */}
      <Modal visible={!!selectedPayment} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {showSuccess ? (
              <View style={styles.successView}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successTxt}>Payment Ho Gaya!</Text>
                <Text style={styles.successSub}>Bhugtan safaltapurvak kiya gaya</Text>
              </View>
            ) : selectedPayment && (() => {
              const farmer = farmers.find(f => f.id === selectedPayment.farmerId);
              const cycleCollections = collections.filter(c => c.farmerId === selectedPayment.farmerId && c.cycleId === selectedPayment.cycleId);
              return (
                <>
                  <Text style={styles.modalTitle}>💰 Payment Details</Text>
                  <View style={styles.modalFarmerRow}>
                    <View style={styles.avatar}><Text style={styles.avatarTxt}>{farmer?.name?.[0]}</Text></View>
                    <View>
                      <Text style={styles.farmerName}>{farmer?.name}</Text>
                      <Text style={styles.paySub}>{farmer?.mobile} • {farmer?.village}</Text>
                    </View>
                  </View>

                  {/* Cycle entries */}
                  <View style={styles.entriesBox}>
                    <Text style={styles.entriesTitle}>Entries ({cycleCollections.length})</Text>
                    <ScrollView style={{ maxHeight: 150 }}>
                      {cycleCollections.map(c => (
                        <View key={c.id} style={styles.entryRow}>
                          <Text style={styles.entryDate}>{c.date} {c.shift === 'morning' ? '🌅' : '🌙'}</Text>
                          <Text style={styles.entryDetail}>{c.quantity}L F:{c.fat} S:{c.snf}</Text>
                          <Text style={styles.entryAmt}>{formatCurrency(c.amount)}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.amtBox}>
                    <Text style={styles.amtLbl}>Kul Rashi / Total</Text>
                    <Text style={styles.amtBig}>{formatCurrency(selectedPayment.totalAmount)}</Text>
                    <Text style={styles.amtSub}>{selectedPayment.totalMilk}L total milk</Text>
                  </View>

                  {selectedPayment.status === 'unpaid' ? (
                    <>
                      <Text style={styles.modeLbl}>Payment Tarika</Text>
                      <View style={styles.modeRow}>
                        {(['UPI', 'Cash'] as const).map(m => (
                          <TouchableOpacity key={m} style={[styles.modeBtn, payMode === m && styles.modeBtnActive]} onPress={() => setPayMode(m)}>
                            <Text style={styles.modeIcon}>{m === 'UPI' ? '📱' : '💵'}</Text>
                            <Text style={[styles.modeTxt, payMode === m && styles.modeTxtActive]}>{m}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {payMode === 'UPI' && (
                        <View style={styles.qrBox}>
                          <Text style={{ fontSize: 50 }}>📲</Text>
                          <Text style={styles.qrTxt}>UPI: delhuan.dairy@upi</Text>
                        </View>
                      )}
                      <View style={styles.modalBtns}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedPayment(null)}>
                          <Text style={styles.cancelTxt}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.confirmBtn, paying && { opacity: 0.7 }]} onPress={handlePay} disabled={paying}>
                          {paying ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmTxt}>✅ Confirm</Text>}
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                      <Badge status="paid" />
                      <Text style={[styles.paySub, { marginTop: 6 }]}>Paid on {formatDate(selectedPayment.paymentDate!)} via {selectedPayment.paymentMode}</Text>
                      <TouchableOpacity style={[styles.cancelBtn, { marginTop: 16, width: '100%' }]} onPress={() => setSelectedPayment(null)}>
                        <Text style={styles.cancelTxt}>Close</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  summaryRow: { flexDirection: 'row', padding: 16, paddingBottom: 8, gap: 12 },
  sumCard: { flex: 1, borderRadius: 16, padding: 14 },
  sumVal: { fontSize: 20, fontWeight: '700' },
  sumLbl: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  modeScroll: { marginBottom: 8 },
  modeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.border },
  modeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  modeChipTxt: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  modeChipTxtActive: { color: '#fff' },
  subScroll: { marginBottom: 8 },
  subChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border },
  subChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primaryLight },
  subChipTxt: { fontSize: 12, color: COLORS.textSecondary },
  subChipTxtActive: { color: '#fff', fontWeight: '600' },
  statusRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 12, padding: 4 },
  statusBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  statusBtnActive: { backgroundColor: COLORS.primary },
  statusTxt: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  statusTxtActive: { color: '#fff' },
  payCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontWeight: '700', fontSize: 18 },
  farmerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  paySub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  payAmt: { fontSize: 16, fontWeight: '700' },
  payNowBtn: { marginTop: 10, backgroundColor: COLORS.primary, padding: 10, borderRadius: 10, alignItems: 'center' },
  payNowTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyTxt: { textAlign: 'center', color: COLORS.textSecondary, padding: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  modalFarmerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  entriesBox: { backgroundColor: '#F8F8F8', borderRadius: 12, padding: 12, marginBottom: 12 },
  entriesTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 6 },
  entryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  entryDate: { fontSize: 12, color: COLORS.text, flex: 1 },
  entryDetail: { fontSize: 11, color: COLORS.textSecondary, flex: 1, textAlign: 'center' },
  entryAmt: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  amtBox: { backgroundColor: COLORS.paidBg, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 14 },
  amtLbl: { fontSize: 13, color: COLORS.textSecondary },
  amtBig: { fontSize: 32, fontWeight: '800', color: COLORS.primary, marginTop: 4 },
  amtSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  modeLbl: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  modeRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: COLORS.border },
  modeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.paidBg },
  modeIcon: { fontSize: 22 },
  modeTxt: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary },
  modeTxtActive: { color: COLORS.primary },
  qrBox: { backgroundColor: '#F5F5F5', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  qrTxt: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginTop: 6 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelTxt: { fontWeight: '600', color: COLORS.textSecondary },
  confirmBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
  confirmTxt: { fontWeight: '700', color: '#fff', fontSize: 15 },
  successView: { alignItems: 'center', paddingVertical: 32 },
  successIcon: { fontSize: 64, marginBottom: 12 },
  successTxt: { fontSize: 22, fontWeight: '700', color: COLORS.paid },
  successSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
});
