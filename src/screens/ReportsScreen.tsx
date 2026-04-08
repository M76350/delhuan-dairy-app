import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useStore } from '../hooks/useStore';
import { COLORS } from '../utils/theme';
import { formatCurrency } from '../utils/calculations';
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function ReportsScreen() {
  const { farmers, collections, payments, cycles } = useStore();

  const totalMilk = collections.reduce((s, c) => s + c.quantity, 0);
  const totalAmount = payments.reduce((s, p) => s + p.totalAmount, 0);
  const paidAmount = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.totalAmount, 0);
  const pendingAmount = payments.filter(p => p.status === 'unpaid').reduce((s, p) => s + p.totalAmount, 0);

  // Per farmer summary
  const farmerSummary = farmers.map(f => {
    const cols = collections.filter(c => c.farmerId === f.id);
    const pays = payments.filter(p => p.farmerId === f.id);
    const milk = cols.reduce((s, c) => s + c.quantity, 0);
    const earned = pays.reduce((s, p) => s + p.totalAmount, 0);
    const avgFat = cols.length ? (cols.reduce((s, c) => s + c.fat, 0) / cols.length).toFixed(1) : '0';
    const avgSnf = cols.length ? (cols.reduce((s, c) => s + c.snf, 0) / cols.length).toFixed(1) : '0';
    const pending = pays.filter(p => p.status === 'unpaid').reduce((s, p) => s + p.totalAmount, 0);
    return { farmer: f, milk, earned, avgFat, avgSnf, pending, entries: cols.length };
  }).filter(s => s.entries > 0).sort((a, b) => b.milk - a.milk);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Overall Stats */}
      <View style={styles.overallGrid}>
        {[
          { label: 'Kul Doodh', value: `${totalMilk} L`, icon: '🥛', color: '#1565C0', bg: COLORS.eveningBg },
          { label: 'Kul Rashi', value: formatCurrency(totalAmount), icon: '💰', color: COLORS.primary, bg: COLORS.paidBg },
          { label: 'Kiya Bhugtan', value: formatCurrency(paidAmount), icon: '✅', color: COLORS.paid, bg: COLORS.paidBg },
          { label: 'Baki Bhugtan', value: formatCurrency(pendingAmount), icon: '⏳', color: COLORS.unpaid, bg: COLORS.unpaidBg },
        ].map((s, i) => (
          <View key={i} style={[styles.overallCard, { backgroundColor: s.bg }]}>
            <Text style={styles.overallIcon}>{s.icon}</Text>
            <Text style={[styles.overallVal, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.overallLbl}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Cycle Summary */}
      <Text style={styles.sectionTitle}>Cycle Summary / चक्र सारांश</Text>
      {cycles.map(cycle => {
        const cycleCols = collections.filter(c => c.cycleId === cycle.id);
        const cyclePays = payments.filter(p => p.cycleId === cycle.id);
        const cycleMilk = cycleCols.reduce((s, c) => s + c.quantity, 0);
        const cycleAmount = cyclePays.reduce((s, p) => s + p.totalAmount, 0);
        const paidCount = cyclePays.filter(p => p.status === 'paid').length;
        return (
          <Card key={cycle.id} style={styles.cycleCard}>
            <View style={styles.cycleHeader}>
              <Text style={styles.cycleId}>{cycle.id}</Text>
              <View style={[styles.cycleBadge, { backgroundColor: cycle.status === 'active' ? COLORS.paidBg : '#F5F5F5' }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: cycle.status === 'active' ? COLORS.paid : COLORS.textSecondary }}>
                  {cycle.status === 'active' ? '🟢 Active' : '🔒 Closed'}
                </Text>
              </View>
            </View>
            <Text style={styles.cycleDates}>{cycle.startDate} → {cycle.endDate}</Text>
            <View style={styles.cycleStats}>
              <View style={styles.cycleStat}><Text style={styles.cycleStatVal}>{cycleMilk}L</Text><Text style={styles.cycleStatLbl}>Doodh</Text></View>
              <View style={styles.cycleStat}><Text style={styles.cycleStatVal}>{formatCurrency(cycleAmount)}</Text><Text style={styles.cycleStatLbl}>Rashi</Text></View>
              <View style={styles.cycleStat}><Text style={styles.cycleStatVal}>{paidCount}/{cyclePays.length}</Text><Text style={styles.cycleStatLbl}>Paid</Text></View>
            </View>
          </Card>
        );
      })}

      {/* Farmer-wise Report */}
      <Text style={styles.sectionTitle}>Kisan-wise Report / किसान रिपोर्ट</Text>
      {farmerSummary.map(({ farmer: f, milk, earned, avgFat, avgSnf, pending, entries }) => (
        <Card key={f.id} style={styles.farmerCard}>
          <View style={styles.farmerRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{f.name[0]}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.farmerName}>{f.name}</Text>
              <Text style={styles.farmerSub}>{entries} entries • Avg Fat:{avgFat}% • SNF:{avgSnf}%</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.farmerMilk}>{milk} L</Text>
              <Text style={[styles.farmerEarned, { color: COLORS.paid }]}>{formatCurrency(earned)}</Text>
            </View>
          </View>
          {pending > 0 && (
            <View style={styles.pendingRow}>
              <Text style={styles.pendingText}>⏳ Baki: {formatCurrency(pending)}</Text>
            </View>
          )}
        </Card>
      ))}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  overallGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  overallCard: { width: '47%', borderRadius: 16, padding: 14 },
  overallIcon: { fontSize: 26, marginBottom: 6 },
  overallVal: { fontSize: 18, fontWeight: '700' },
  overallLbl: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginHorizontal: 16, marginBottom: 8, marginTop: 4 },
  cycleCard: { marginHorizontal: 16, marginBottom: 10 },
  cycleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cycleId: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  cycleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  cycleDates: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 10 },
  cycleStats: { flexDirection: 'row', gap: 12 },
  cycleStat: { flex: 1, backgroundColor: '#F8F8F8', borderRadius: 10, padding: 10, alignItems: 'center' },
  cycleStatVal: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  cycleStatLbl: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  farmerCard: { marginHorizontal: 16, marginBottom: 8 },
  farmerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  farmerName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  farmerSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  farmerMilk: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  farmerEarned: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  pendingRow: { marginTop: 8, backgroundColor: COLORS.unpaidBg, borderRadius: 8, padding: 6 },
  pendingText: { fontSize: 12, color: COLORS.unpaid, fontWeight: '600' },
});
