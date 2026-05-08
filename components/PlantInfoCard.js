import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function PlantInfoCard({ plant, name }) {
  if (!plant) return null;

  const waterPercent = Math.round((plant.besoinEau ?? 0) * 100);

  return (
    <View style={styles.card}>
      {/* Header */}
      <Text style={styles.plantName}>{name}</Text>

      {/* Description */}
      {plant.description ? (
        <Text style={styles.description}>{plant.description}</Text>
      ) : null}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Exposition */}
      <View style={styles.infoRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>☀️</Text>
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Exposition</Text>
          <Text style={styles.infoValue}>{plant.exposition}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.dividerLight} />

      {/* Floraison */}
      <View style={styles.infoRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📅</Text>
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Floraison</Text>
          <Text style={styles.infoValue}>{plant.periodeFloraison}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.dividerLight} />

      {/* Water needs */}
      <View style={styles.infoRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💧</Text>
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Besoin en eau</Text>
          <View style={styles.waterRow}>
            <View style={styles.waterBarBg}>
              <View
                style={[
                  styles.waterBarFill,
                  { width: `${waterPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.waterPercent}>{waterPercent}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },

  /* ---- Header ---- */
  plantName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fontFamily.display,
  },

  /* ---- Description ---- */
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fontFamily.body,
  },

  /* ---- Dividers ---- */
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  dividerLight: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    marginLeft: 44, // aligned with text, past the icon
    marginVertical: theme.spacing.sm,
  },

  /* ---- Info rows ---- */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.xs,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  icon: {
    fontSize: 18,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    fontFamily: theme.fontFamily.body,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '500',
    fontFamily: theme.fontFamily.body,
  },

  /* ---- Water level bar ---- */
  waterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  waterBarBg: {
    flex: 1,
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.waterBlueBg,
    overflow: 'hidden',
  },
  waterBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.waterBlue,
  },
  waterPercent: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.waterBlue,
    marginLeft: theme.spacing.sm,
    minWidth: 36,
    textAlign: 'right',
    fontFamily: theme.fontFamily.body,
  },
});
