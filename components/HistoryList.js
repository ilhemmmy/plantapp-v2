import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function HistoryList({ historique, onClear, onDeleteItem }) {
  if (!historique || historique.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Historique</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{historique.length}</Text>
        </View>
      </View>

      {/* Timeline of history items */}
      <View style={styles.timeline}>
        {historique.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.itemCard,
              index === historique.length - 1 && styles.itemCardLast,
            ]}
          >
            {/* Left accent stripe */}
            <View style={styles.accentBar} />

            <View style={styles.itemContent}>
              {/* Top row: plant name + date */}
              <View style={styles.itemTopRow}>
                <View style={styles.itemNames}>
                  <Text style={styles.plantName}>{item.fleur}</Text>
                  <Text style={styles.potName}>{item.pot}</Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              {/* Bottom row: time pill + flowering */}
              <View style={styles.itemBottomRow}>
                <View style={styles.timePill}>
                  <Text style={styles.timePillIcon}>{'\uD83D\uDCA7'}</Text>
                  <Text style={styles.timePillText}>{item.temps} min</Text>
                </View>
                <View style={styles.floweringChip}>
                  <Text style={styles.floweringChipIcon}>{'\uD83C\uDF38'}</Text>
                  <Text style={styles.floweringChipText}>{item.heure}</Text>
                </View>
                {onDeleteItem && (
                  <TouchableOpacity
                    style={styles.deleteChip}
                    onPress={() => onDeleteItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteChipText}>Supprimer</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Clear button - outline style */}
      <TouchableOpacity
        style={styles.clearButton}
        onPress={onClear}
        activeOpacity={0.7}
      >
        <Text style={styles.clearButtonText}>Effacer l'historique</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xxl,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fontFamily.display,
  },
  countBadge: {
    backgroundColor: theme.colors.primaryLight,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  countBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.surface,
    fontFamily: theme.fontFamily.body,
  },
  timeline: {
    gap: theme.spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  itemCardLast: {
    marginBottom: 0,
  },
  accentBar: {
    width: 4,
    backgroundColor: theme.colors.primaryLight,
  },
  itemContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  itemNames: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  plantName: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
    fontFamily: theme.fontFamily.display,
  },
  potName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '400',
    fontFamily: theme.fontFamily.body,
  },
  dateText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    fontWeight: '500',
    fontFamily: theme.fontFamily.body,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.waterBlueBg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  timePillIcon: {
    fontSize: 12,
    marginRight: theme.spacing.xs,
  },
  timePillText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.waterBlue,
    fontFamily: theme.fontFamily.body,
  },
  floweringChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  floweringChipIcon: {
    fontSize: 12,
    marginRight: theme.spacing.xs,
  },
  floweringChipText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.body,
  },
  deleteChip: {
    marginLeft: 'auto',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deleteChipText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.body,
    fontWeight: '600',
  },
  clearButton: {
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.danger,
    backgroundColor: 'transparent',
  },
  clearButtonText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    fontFamily: theme.fontFamily.body,
  },
});
