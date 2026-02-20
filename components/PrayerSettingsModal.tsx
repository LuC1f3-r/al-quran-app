import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

type PrayerSettingsModalProps = {
  visible: boolean;
  prayerName: string;
  onClose: () => void;
};

export function PrayerSettingsModal({ visible, prayerName, onClose }: PrayerSettingsModalProps) {
  const settings = useAppStore((state) => state.settings);
  const updatePrayerSetting = useAppStore((state) => state.updatePrayerSetting);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{prayerName} Settings</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Prayer Alerts</Text>
            <Switch
              value={settings.prayerAlertsEnabled}
              onValueChange={(value) => updatePrayerSetting('prayerAlertsEnabled', value)}
              trackColor={{ true: COLORS.primaryGreenSoft, false: '#D1D5DB' }}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={(value) => updatePrayerSetting('vibrationEnabled', value)}
              trackColor={{ true: COLORS.primaryGreenSoft, false: '#D1D5DB' }}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Adhan Preview</Text>
            <Switch
              value={settings.adhanPreviewEnabled}
              onValueChange={(value) => updatePrayerSetting('adhanPreviewEnabled', value)}
              trackColor={{ true: COLORS.primaryGreenSoft, false: '#D1D5DB' }}
            />
          </View>

          <Pressable onPress={onClose} style={styles.doneButton}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000055',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  doneButton: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primaryGreenSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
  },
  doneText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
