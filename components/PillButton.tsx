import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS, RADIUS, SPACING } from '../constants/theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type PillButtonProps = {
  label: string;
  icon: IconName;
  onPress: () => void;
  filled?: boolean;
  compact?: boolean;
};

export function PillButton({ label, icon, onPress, filled = false, compact = false }: PillButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: '#00000010' }}
      style={[styles.button, filled ? styles.filled : styles.outline, compact && styles.compact]}
    >
      <View style={styles.content}>
        <MaterialCommunityIcons
          name={icon}
          size={compact ? 18 : 20}
          color={filled ? COLORS.white : COLORS.primaryGreenSoft}
        />
        <Text style={[styles.label, filled ? styles.filledLabel : styles.outlineLabel]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    minWidth: 120,
  },
  filled: {
    backgroundColor: COLORS.primaryGreenSoft,
    borderColor: COLORS.primaryGreenSoft,
  },
  outline: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  compact: {
    minWidth: 96,
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  filledLabel: {
    color: COLORS.white,
  },
  outlineLabel: {
    color: COLORS.textPrimary,
  },
});
