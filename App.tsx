import React from 'react';
import { Platform, View, ViewStyle, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Heebo_400Regular, Heebo_500Medium, Heebo_700Bold } from '@expo-google-fonts/heebo';
import { AppProvider, useApp } from './src/store';
import { Admin, Board, Coach, Home, Log, Progress, RankUp, Settings, Share, Summary } from './src/screens';
import { T } from './src/ui';

const SCREENS = { home: Home, log: Log, summary: Summary, share: Share, progress: Progress, board: Board, settings: Settings, coach: Coach, admin: Admin };

function Router() {
  const { screen, toast, he, frame } = useApp();
  const Screen = SCREENS[screen];
  return (
    <View style={{ flex: 1 }}>
      <Screen />
      <RankUp />
      {toast && (
        <View pointerEvents="none" style={{ position: 'absolute', left: 20, right: 20, bottom: frame ? 150 : 130, alignItems: 'center', direction: he ? 'rtl' : 'ltr' } as ViewStyle}>
          <View style={{ backgroundColor: '#2B1111', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 18 }}>
            <T w={500} s={14} c="#FFFFFF" style={{ textAlign: 'center' }}>{toast}</T>
          </View>
        </View>
      )}
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({
    Heebo_400Regular, Heebo_500Medium, Heebo_700Bold,
    Archivo: require('./assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Medium': require('./assets/fonts/Archivo-Medium.ttf'),
    'Archivo-ExtraBold': require('./assets/fonts/Archivo-ExtraBold.ttf'),
    NarkissBlock: require('./assets/fonts/NarkissBlock-Regular.otf'),
  });
  const { width, height } = useWindowDimensions();
  if (!loaded) return null;

  // Wide screens (laptop): show the app inside an iPhone-sized frame, scaled to fit the window height.
  // Narrow screens (phone): the app fills the screen.
  const frame = width > 520;
  const scale = Math.min(1, (height - 48) / 870);
  return (
    <AppProvider frame={frame}>
      {frame ? (
        <View style={{ flex: 1, backgroundColor: '#D8D5D0', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 393, height: 852, transform: [{ scale }] }}>
            <View style={{ flex: 1, borderRadius: 54, overflow: 'hidden', backgroundColor: '#FFFFFF', boxShadow: '0 0 0 9px #2B1111, 0 24px 60px rgba(43,17,17,0.28)' } as ViewStyle}>
              <Router />
            </View>
          </View>
        </View>
      ) : (
        <View style={{ width: '100%', height: Platform.OS === 'web' ? ('100dvh' as unknown as number) : '100%', backgroundColor: '#FFFFFF' }}>
          <Router />
        </View>
      )}
      <StatusBar style="auto" />
    </AppProvider>
  );
}
