import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { TopHeader } from '../components/TopHeader';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { JUZZ_LIST, type Juzz } from '../data/juzz';

type JuzzStartPoint = 'start' | 'quarter' | 'half' | 'third-quarter';

const START_OPTIONS: Array<{ key: JuzzStartPoint; label: string; arabic: string; icon: string }> = [
  { key: 'start', label: 'Start', arabic: 'البدء', icon: 'radiobox-marked' },
  { key: 'quarter', label: 'Quarter', arabic: 'الربع', icon: 'clock-outline' },
  { key: 'half', label: 'Half', arabic: 'النصف', icon: 'circle-half-full' },
  { key: 'third-quarter', label: 'Third Quarter', arabic: 'الثلاثة', icon: 'pie-chart' },
];

export default function JuzzIndexScreen() {
  const router = useRouter();
  const [selectedJuzz, setSelectedJuzz] = useState<Juzz | null>(null);
  const [startPoint, setStartPoint] = useState<JuzzStartPoint>('start');

  const selectedStartPage = useMemo(() => {
    if (!selectedJuzz) {
      return 1;
    }

    const nextJuzz = JUZZ_LIST.find((item) => item.id === selectedJuzz.id + 1);
    const nextStart = nextJuzz?.startPage ?? 604;
    const spread = Math.max(1, nextStart - selectedJuzz.startPage);
    const fractionMap: Record<JuzzStartPoint, number> = {
      start: 0,
      quarter: 0.25,
      half: 0.5,
      'third-quarter': 0.75,
    };

    return Math.min(604, Math.round(selectedJuzz.startPage + spread * fractionMap[startPoint]));
  }, [selectedJuzz, startPoint]);

  return (
    <View style={styles.container}>
      <TopHeader
        title="Juzz Index"
        onBackPress={() => router.back()}
        rightNode={<MaterialCommunityIcons name="crown" size={24} color={COLORS.goldSoft} />}
      />

      <FlatList
        data={JUZZ_LIST}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.juzzRow}
            onPress={() => {
              setSelectedJuzz(item);
              setStartPoint('start');
            }}
          >
            <View>
              <Text style={styles.juzzName}>
                {item.id}. {item.name}
              </Text>
              <Text style={styles.juzzPage}>Page # {item.startPage}</Text>
            </View>
            <Text style={styles.juzzArabic}>{item.arabic}</Text>
          </Pressable>
        )}
      />

      <Modal transparent visible={Boolean(selectedJuzz)} onRequestClose={() => setSelectedJuzz(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Read Juzz from:</Text>

            <View style={styles.optionWrap}>
              {START_OPTIONS.map((option) => {
                const selected = option.key === startPoint;
                return (
                  <Pressable
                    key={option.key}
                    style={[styles.optionButton, selected && styles.optionButtonSelected]}
                    onPress={() => setStartPoint(option.key)}
                  >
                    <View style={styles.optionLeft}>
                      <MaterialCommunityIcons
                        name={option.icon as never}
                        size={24}
                        color={selected ? COLORS.white : '#5CAF31'}
                      />
                      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{option.label.toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.optionArabic, selected && styles.optionLabelSelected]}>{option.arabic}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <Pressable onPress={() => setSelectedJuzz(null)}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (!selectedJuzz) {
                    return;
                  }
                  router.push({
                    pathname: '/quran-page',
                    params: {
                      pageNumber: String(selectedStartPage),
                      surahName: `Juzz ${selectedJuzz.id} - ${selectedJuzz.name}`,
                    },
                  });
                  setSelectedJuzz(null);
                }}
              >
                <Text style={styles.readText}>READ</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingBottom: 130,
  },
  juzzRow: {
    borderBottomWidth: 1,
    borderColor: '#E6E9ED',
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  juzzName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
  },
  juzzPage: {
    marginTop: 6,
    fontSize: 15,
    color: '#4B5563',
  },
  juzzArabic: {
    fontSize: 30,
    color: '#111827',
    marginLeft: SPACING.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000060',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: SPACING.md,
  },
  optionWrap: {
    gap: SPACING.sm,
  },
  optionButton: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: '#EEF4EC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionButtonSelected: {
    backgroundColor: '#57B720',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5CAF31',
  },
  optionLabelSelected: {
    color: COLORS.white,
  },
  optionArabic: {
    fontSize: 18,
    color: '#7FB35C',
  },
  modalActions: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.lg,
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4B5563',
  },
  readText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#58B723',
  },
});
