import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity } from 'react-native';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import FarmersScreen from './src/screens/FarmersScreen';
import FarmerDetailScreen from './src/screens/FarmerDetailScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import { COLORS } from './src/utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' as const, fontSize: 17 },
  headerShadowVisible: false,
};

function FarmersStack() {
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="FarmersList" component={FarmersScreen} options={{ title: '👨‍🌾 Kisan List' }} />
      <Stack.Screen name="FarmerDetail" component={FarmerDetailScreen} options={{ title: 'Kisan Detail' }} />
    </Stack.Navigator>
  );
}

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 2 }}>
      <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
      <Text style={{
        fontSize: 10, marginTop: 1,
        fontWeight: focused ? '700' : '500',
        color: focused ? COLORS.primary : COLORS.textLight,
      }}>{label}</Text>
    </View>
  );
}

function MainApp({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          ...headerStyle,
          tabBarStyle: {
            height: 64, paddingBottom: 8, paddingTop: 4,
            backgroundColor: '#fff',
            borderTopWidth: 1, borderTopColor: '#EEEEEE',
            elevation: 12, shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.08, shadowRadius: 10,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="DashboardTab"
          options={{
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 22 }}>🥛</Text>
                <View>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Delhuan Dairy</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>दिलहुआन डेयरी</Text>
                </View>
              </View>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={onLogout}
                style={{ marginRight: 16, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Logout</Text>
              </TouchableOpacity>
            ),
            tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
          }}
        >
          {() => <DashboardScreen user={user} />}
        </Tab.Screen>

        <Tab.Screen name="CollectionTab" component={CollectionScreen}
          options={{ title: '🥛 Doodh Entry', tabBarIcon: ({ focused }) => <TabIcon emoji="🥛" label="Doodh" focused={focused} /> }} />

        <Tab.Screen name="FarmersTab" component={FarmersStack}
          options={{ headerShown: false, tabBarIcon: ({ focused }) => <TabIcon emoji="👨‍🌾" label="Kisan" focused={focused} /> }} />

        <Tab.Screen name="PaymentsTab" component={PaymentsScreen}
          options={{ title: '💰 Bhugtan', tabBarIcon: ({ focused }) => <TabIcon emoji="💰" label="Bhugtan" focused={focused} /> }} />

        <Tab.Screen name="ReportsTab" component={ReportsScreen}
          options={{ title: '📊 Report', tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Report" focused={focused} /> }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

type AppState = 'splash' | 'login' | 'app';

export default function App() {
  const [state, setState] = useState<AppState>('splash');
  const [user, setUser] = useState<any>(null);

  if (state === 'splash') {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen onDone={() => setState('login')} />
      </>
    );
  }

  if (state === 'login') {
    return (
      <>
        <StatusBar style="light" />
        <LoginScreen onLogin={(u) => { setUser(u); setState('app'); }} />
      </>
    );
  }

  return <MainApp user={user} onLogout={() => { setUser(null); setState('login'); }} />;
}
