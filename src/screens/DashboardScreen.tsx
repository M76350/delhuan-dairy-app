import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../hooks/useStore';
import { COLORS } from '../utils/theme';
import { formatCurrency } from '../utils/calculations';

interface Props { user: any; }

export default function DashboardScreen({ user }: Props) {
  const nav = useNavigation<any>();
  const { farmers, collections, payments, activeCycle } = useStore();

  const todayStr = '2024-01-15';
  const todayCollections = collections.filter(c => c.date === todayStr);
  const todayMilk = todayCollections.reduce((s, c) => s + c.quantity, 0);
  const todayAmount = todayCollections.reduce((s, c) => s + c.amount, 0);
  const morningCount = todayCollections.filter(c => c.shift === 'morning').length;
  const eveningCount = todayCollections.filter(c => c.shift === 'evening').length;
  const pendingPayments = payments.filter(p => p.status === 'unpaid');
  const pendingAmount = pendingPayments.reduce((s, p) => s + p.totalAmount, 0);
  const paidAmount = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.totalAmount, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Namaste, {user?.name} 👋</Text>
            <Text style={styles.date}>📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <View style={styles.cyclePill}>
            <Text style={styles.cycleText}>🔄 {activeCycle?.id}</Text>
          </View>
        </View>

        {/* Today Summary in header */}
        <View style={styles.headerCards}>
          <View style={styles.headerCard}>
            <Text style={styles.headerCardVal}>{todayMilk} L</Text>
            <Text style={styles.headerCardLbl}>Aaj ka Doodh</Text>
          </View>
          <View style={[styles.headerCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={styles.headerCardVal}>{formatCurrency(todayAmount)}</Text>
            <Text style={styles.headerCardLbl}>Aaj ki Kharid</Text>
          </View>
          <View style={[styles.headerCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={styles.headerCardVal}>{todayCollections.length}</Text>
            <Text style={styles.headerCardLbl}>Entries</Text>
          </View>
        </View>
      </View>

      {/* Shift Summary */}
      <View style={styles.shiftRow}>
        <View style={[styles.shiftCard, { backgroundColor: COLORS.morningBg }]}>
          <Text style={styles.shiftIcon}>🌅</Text>
          <Text style={[styles.shiftVal, { color: COLORS.morning }]}>{morningCount}</Text>
          <Text style={styles.shiftLbl}>Subah / Morning</Text>
          <Text style={[styles.shiftMilk, { color: COLORS.morning }]}>
            {collections.filter(c => c.date === todayStr && c.shift === 'morning').reduce((s, c) => s + c.quantity, 0)} L
          </Text>
        </View>
        <View style={[styles.shiftCard, { backgroundColor: COLORS.eveningBg }]}>
          <Text style={styles.shiftIcon}>🌙</Text>
          <Text style={[styles.shiftVal, { color: COLORS.evening }]}>{eveningCount}</Text>
          <Text style={styles.shiftLbl}>Shaam / Evening</Text>
          <Text style={[styles.shiftMilk, { color: COLORS.evening }]}>
            {collections.filter(c => c.date === todayStr && c.shift === 'evening').reduce((s, c) => s + c.quantity, 0)} L
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {[
          { label: 'Kul Kisan', value: farmers.filter(f => f.active).length, icon: '👨‍🌾', color: COLORS.primary, bg: COLORS.paidBg, screen: 'FarmersTab' },
          { label: 'Baki Bhugtan', value: formatCurrency(pendingAmount), icon: '⏳', color: COLORS.unpaid, bg: COLORS.unpaidBg, screen: 'PaymentsTab' },
          { label: 'Kiya Bhugtan', value: formatCurrency(paidAmount), icon: '✅', color: COLORS.paid, bg: '#E8F5E9', screen: 'PaymentsTab' },
          { label: 'Pending Kisan', value: pendingPayments.length, icon: '🔴', color: COLORS.unpaid, bg: COLORS.unpaidBg, screen: 'PaymentsTab' },
        ].map((s, i) => (
          <TouchableOpacity key={i} style={[styles.statCard, { backgroundColor: s.bg }]}
            onPress={() => nav.navigate(s.screen)} activeOpacity={0.8}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLbl}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        {[
          { icon: '🥛', label: 'Doodh Entry', screen: 'CollectionTab', color: '#E3F2FD' },
          { icon: '👨‍🌾', label: 'Kisan', screen: 'FarmersTab', color: '#E8F5E9' },
          { icon: '💰', label: 'Bhugtan', screen: 'PaymentsTab', color: '#FFF8E1' },
          { icon: '📊', label: 'Report', screen: 'ReportsTab', color: '#F3E5F5' },
        ].map((a, i) => (
          <TouchableOpacity key={i} style={[styles.quickBtn, { backgroundColor: a.color }]}
            onPress={() => nav.navigate(a.screen)} activeOpacity={0.8}>
            <Text style={styles.quickIcon}>{a.icon}</Text>
            <Text style={styles.quickLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Today's Entries */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Aaj ki Entries</Text>
        <TouchableOpacity onPress={() => nav.navigate('CollectionTab')}>
          <Text style={styles.seeAll}>Sab dekho →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.entriesCard}>
        {todayCollections.length === 0 ? (
          <Text style={styles.emptyText}>Aaj koi entry nahi hai</Text>
        ) : (
          todayCollections.slice(0, 6).map((c, i) => {
            const farmer = farmers.find(f => f.id === c.farmerId);
            return (
              <TouchableOpacity key={c.id}
                style={[styles.entryRow, i < todayCollections.length - 1 && styles.entryBorder]}
                onPress={() => nav.navigate('FarmerDetail', { farmerId: c.farmerId })}
                activeOpacity={0.7}>
                <View style={styles.entryAvatar}>
                  <Text style={styles.entryAvatarText}>{farmer?.name?.[0] || '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.entryName}>{farmer?.name || 'Unknown'}</Text>
                  <Text style={styles.entrySub}>
                    {c.shift === 'morning' ? '🌅' : '🌙'} {c.quantity}L • Fat:{c.fat} • SNF:{c.snf}
                  </Text>
                </View>
                <Text style={styles.entryAmt}>{formatCurrency(c.amount)}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Pending Payments */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Baki Bhugtan</Text>
        <TouchableOpacity onPress={() => nav.navigate('PaymentsTab')}>
          <Text style={styles.seeAll}>Sab dekho →</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.entriesCard, { marginBottom: 32 }]}>
        {pendingPayments.length === 0 ? (
          <Text style={styles.emptyText}>Sab bhugtan ho gaya! 🎉</Text>
        ) : (
          pendingPayments.slice(0, 4).map((p, i) => {
            const farmer = farmers.find(f => f.id === p.farmerId);
            return (
              <View key={p.id} style={[styles.entryRow, i < pendingPayments.length - 1 && styles.entryBorder]}>
                <View style={[styles.entryAvatar, { backgroundColor: COLORS.unpaid }]}>
                  <Text style={styles.entryAvatarText}>{farmer?.name?.[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.entryName}>{farmer?.name}</Text>
                  <Text style={styles.entrySub}>{p.totalMilk}L • {p.cycleId}</Text>
                </View>
                <Text style={[styles.entryAmt, { color: COLORS.unpaid }]}>{formatCurrency(p.totalAmount)}</Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 18, fontWeight: '700', color: '#fff' },
  date: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  cyclePill: { backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  cycleText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  headerCards: { flexDirection: 'row', gap: 8 },
  headerCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: 12, alignItems: 'center' },
  headerCardVal: { fontSize: 16, fontWeight: '800', color: '#fff' },
  headerCardLbl: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2, textAlign: 'center' },
  shiftRow: { flexDirection: 'row', margin: 16, gap: 12 },
  shiftCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  shiftIcon: { fontSize: 28, marginBottom: 4 },
  shiftVal: { fontSize: 24, fontWeight: '800' },
  shiftLbl: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  shiftMilk: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 4 },
  statCard: { width: '47%', borderRadius: 16, padding: 14 },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statVal: { fontSize: 18, fontWeight: '700' },
  statLbl: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  quickActions: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 4 },
  quickBtn: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  quickIcon: { fontSize: 26, marginBottom: 4 },
  quickLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text },
  entriesCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  entryRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  entryBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  entryAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  entryAvatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  entryName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  entrySub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  entryAmt: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, padding: 20 },
});
