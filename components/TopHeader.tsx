import type { ReactNode } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, SPACING } from '../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const scale = (size: number) => Math.round((SCREEN_W / 390) * size); // 390 = iPhone 14 base width

type TopHeaderProps = {
  title: string;
  onBackPress?: () => void;
  rightNode?: ReactNode;
};

export function TopHeader({ title, onBackPress, rightNode }: TopHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + scale(12) }]}>
      <View style={styles.row}>
        {onBackPress ? (
          <Pressable style={styles.iconButton} onPress={onBackPress}>
            <Ionicons name="chevron-back" size={scale(30)} color={COLORS.white} />
          </Pressable>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        <Text style={[styles.title, { fontSize: scale(20) }]}>{title}</Text>

        <View style={styles.rightContainer}>{rightNode ?? <View style={styles.iconPlaceholder} />}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.primaryGreenSoft,
    paddingHorizontal: SPACING.md,
    paddingBottom: scale(24),
    borderBottomLeftRadius: scale(50),
    borderBottomRightRadius: scale(50),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: scale(36),
    height: scale(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: scale(36),
    height: scale(36),
  },
  title: {
    flex: 1,
    color: COLORS.white,
    fontWeight: '900',
    textAlign: 'center',
  },
  rightContainer: {
    minWidth: scale(40),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
});
