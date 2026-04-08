import React, { useState, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Modal, ScrollView, ActivityIndicator, Animated
} from 'react-native';
import { useStore } from '../hooks/useStore';
import { COLORS } from '../utils/theme';
import { formatCurrency, formatDate } from '../utils/calculations';
import Badge from '../components/Badge';

type FilterMode = 'today' | 'date' | 'month' | 'year';

const TODAY = '2024-01-15';
const ALL_YEARS = ['2024'];
const ALL_MONTHS: Record<string, string> = {
  '2024-01': 'Jan 2024', '2024-02': 'Feb 2024', '2024-03': 'Mar 2024',
};

export default function PaymentsScreen() {
  const { farmers, payments, collections, cycles, markAsPaid } = useStore();

  const [filterMode, setFilterMode] = useState<FilterMode>('today');
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [payMode, setPayMode] = useState<'UPI' | 'Cash'>('UPI');
  const [paying, setPaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // All unique dates from collections
  const allDates = [...new Set(collections.map(c => c.date))].sort().reverse();
  const allMonths = [...new Set(allDates.map(d => d.slice(0, 7)))].sort().reverse();

  // Get farmer IDs active in selected period
  const getFarmerIdsForPeriod = (): string[] => {
    let cols = collections;
    if (filterMode === 'today') cols = collections.filter(c => c.date === TODAY);
    else if (filterMode === 'date') cols = collections.filter(c => c.date === selectedDate);
    else if (filterMode === 'month') cols = collections.filter(c => c.date.startsWith(selectedMonth));
    else if (filterMode === 'year') cols = collections.filter(c => c.date.startsWith(selectedYear));
    return [...new Set(cols.map(c => c.farmerId))];
  };

  const farmerIds = getFarmerIdsForPeriod();

  // Build payment summary per farmer for selected period
  const buildFarmerSummary = () => {
    return farmerIds.map(fid => {
      let cols = collections.filter(c => c.farmerId === fid);
      if (filterMode === 'today') cols = cols.filter(c => c.date === TODAY);
      else if (filterMode === 'date') cols = cols.filter(c => c.date === selectedDate);
      else if (filterMode === 'month') cols = cols.filter(c => c.date.startsWith(selectedMonth));
      else if (filterMode === 'year') cols = cols.filter(c => c.date.startsWith(selectedYear));

      const totalMilk = cols.reduce((s, c) => s + c.quantity, 0);
      const totalAmt = parseFloat(cols.reduce((s, c) => s + c.amount, 0).toFixed(2));
      // Find matching payment record
      const pay = payments.find(p => p.farmerId === fid &&
        (filterMode === 'today' || filterMode === 'date' ? p.cycleId === cols[0]?.cycleId : true)
      );
      return { farmerId: fid, totalMilk, totalAmt, pay, cols };
    }).filter(s => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'paid') return s.pay?.status === 'paid';
      if (statusFilter === 'unpaid') return !s.pay || s.pay.status === 'unpaid';
      return true;
    });
  };

  const summaryList = buildFarmerSummary();
  const totalPaid = summaryList.filter(s => s.pay?.status === 'paid').reduce((a, s) => a + s.totalAmt, 0);
  const totalUnpaid = summaryList.filter(s => !s.pay || s.pay.status === 'unpaid').reduce((a, s) => a + s.totalAmt, 0);

  const handlePay = () => {
    if (!selectedPayment?.pay) return;
    setPaying(true);
    setTimeout(() => {
      markAsPaid(selectedPayment.pay.id, payMode);
      setPaying(false);
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); setSelectedPayment(null); }, 2000);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* Top Summary */}
      <View style={styles.topSummary}>
        <View style={[styles.sumCard, { backgroundColor: COLORS.paidBg }]}>
          <Text style={[styles.sumVal, { color: COLORS.paid }]}>{formatCurrency(totalPaid)}</Text>
          <Text style={styles.sumLbl}>🟢 Kiya Bhugtan</Text>
        </View>
        <View style={[styles.sumCard, { backgroundColor: COLORS.unpaidBg }]}>
          <Text style={[styles.sumVal, { color: COLORS.unpaid }]}>{formatCurrency(totalUnpaid)}</Text>
          <Text style={styles.sumLbl}>🔴 Baki Bhugtan</Text>
        </View>
      </View>

      {/* Filter Mode Tabs */}
      <View style={styles.modeTabs}>
        {([
          { key: 'today', label: '📅 Aaj' },
          { key: 'date', label: '🗓️ Date' },
          { key: 'month', label: '📆 Month' },
          { key: 'year', label: '📅 Year' },
        ] as const).map(m => (
          <TouchableOpacity key={m.key}
            style={[styles.modeTab, filterMode === m.key && styles.modeTabActive]}
            onPress={() => setFilterMode(m.key)}>
            <Text style={[styles.modeTabTxt, filterMode === m.key && styles.modeTabTxtActive]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sub-filter (date/month/year picker) */}
      {filterMode === 'date' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={styles.subScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {allDates.map(d => (
            <TouchableOpacity key={d}
              style={[styles.chip, selectedDate === d && styles.chipActive]}
              onPress={() => setSelectedDate(d)}>
              <Text style={[styles.chipTxt, selectedDate === d && styles.chipTxtActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {filterMode === 'month' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={styles.subScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {allMonths.map(m => (
            <TouchableOpacity key={m}
              style={[styles.chip, selectedMonth === m && styles.chipActive]}
              onPress={() => setSelectedMonth(m)}>
              <Text style={[styles.chipTxt, selectedMonth === m && styles.chipTxtActive]}>
                {ALL_MONTHS[m] || m}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {filterMode === 'year' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={styles.subScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {ALL_YEARS.map(y => (
            <TouchableOpacity key={y}
              style={[styles.chip, selectedYear === y && styles.chipActive]}
              onPress={() => setSelectedYear(y)}>
              <Text style={[styles.chipTxt, selectedYear === y && styles.chipTxtActive]}>{y}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Status Filter */}
      <View style={styles.statusRow}>
        {([
          { key: 'all', label: 'Sab' },
          { key: 'unpaid', label: '🔴 Baki' },
          { key: 'paid', label: '🟢 Paid' },
        ] as const).map(s => (
          <TouchableOpacity key={s.key}
            style={[styles.statusBtn, statusFilter === s.key && styles.statusBtnActive]}
            onPress={() => setStatusFilter(s.key)}>
            <Text style={[styles.statusTxt, statusFilter === s.key && styles.statusTxtActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.countTxt}>{summaryList.length} records</Text>
      </View>

      {/* List */}
      <FlatList
        data={summaryList}
        keyExtractor={i => i.farmerId}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyTxt}>Is period mein koi record nahi</Text>
          </View>
        }
        renderItem={({ item: s }) => {
          const farmer = farmers.find(f => f.id === s.farmerId);
          const isPaid = s.pay?.status === 'paid';
          return (
            <TouchableOpacity style={styles.payCard}
              onPress={() => setSelectedPayment(s)} activeOpacity={0.85}>
              <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: isPaid ? COLORS.paid : COLORS.unpaid }]}>
                  <Text style={styles.avatarTxt}>{farmer?.name?.[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.farmerName}>{farmer?.name}</Text>
                  <Text style={styles.farmerSub}>{farmer?.mobile} • {farmer?.village}</Text>
                  <Text style={styles.farmerSub}>{s.cols.length} entries • {s.totalMilk}L total</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[styles.amt, { color: isPaid ? COLORS.paid : COLORS.unpaid }]}>
                    {formatCurrency(s.totalAmt)}
                  </Text>
                  <Badge status={isPaid ? 'paid' : 'unpaid'} size="sm" />
                </View>
              </View>

              {/* Mini entries preview */}
              <View style={styles.miniEntries}>
                {s.cols.slice(0, 3).map(c => (
                  <View key={c.id} style={styles.miniEntry}>
                    <Text style={styles.miniEntryTxt}>
                      {c.date} {c.shift === 'morning' ? '🌅' : '🌙'} {c.quantity}L
                    </Text>
                    <Text style={[styles.miniEntryAmt, { color: COLORS.primary }]}>{formatCurrency(c.amount)}</Text>
                  </View>
                ))}
                {s.cols.length > 3 && (
                  <Text style={styles.moreEntries}>+{s.cols.length - 3} aur entries...</Text>
                )}
              </View>

              {!isPaid && (
                <TouchableOpacity style={styles.payNowBtn} onPress={() => setSelectedPayment(s)}>
                  <Text style={styles.payNowTxt}>💳 Payment Karo</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Payment Detail Modal */}
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
              const isPaid = selectedPayment.pay?.status === 'paid';
              return (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarTxt}>{farmer?.name?.[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.farmerName}>{farmer?.name}</Text>
                      <Text style={styles.farmerSub}>{farmer?.mobile} • {farmer?.village}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedPayment(null)} style={styles.closeBtn}>
                      <Text style={styles.closeTxt}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Amount Box */}
                  <View style={[styles.amtBox, { backgroundColor: isPaid ? COLORS.paidBg : COLORS.unpaidBg }]}>
                    <Text style={styles.amtLbl}>Kul Rashi / Total Amount</Text>
                    <Text style={[styles.amtBig, { color: isPaid ? COLORS.paid : COLORS.unpaid }]}>
                      {formatCurrency(selectedPayment.totalAmt)}
                    </Text>
                    <Text style={styles.amtSub}>{selectedPayment.totalMilk}L total milk • {selectedPayment.cols.length} entries</Text>
                    {isPaid && (
                      <Text style={styles.paidInfo}>
                        ✅ Paid on {formatDate(selectedPayment.pay.paymentDate)} via {selectedPayment.pay.paymentMode}
                      </Text>
                    )}
                  </View>

                  {/* All Entries */}
                  <Text style={styles.entriesTitle}>📋 Sab Entries ({selectedPayment.cols.length})</Text>
                  <View style={styles.entriesBox}>
                    {/* Group by date */}
                    {[...new Set(selectedPayment.cols.map((c: any) => c.date))].map((date: any) => {
                      const dayEntries = selectedPayment.cols.filter((c: any) => c.date === date);
                      const dayTotal = dayEntries.reduce((s: number, c: any) => s + c.amount, 0);
                      return (
                        <View key={date} style={styles.dateGroup}>
                          <View style={styles.dateGroupHeader}>
                            <Text style={styles.dateGroupDate}>📅 {date}</Text>
                            <Text style={styles.dateGroupTotal}>{formatCurrency(dayTotal)}</Text>
                          </View>
                          {dayEntries.map((c: any) => (
                            <View key={c.id} style={styles.entryRow}>
                              <Text style={styles.entryShift}>{c.shift === 'morning' ? '🌅 Subah' : '🌙 Shaam'}</Text>
                              <Text style={styles.entryDetail}>{c.quantity}L • Fat:{c.fat} • SNF:{c.snf}</Text>
                              <Text style={styles.entryAmt}>{formatCurrency(c.amount)}</Text>
                            </View>
                          ))}
                        </View>
                      );
                    })}
                  </View>

                  {/* Payment Action */}
                  {!isPaid ? (
                    <>
                      <Text style={styles.modeLbl}>💳 Payment Tarika Chunein</Text>
                      <View style={styles.modeRow}>
                        {(['UPI', 'Cash'] as const).map(m => (
                          <TouchableOpacity key={m}
                            style={[styles.modeBtn, payMode === m && styles.modeBtnActive]}
                            onPress={() => setPayMode(m)}>
                            <Text style={styles.modeIcon}>{m === 'UPI' ? '📱' : '💵'}</Text>
                            <Text style={[styles.modeTxt, payMode === m && styles.modeTxtActive]}>{m}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {payMode === 'UPI' && (
                        <View style={styles.qrBox}>
                          <Text style={{ fontSize: 56 }}>📲</Text>
                          <Text style={styles.qrTxt}>UPI: delhuan.dairy@upi</Text>
                          <Text style={styles.qrSub}>Amount: {formatCurrency(selectedPayment.totalAmt)}</Text>
                        </View>
                      )}
                      <View style={styles.modalBtns}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedPayment(null)}>
                          <Text style={styles.cancelTxt}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.confirmBtn, paying && { opacity: 0.7 }]}
                          onPress={handlePay} disabled={paying}>
                          {paying
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.confirmTxt}>✅ Confirm Payment</Text>}
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity style={[styles.cancelBtn, { marginTop: 12 }]} onPress={() => setSelectedPayment(null)}>
                      <Text style={styles.cancelTxt}>Close</Text>
                    </TouchableOpacity>
                  )}
                  <View style={{ height: 24 }} />
                </ScrollView>
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
  topSummary: { flexDirection: 'row', padding: 16, paddingBottom: 8, gap: 12 },
  sumCard: { flex: 1, borderRadius: 16, padding: 14 },
  sumVal: { fontSize: 20, fontWeight: '800' },
  sumLbl: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  modeTabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 14, padding: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  modeTab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  modeTabActive: { backgroundColor: COLORS.primary },
  modeTabTxt: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  modeTabTxtActive: { color: '#fff' },
  subScroll: { marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipTxt: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  chipTxtActive: { color: '#fff' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, gap: 8 },
  statusBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border },
  statusBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusTxt: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  statusTxtActive: { color: '#fff' },
  countTxt: { fontSize: 12, color: COLORS.textLight, marginLeft: 'auto' },
  payCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontWeight: '700', fontSize: 18 },
  farmerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  farmerSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  amt: { fontSize: 16, fontWeight: '800' },
  miniEntries: { backgroundColor: '#F8F8F8', borderRadius: 10, padding: 8, marginBottom: 8 },
  miniEntry: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  miniEntryTxt: { fontSize: 12, color: COLORS.textSecondary },
  miniEntryAmt: { fontSize: 12, fontWeight: '600' },
  moreEntries: { fontSize: 11, color: COLORS.primary, marginTop: 2, fontWeight: '600' },
  payNowBtn: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 10, alignItems: 'center' },
  payNowTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTxt: { fontSize: 15, color: COLORS.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  closeBtn: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 20 },
  closeTxt: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '700' },
  amtBox: { borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 16 },
  amtLbl: { fontSize: 13, color: COLORS.textSecondary },
  amtBig: { fontSize: 34, fontWeight: '800', marginTop: 4 },
  amtSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  paidInfo: { fontSize: 13, color: COLORS.paid, fontWeight: '600', marginTop: 6 },
  entriesTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  entriesBox: { backgroundColor: '#F8F8F8', borderRadius: 14, padding: 12, marginBottom: 16 },
  dateGroup: { marginBottom: 10 },
  dateGroupHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  dateGroupDate: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  dateGroupTotal: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  entryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: COLORS.border, marginBottom: 2 },
  entryShift: { fontSize: 12, color: COLORS.text, width: 80 },
  entryDetail: { fontSize: 11, color: COLORS.textSecondary, flex: 1 },
  entryAmt: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  modeLbl: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  modeRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: COLORS.border },
  modeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.paidBg },
  modeIcon: { fontSize: 22 },
  modeTxt: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary },
  modeTxtActive: { color: COLORS.primary },
  qrBox: { backgroundColor: '#F5F5F5', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 14 },
  qrTxt: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 8 },
  qrSub: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelTxt: { fontWeight: '600', color: COLORS.textSecondary },
  confirmBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
  confirmTxt: { fontWeight: '700', color: '#fff', fontSize: 15 },
  successView: { alignItems: 'center', paddingVertical: 40 },
  successIcon: { fontSize: 72, marginBottom: 16 },
  successTxt: { fontSize: 24, fontWeight: '800', color: COLORS.paid },
  successSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },
});
