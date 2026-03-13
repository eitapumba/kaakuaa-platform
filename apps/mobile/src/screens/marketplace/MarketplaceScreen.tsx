import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { marketplaceApi } from '../../api/client';

const CATEGORIES = [
  { key: undefined, label: 'Todos' },
  { key: 'beverage', label: '🥤 Bebidas' },
  { key: 'pharmacy', label: '💊 Farmácia' },
  { key: 'experience', label: '🌴 Experiências' },
  { key: 'subscription', label: '⭐ Planos' },
];

export function MarketplaceScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | undefined>();

  const loadProducts = async (category?: string) => {
    try {
      const { data } = await marketplaceApi.getProducts(category);
      setProducts(data?.products || []);
    } catch {}
  };

  useEffect(() => { loadProducts(selectedCat); }, [selectedCat]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Loja Kaa Kuaa</Text>
      <Text style={styles.subtitle}>Produtos naturais, experiências e planos</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.label}
            style={[styles.catChip, selectedCat === cat.key && styles.catChipActive]}
            onPress={() => setSelectedCat(cat.key)}
          >
            <Text style={[styles.catText, selectedCat === cat.key && styles.catTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item, i) => item.id || String(i)}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCard}>
            <View style={styles.productImg}>
              <Text style={styles.productEmoji}>🌿</Text>
            </View>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productPrice}>R$ {Number(item.priceReal).toFixed(2)}</Text>
            {item.priceVita && (
              <Text style={styles.productVita}>{item.priceVita} VITA</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Em breve: Guaraná Ancestral, Energéticos Naturais, Farmácia Natural e mais
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 60 },
  header: { fontSize: 22, fontWeight: '800', color: colors.stone, paddingHorizontal: 20 },
  subtitle: { fontSize: 13, color: colors.textSecondary, paddingHorizontal: 20, marginTop: 4, marginBottom: 15 },
  catRow: { paddingLeft: 20, marginBottom: 15, maxHeight: 44 },
  catChip: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    borderWidth: 1, borderColor: colors.borderLight, marginRight: 8,
  },
  catChipActive: { backgroundColor: colors.green, borderColor: colors.green },
  catText: { fontSize: 13, color: colors.textSecondary },
  catTextActive: { color: 'white', fontWeight: '600' },
  grid: { paddingHorizontal: 16 },
  gridRow: { gap: 12, marginBottom: 12 },
  productCard: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: 14, overflow: 'hidden',
  },
  productImg: {
    height: 100, backgroundColor: colors.bgElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  productEmoji: { fontSize: 32 },
  productName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, padding: 10, paddingBottom: 4 },
  productPrice: { fontSize: 15, fontWeight: '800', color: colors.green, paddingHorizontal: 10 },
  productVita: { fontSize: 11, color: colors.textMuted, paddingHorizontal: 10, paddingBottom: 10 },
  emptyText: { color: colors.textMuted, textAlign: 'center', padding: 40, fontSize: 14, lineHeight: 20 },
});
