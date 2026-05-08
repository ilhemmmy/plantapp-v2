import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { theme } from '../theme';

/**
 * Interactive month calendar that marks irrigation run dates.
 * Tapping a marked date shows details below the calendar.
 *
 * Props:
 * - nextRuns: array of ISO date strings
 * - minutesPerEvent: (optional) minutes per irrigation event
 */
export default function CalendarPreview({ nextRuns = [], minutesPerEvent }) {
  const [selectedDate, setSelectedDate] = useState(null);

  // Build markedDates object from nextRuns
  const markedDates = {};
  nextRuns.forEach((iso) => {
    try {
      const d = new Date(iso);
      const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
      markedDates[key] = {
        marked: true,
        dotColor: theme.colors.primaryLight,
        selectedColor: theme.colors.primary,
      };
    } catch (e) {
      // ignore invalid dates
    }
  });

  // If a date is selected, mark it as selected too
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: theme.colors.primary,
      selectedTextColor: '#fff',
    };
  }

  const isSelectedAnIrrigationDay =
    selectedDate && nextRuns.some((iso) => new Date(iso).toISOString().split('T')[0] === selectedDate);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendrier d'irrigation</Text>
      <View style={styles.calendarWrapper}>
        <Calendar
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          theme={{
            backgroundColor: theme.colors.surface,
            calendarBackground: theme.colors.surface,
            todayTextColor: theme.colors.primaryLight,
            dayTextColor: theme.colors.text,
            textDisabledColor: theme.colors.textLight,
            monthTextColor: theme.colors.primaryDark,
            arrowColor: theme.colors.primary,
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12,
          }}
        />
      </View>

      {/* Detail panel when a date is tapped */}
      {selectedDate && (
        <View style={styles.detailCard}>
          <Text style={styles.detailDate}>{formatDateFR(selectedDate)}</Text>
          {isSelectedAnIrrigationDay ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>{'\uD83D\uDCA7'}</Text>
              <Text style={styles.detailText}>
                Irrigation prevue{minutesPerEvent ? ` · ${minutesPerEvent} min` : ''}
              </Text>
            </View>
          ) : (
            <Text style={styles.detailTextMuted}>Pas d'irrigation prevue ce jour</Text>
          )}
        </View>
      )}
    </View>
  );
}

function formatDateFR(dateString) {
  const d = new Date(dateString + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fontFamily.display,
  },
  calendarWrapper: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailCard: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  detailDate: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    textTransform: 'capitalize',
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fontFamily.display,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 16,
    marginRight: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.body,
  },
  detailTextMuted: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    fontFamily: theme.fontFamily.body,
  },
});
