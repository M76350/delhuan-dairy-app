import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { COLORS } from '../utils/theme';

const USERS = [
  { id: 'u1', username: 'admin', password: 'dairy123', name: 'Dairy Owner', role: 'admin' },
  { id: 'u2', username: 'manager', password: 'mgr123', name: 'Manager', role: 'manager' },
];

interface Props { onLogin: (user: any) => void; }

export default function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!username || !password) return Alert.alert('Error', 'Username aur password dalein');
    setLoading(true);
    setTimeout(() => {
      const user = USERS.find(u => u.username === username && u.password === password);
      setLoading(false);
      if (user) onLogin(user);
      else Alert.alert('Login Failed', 'Galat username ya password');
    }, 800);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🥛</Text>
          </View>
          <Text style={styles.appName}>Delhuan Dairy</Text>
          <Text style={styles.appNameHi}>दिलहुआन डेयरी</Text>
          <Text style={styles.tagline}>Dairy Management System</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Welcome Back / स्वागत है</Text>
          <Text style={styles.subText}>Apna account login karein</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>👤 Username</Text>
            <TextInput
              style={styles.input}
              placeholder="admin"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>🔒 Password</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.loginBtn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Login / लॉगिन करें</Text>}
          </TouchableOpacity>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Credentials:</Text>
            <Text style={styles.demoText}>admin / dairy123</Text>
            <Text style={styles.demoText}>manager / mgr123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.primary, justifyContent: 'center', padding: 24 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  logoEmoji: { fontSize: 44 },
  appName: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  appNameHi: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  welcomeText: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subText: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#FAFAFA', color: COLORS.text },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 12, backgroundColor: '#F5F5F5', borderRadius: 12, borderWidth: 1.5, borderColor: '#E0E0E0' },
  loginBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  demoBox: { marginTop: 20, padding: 12, backgroundColor: '#F8F8F8', borderRadius: 12, borderWidth: 1, borderColor: '#E8E8E8' },
  demoTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 4 },
  demoText: { fontSize: 12, color: COLORS.textLight, fontFamily: 'monospace' },
});
