import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useStore } from '../hooks/useStore';
import { COLORS } from '../utils/theme';
import { formatCurrency, formatDate } from '../utils/calculations';
import Card from '../components/Card';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';

export default function FarmerDetailScreen() {
  const { params } = useRoute<any>();
  const { farmers, collections, payments, cycles } = useStore();
  const [cycleFilter, setCycleFilter] = useState<string>('all');

  const farmer = farmers.find(f => f.id === params.farmerId);
  const farmerCollections = collections.filter(c => c.farmerId === params.farmerId);
  const farmerPayments = payments.filter(p => p.farmerId === params.farmerId);

  const filtered = cycleFilter === 'all' ? farmerCollections : farmerCollections.filter(c => c.cycleId === cycleFilter);

  const totalMilk = farmerCollections.reduce((s, c) => s + c.quantity, 0);
  const totalEarned = farmerPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.totalAmount, 0);

  if (!farmer) return <View style={styles.container}><Text>Kisan nahi mila</Text></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Farmer Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{farmer.name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{farmer.name}</Text>
          <Text style={styles.sub}>📱 {farmer.mobile}</Text>
          <Text style={styles.sub}>📍 {farmer.village}</Text>
        </View>
        <View style={[styles.activeBadge, { backgroundColor: farmer.active ? COLORS.paidBg : COLORS.unpaidBg }]}>
          <Text style={{ color: farmer.active ? COLORS.paid : COLORS.unpaid, fontWeight: '700', fontSize: 12 }}>
            {farmer.active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{totalMilk} L</Text>
          <Text style={styles.statLbl}>Kul Doodh</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{farmerCollections.length}</Text>
          <Text style={styles.statLbl}>Entries</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: COLORS.paid }]}>{formatCurrency(totalEarned)}</Text>
          <Text style={styles.statLbl}>Kiya Bhugtan</Text>
        </View>
      </View>

      {/* Cycle Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        <TouchableOpacity style={[styles.filterBtn, cycleFilter === 'all' && styles.filterActive]} onPress={() => setCycleFilter('all')}>
          <Text style={[styles.filterText, cycleFilter === 'all' && styles.filterTextActive]}>Sab / All</Text>
        </TouchableOpacity>
        {cycles.map(c => (
          <TouchableOpacity key={c.id} style={[styles.filterBtn, cycleFilter === c.id && styles.filterActive]} onPress={() => setCycleFilter(c.id)}>
            <Text style={[styles.filterText, cycleFilter === c.id && styles.filterTextActive]}>{c.id} ({c.startDate})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Payment Summary per cycle */}
      <Text style={styles.sectionTitle}>Bhugtan / Payments</Text>
      {farmerPayments.map(p => (
        <Card key={p.id} style={styles.payCard}>
          <View style={styles.payRow}>
            <View>
              <Text style={styles.payLabel}>Cycle: {p.cycleId}</Text>
              <Text style={styles.paySub}>{p.totalMilk}L • {formatCurrency(p.totalAmount)}</Text>
              {p.paymentDate && <Text style={styles.paySub}>📅 {formatDate(p.paymentDate)} • {p.paymentMode}</Text>}
            </View>
            <Badge status={p.status} />
          </View>
        </Card>
      ))}

      {/* Collections */}
      <Text style={styles.sectionTitle}>Doodh Entries ({filtered.length})</Text>
      {filtered.length === 0 ? (
        <EmptyState icon="🥛" title="Koi entry nahi" />
      ) : (
        filtered.map(c => (
          <Card key={c.id} style={styles.entryCard}>
            <View style={styles.entryRow}>
              <View style={[styles.shiftBadge, { backgroundColor: c.shift === 'morning' ? COLORS.morningBg : COLORS.eveningBg }]}>
                <Text style={{ fontSize: 18 }}>{c.shift === 'morning' ? '🌅' : '🌙'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.entryDate}>{formatDate(c.date)}</Text>
                <Text style={styles.entrySub}>{c.quantity}L • Fat:{c.fat}% • SNF:{c.snf}% • Rate:{formatCurrency(c.rate)}</Text>
              </View>
              <Text style={styles.entryAmount}>{formatCurrency(c.amount)}</Text>
            </View>
          </Card>
        ))
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: '#fff' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  activeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statsRow: { flexDirection: 'row', margin: 16, gap: 10 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  statVal: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  statLbl: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
  filterScroll: { marginBottom: 12 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border },
  filterActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  filterTextActive: { color: '#fff' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginHorizontal: 16, marginBottom: 8 },
  payCard: { marginHorizontal: 16, marginBottom: 8 },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  payLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  paySub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  entryCard: { marginHorizontal: 16, marginBottom: 8, padding: 12 },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  shiftBadge: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  entryDate: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  entrySub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  entryAmount: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
});
