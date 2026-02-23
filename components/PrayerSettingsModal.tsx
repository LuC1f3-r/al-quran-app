import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { ADHAN_OPTIONS } from '../utils/adhanAssets';
import { previewAdhan, stopAdhan, subscribeAdhan } from '../services/adhanPlayer';

type PrayerSettingsModalProps = {
  visible: boolean;
  prayerName: string;
  prayerId: string;
  onClose: () => void;
};

export function PrayerSettingsModal({ visible, prayerName, prayerId, onClose }: PrayerSettingsModalProps) {
  const settings = useAppStore((state) => state.settings);
  const updatePrayerSetting = useAppStore((state) => state.updatePrayerSetting);
  const setSelectedAdhan = useAppStore((state) => state.setSelectedAdhan);
  const toggleAdhanForPrayer = useAppStore((state) => state.toggleAdhanForPrayer);

  const isAdhanEnabled = settings.adhanEnabledPrayers[prayerId] !== false;

  /* Track which adhan is currently previewing */
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAdhan((s) => {
      setPreviewingId(s.isPlaying && s.activePrayerId === '__preview__' ? s.adhanId : null);
    });
    return unsub;
  }, []);

  /* Stop preview when modal closes */
  const handleClose = () => {
    stopAdhan();
    onClose();
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>{prayerName} Settings</Text>
            <Pressable onPress={handleClose}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* ── Prayer Alerts ── */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Prayer Alerts</Text>
              <Switch
                value={settings.prayerAlertsEnabled}
                onValueChange={(value) => updatePrayerSetting('prayerAlertsEnabled', value)}
                trackColor={{ true: COLORS.primaryGreenSoft, false: '#D1D5DB' }}
              />
            </View>

            {/* ── Vibration ── */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={(value) => updatePrayerSetting('vibrationEnabled', value)}
                trackColor={{ true: COLORS.primaryGreenSoft, false: '#D1D5DB' }}
              />
            </View>

            {/* ── Adhan Sound for this prayer ── */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Adhan Sound</Text>
              <Switch
                value={isAdhanEnabled}
                onValueChange={() => toggleAdhanForPrayer(prayerId)}
                trackColor={{ true: COLORS.primaryGreenSoft, false: '#D1D5DB' }}
              />
            </View>

            {/* ── Muezzin Selection ── */}
            {isAdhanEnabled && (
              <View style={styles.muezzinSection}>
                <Text style={styles.sectionTitle}>Select Muezzin</Text>
                {ADHAN_OPTIONS.map((option) => {
                  const isSelected = settings.selectedAdhan === option.id;
                  const isPreviewing = previewingId === option.id;

                  return (
                    <Pressable
                      key={option.id}
                      style={[styles.muezzinRow, isSelected && styles.muezzinRowSelected]}
                      onPress={() => setSelectedAdhan(option.id)}
                    >
                      <View style={styles.muezzinInfo}>
                        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                        <View>
                          <Text style={[styles.muezzinLabel, isSelected && styles.muezzinLabelSelected]}>
                            {option.label}
                          </Text>
                          <Text style={styles.muezzinDesc}>{option.description}</Text>
                        </View>
                      </View>
                      <Pressable
                        style={styles.previewBtn}
                        onPress={() => {
                          if (isPreviewing) {
                            stopAdhan();
                          } else {
                            previewAdhan(option.id);
                          }
                        }}
                      >
                        <MaterialCommunityIcons
                          name={isPreviewing ? 'stop-circle-outline' : 'play-circle-outline'}
                          size={26}
                          color={isPreviewing ? '#E74C3C' : COLORS.primaryGreenSoft}
                        />
                      </Pressable>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>

          <Pressable onPress={handleClose} style={styles.doneButton}>
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
    maxHeight: '80%',
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
  scrollArea: {
    maxHeight: 400,
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
  /* ── Muezzin section ── */
  muezzinSection: {
    marginTop: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  muezzinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  muezzinRowSelected: {
    borderColor: COLORS.primaryGreenSoft,
    backgroundColor: '#ECFDF5',
  },
  muezzinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primaryGreenSoft,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryGreenSoft,
  },
  muezzinLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  muezzinLabelSelected: {
    color: '#065F46',
  },
  muezzinDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
  previewBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
