import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

interface Props {
  status: 'paid' | 'unpaid';
  size?: 'sm' | 'md';
}

export default function Badge({ status, size = 'md' }: Props) {
  const isPaid = status === 'paid';
  return (
    <View style={[styles.badge, isPaid ? styles.paid : styles.unpaid, size === 'sm' && styles.sm]}>
      <Text style={[styles.text, isPaid ? styles.paidText : styles.unpaidText, size === 'sm' && styles.smText]}>
        {isPaid ? '🟢 Paid' : '🔴 Unpaid'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  paid: { backgroundColor: COLORS.paidBg },
  unpaid: { backgroundColor: COLORS.unpaidBg },
  sm: { paddingHorizontal: 8, paddingVertical: 2 },
  text: { fontSize: 13, fontWeight: '600' },
  smText: { fontSize: 11 },
  paidText: { color: COLORS.paid },
  unpaidText: { color: COLORS.unpaid },
});
