import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { MiniPlayer } from '../components/MiniPlayer';
import { SplashScreen } from '../components/SplashScreen';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

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
