import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { TopHeader } from '../components/TopHeader';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function GoToPageScreen() {
  const router = useRouter();
  const [pageInput, setPageInput] = useState('1');

  const onGo = () => {
    const parsed = Number(pageInput);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 604) {
      Alert.alert('Invalid page', 'Please enter a page number between 1 and 604.');
      return;
    }

    router.push({
      pathname: '/reader',
      params: {
        page: String(parsed),
        surahName: `Page ${parsed}`,
      },
    });
  };

  return (
    <View style={styles.container}>
      <TopHeader title="Go To Page" onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.contentWrap}
      >
        <View style={styles.card}>
          <Text style={styles.label}>Page Number (1 - 604)</Text>
          <TextInput
            value={pageInput}
            onChangeText={(value) => setPageInput(value.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            placeholder="Enter page"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            maxLength={3}
          />

          <Pressable style={styles.goButton} onPress={onGo}>
            <Text style={styles.goButtonText}>Go</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentWrap: {
    flex: 1,
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 18,
    color: '#111827',
  },
  goButton: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primaryGreenSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 10,
  },
  goButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
