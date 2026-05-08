import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';
import CalendarPreview from './CalendarPreview';

export default function IrrigationResult({ resultat, onSendToESP32 }) {
  if (!resultat) return null;

  return (
    <View style={styles.card}>
      {/* Top accent stripe */}
      <View style={styles.accentStripe} />

      <View style={styles.content}>
        {/* Header label */}
        <View style={styles.headerRow}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Resultat</Text>
          </View>
        </View>

        {/* Large irrigation time display */}
        <View style={styles.timeContainer}>
          <View style={styles.timeInner}>
            <Text style={styles.timeNumber}>{resultat.temps}</Text>
            <Text style={styles.timeUnit}>min</Text>
          </View>
          <Text style={styles.timeLabel}>Temps d'irrigation</Text>
          {resultat.litres != null && (
            <Text style={styles.litresText}>{`≈ ${resultat.litres} L`}</Text>
          )}
          {resultat.litresPerEvent != null && (
            <Text style={styles.litresText}>{`≈ ${resultat.litresPerEvent} L / événement`}</Text>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Flowering period */}
        <View style={styles.floweringRow}>
          <Text style={styles.floweringIcon}>{'\uD83C\uDF38'}</Text>
          <View style={styles.floweringTextGroup}>
            <Text style={styles.floweringLabel}>Periode de floraison</Text>
            <Text style={styles.floweringValue}>{resultat.heure}</Text>
            {resultat.events != null && (
                  <Text style={styles.eventsInfo}>{`${resultat.events} fois / mois · total ${resultat.totalMinutes} min`}</Text>
            )}
          </View>
        </View>

            {/* Next runs preview */}
            {resultat.nextRuns && resultat.nextRuns.length > 0 && (
              <CalendarPreview nextRuns={resultat.nextRuns} minutesPerEvent={resultat.temps} />
            )}

        {/* Send button */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={onSendToESP32}
          activeOpacity={0.8}
        >
          <Text style={styles.sendButtonText}>
            {'\uD83D\uDCE1'}  Envoyer vers ESP32
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    marginTop: theme.spacing.xl,
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  accentStripe: {
    height: 4,
    backgroundColor: theme.colors.primaryLight,
  },
  content: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  headerRow: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  headerBadge: {
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  headerBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: theme.fontFamily.body,
  },
  timeContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  timeInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: theme.spacing.xs,
  },
  timeNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    lineHeight: 62,
    fontFamily: theme.fontFamily.display,
  },
  timeUnit: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '600',
    color: theme.colors.primaryLight,
    marginBottom: 6,
    marginLeft: theme.spacing.xs,
    fontFamily: theme.fontFamily.display,
  },
  timeLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    letterSpacing: 0.3,
    fontFamily: theme.fontFamily.body,
  },
  divider: {
    width: 48,
    height: 2,
    backgroundColor: theme.colors.border,
    borderRadius: 1,
    marginVertical: theme.spacing.xl,
  },
  floweringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    marginBottom: theme.spacing.xxl,
  },
  floweringIcon: {
    fontSize: 22,
    marginRight: theme.spacing.md,
  },
  floweringTextGroup: {
    flex: 1,
  },
  floweringLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    fontWeight: '500',
    marginBottom: 2,
    fontFamily: theme.fontFamily.body,
  },
  floweringValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fontFamily.body,
  },
  eventsInfo: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    fontFamily: theme.fontFamily.body,
  },
  litresText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontFamily: theme.fontFamily.body,
  },
  nextRunsContainer: {
    marginTop: theme.spacing.md,
    width: '100%',
    alignItems: 'flex-start',
  },
  nextRunsTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  nextRunItem: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingVertical: theme.spacing.xs,
  },
  sendButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    width: '100%',
    ...theme.shadows.md,
  },
  sendButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: theme.fontFamily.display,
  },
});
