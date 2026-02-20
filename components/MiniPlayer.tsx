import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

export function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const miniPlayer = useAppStore((state) => state.miniPlayer);
  const togglePlayPause = useAppStore((state) => state.togglePlayPause);
  const stopTrack = useAppStore((state) => state.stopTrack);

  if (!miniPlayer.isPlaying) {
    return null;
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.progressLine} />
      <View style={styles.row}>
        <Pressable onPress={stopTrack} style={styles.iconButton}>
          <MaterialCommunityIcons name="close" size={24} color={COLORS.textPrimary} />
        </Pressable>

        <Pressable
          style={styles.textContainer}
          onPress={() =>
            router.push({
              pathname: '/reader',
              params: {
                page: String(miniPlayer.page),
                surahName: miniPlayer.title,
              },
            })
          }
        >
          <Text numberOfLines={1} style={styles.title}>
            {miniPlayer.title}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {miniPlayer.subtitle}
          </Text>
        </Pressable>

        <View style={styles.controls}>
          <Pressable style={styles.iconButton}>
            <MaterialCommunityIcons name="skip-previous" size={22} color={COLORS.textPrimary} />
          </Pressable>
          <Pressable style={styles.playButton} onPress={togglePlayPause}>
            <MaterialCommunityIcons name="pause" size={22} color={COLORS.white} />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <MaterialCommunityIcons name="skip-next" size={22} color={COLORS.textPrimary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderColor: '#D5EBD6',
    paddingHorizontal: SPACING.sm,
    paddingTop: 8,
  },
  progressLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#BDE3BF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primaryGreenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
