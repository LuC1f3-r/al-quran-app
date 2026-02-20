import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { TopHeader } from '../components/TopHeader';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

export default function BookmarksScreen() {
  const router = useRouter();
  const bookmarks = useAppStore((state) => state.bookmarks);
  const removeBookmark = useAppStore((state) => state.removeBookmark);

  return (
    <View style={styles.container}>
      <TopHeader title="Bookmarks" onBackPress={() => router.back()} />

      {bookmarks.length === 0 ? (
        <View style={styles.emptyWrap}>
          <MaterialCommunityIcons name="bookmark-off-outline" size={44} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No bookmarks yet</Text>
          <Text style={styles.emptySub}>Add bookmarks from Reader to access them quickly.</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.bookmarkCard}
              onPress={() =>
                router.push({
                  pathname: '/reader',
                  params: {
                    page: String(item.page),
                    surahName: item.surahName,
                    surahNumber: item.surahNumber ? String(item.surahNumber) : undefined,
                  },
                })
              }
            >
              <View style={styles.bookmarkLeft}>
                <Text style={styles.bookmarkTitle}>{item.surahName}</Text>
                <Text style={styles.bookmarkMeta}>Page {item.page}</Text>
              </View>

              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  removeBookmark(item.id);
                }}
                style={styles.deleteIcon}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={22} color={COLORS.danger} />
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 130,
    gap: SPACING.sm,
  },
  bookmarkCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookmarkLeft: {
    flex: 1,
    gap: 4,
  },
  bookmarkTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  bookmarkMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
  deleteIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    margin: SPACING.md,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: SPACING.sm,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  emptySub: {
    marginTop: 6,
    color: '#6B7280',
    textAlign: 'center',
  },
});
