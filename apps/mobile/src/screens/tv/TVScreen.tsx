import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import { colors } from '../../theme/colors';
import { contentApi } from '../../api/client';

export function TVScreen() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [featuredRes, feedRes] = await Promise.all([
          contentApi.getFeatured(),
          contentApi.getFeed(),
        ]);
        setFeatured(featuredRes.data);
        setFeed(feedRes.data?.content || []);
      } catch {}
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📺 TV Kaa Kuaa</Text>
      <Text style={styles.subtitle}>Desafios ao vivo e melhores momentos</Text>

      {/* Featured */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredRow}>
        {featured.length === 0 && (
          <View style={styles.featuredCard}>
            <Text style={styles.featuredEmoji}>📺</Text>
            <Text style={styles.featuredTitle}>Em breve</Text>
            <Text style={styles.featuredSub}>Desafios ao vivo aparecerão aqui</Text>
          </View>
        )}
        {featured.map((item, i) => (
          <TouchableOpacity key={i} style={styles.featuredCard}>
            <View style={styles.liveBadge}><Text style={styles.liveText}>🔴 AO VIVO</Text></View>
            <Text style={styles.featuredTitle}>{item.title}</Text>
            <Text style={styles.featuredSub}>{item.viewCount} assistindo</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Últimos Desafios</Text>
      <FlatList
        data={feed}
        keyExtractor={(item, i) => item.id || String(i)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.feedItem}>
            <Text style={styles.feedTitle}>{item.title}</Text>
            <Text style={styles.feedMeta}>{item.viewCount} views • {item.likeCount} likes</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum conteúdo ainda. Seja o primeiro a desafiar!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 60 },
  header: { fontSize: 22, fontWeight: '800', color: colors.stone, paddingHorizontal: 20 },
  subtitle: { fontSize: 13, color: colors.textSecondary, paddingHorizontal: 20, marginTop: 4, marginBottom: 20 },
  featuredRow: { paddingLeft: 20, marginBottom: 25 },
  featuredCard: {
    width: 260, height: 160, backgroundColor: colors.bgCard, borderRadius: 16,
    marginRight: 12, padding: 20, justifyContent: 'flex-end',
  },
  featuredEmoji: { fontSize: 32, marginBottom: 10 },
  liveBadge: { position: 'absolute', top: 12, left: 12 },
  liveText: { fontSize: 11, fontWeight: '700', color: colors.live },
  featuredTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  featuredSub: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, paddingHorizontal: 20, marginBottom: 12 },
  feedItem: {
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  feedTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  feedMeta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  emptyText: { color: colors.textMuted, textAlign: 'center', padding: 40, fontSize: 14 },
});
