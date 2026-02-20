import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

import { MiniPlayer } from '../components/MiniPlayer';
import { SplashScreen } from '../components/SplashScreen';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded] = useFonts({
    'UthmanicHafs': require('../assets/fonts/UthmanicHafs1Ver09.ttf'),
    'UthmaniScript': require('../assets/fonts/uthmani-script.ttf'),
    'IndoPakScript': require('../assets/fonts/indo-pak-script.ttf'),
  });

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

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
        <MiniPlayer />
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      </View>
    </SafeAreaProvider>
  );
}
