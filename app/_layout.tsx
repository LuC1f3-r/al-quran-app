import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';

import { MiniPlayer } from '../components/MiniPlayer';
import { SplashScreen } from '../components/SplashScreen';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);
  const router = useRouter();
  const hasNavigated = useRef(false);

  const [fontsLoaded] = useFonts({
    'UthmanicHafs': require('../assets/fonts/UthmanicHafs1Ver09.ttf'),
    'UthmaniScript': require('../assets/fonts/uthmani-script.ttf'),
    'IndoPakScript': require('../assets/fonts/indo-pak-script.ttf'),
  });

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  /* ── Auth gating — runs ONCE after splash finishes ── */
  useEffect(() => {
    if (showSplash || !fontsLoaded || hasNavigated.current) return;

    if (!hasCompletedOnboarding) {
      hasNavigated.current = true;
      router.replace('/onboarding/welcome');
    }
  }, [showSplash, fontsLoaded, hasCompletedOnboarding]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F7B3F', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        />
        {/* Only show MiniPlayer when not in onboarding */}
        {hasCompletedOnboarding && <MiniPlayer />}
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      </View>
    </SafeAreaProvider>
  );
}
