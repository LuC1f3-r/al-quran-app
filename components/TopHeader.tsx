import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING } from '../constants/theme';

type TopHeaderProps = {
  title: string;
  onBackPress?: () => void;
  rightNode?: ReactNode;
};

export function TopHeader({ title, onBackPress, rightNode }: TopHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {onBackPress ? (
          <Pressable style={styles.iconButton} onPress={onBackPress}>
            <Ionicons name="chevron-back" size={28} color={COLORS.white} />
          </Pressable>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        <Text style={styles.title}>{title}</Text>

        <View style={styles.rightContainer}>{rightNode ?? <View style={styles.iconPlaceholder} />}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.primaryGreenSoft,
    paddingTop: 48,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 36,
    height: 36,
  },
  title: {
    flex: 1,
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  rightContainer: {
    minWidth: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
