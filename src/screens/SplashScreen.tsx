import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

interface Props { onDone: () => void; }

export default function SplashScreen({ onDone }: Props) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const circleScale1 = useRef(new Animated.Value(0)).current;
  const circleScale2 = useRef(new Animated.Value(0)).current;
  const circleScale3 = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Circles expand
      Animated.parallel([
        Animated.spring(circleScale1, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.delay(100),
      ]),
      Animated.parallel([
        Animated.spring(circleScale2, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }),
        Animated.spring(circleScale3, { toValue: 1, tension: 30, friction: 8, useNativeDriver: true }),
      ]),
      // Logo pop in
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      // Title slide up
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(titleY, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
      // Subtitle + tagline
      Animated.parallel([
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      // Hold
      Animated.delay(1200),
      // Fade out
      Animated.timing(fadeOut, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onDone());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      {/* Background circles */}
      <Animated.View style={[styles.circle1, { transform: [{ scale: circleScale1 }] }]} />
      <Animated.View style={[styles.circle2, { transform: [{ scale: circleScale2 }] }]} />
      <Animated.View style={[styles.circle3, { transform: [{ scale: circleScale3 }] }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🥛</Text>
        </View>
        {/* Shine effect */}
        <View style={styles.shine} />
      </Animated.View>

      {/* Title */}
      <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}>
        <Text style={styles.title}>Delhuan Dairy</Text>
      </Animated.View>

      {/* Hindi subtitle */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        दिलहुआन डेयरी
      </Animated.Text>

      {/* Welcome text */}
      <Animated.Text style={[styles.welcome, { opacity: taglineOpacity }]}>
        🙏 Welcome to Delhuan Dairy
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Dairy Management System
      </Animated.Text>

      {/* Bottom dots loader */}
      <Animated.View style={[styles.dotsRow, { opacity: taglineOpacity }]}>
        {[0, 1, 2].map(i => (
          <DotsAnim key={i} delay={i * 200} />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

function DotsAnim({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
  }, []);
  return <Animated.View style={[styles.dot, { opacity: anim }]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999,
  },
  circle1: {
    position: 'absolute', width: width * 1.4, height: width * 1.4,
    borderRadius: width * 0.7, backgroundColor: 'rgba(255,255,255,0.04)',
    top: -width * 0.5,
  },
  circle2: {
    position: 'absolute', width: width * 1.0, height: width * 1.0,
    borderRadius: width * 0.5, backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -width * 0.3, right: -width * 0.2,
  },
  circle3: {
    position: 'absolute', width: width * 0.6, height: width * 0.6,
    borderRadius: width * 0.3, backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: height * 0.1, left: -width * 0.1,
  },
  logoWrap: { marginBottom: 24, position: 'relative' },
  logoCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 16,
  },
  logoEmoji: { fontSize: 56 },
  shine: {
    position: 'absolute', top: 8, left: 20,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  title: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: 1, textAlign: 'center' },
  subtitle: { fontSize: 18, color: 'rgba(255,255,255,0.85)', marginTop: 6, textAlign: 'center' },
  welcome: { fontSize: 15, color: 'rgba(255,255,255,0.7)', marginTop: 20, textAlign: 'center' },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, textAlign: 'center' },
  dotsRow: { flexDirection: 'row', gap: 8, marginTop: 40 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
});
