import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../components/Logo';

export default function DashboardScreen({
  styles,
  plantesCount,
  potsCount,
  historiqueCount,
  smartMode,
  lastSmartAction,
  demoValue,
  humiditeMin,
  humiditeMax,
  oyasNiveauMin,
  oyasNiveauMax,
  navigation,
}) {
  const activeLabel = smartMode === 'humidite' ? 'Humidite' : 'Oyas';
  const minValue = smartMode === 'humidite' ? (humiditeMin || 'N/A') : (oyasNiveauMin || 'N/A');
  const maxValue = smartMode === 'humidite' ? (humiditeMax || 'N/A') : (oyasNiveauMax || 'N/A');
  const decisionText = lastSmartAction?.action || 'Aucune decision';
  const minNumeric = parseFloat(minValue);
  const maxNumeric = parseFloat(maxValue);
  const isLow = Number.isFinite(minNumeric) && demoValue < minNumeric;
  const isHigh = Number.isFinite(maxNumeric) && demoValue > maxNumeric;
  const progressPercent = Math.max(0, Math.min(100, demoValue));
  const progressStyle = isLow
    ? styles.progressFillDanger
    : isHigh
    ? styles.progressFillWarn
    : styles.progressFillOk;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.heroCard}>
          <View style={styles.header}>
            <Logo size={52} showName={false} />
            <View style={styles.headerText}>
              <Text style={styles.appName}>PlantApp</Text>
              <Text style={styles.appTagline}>Dashboard</Text>
            </View>
          </View>

          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{plantesCount}</Text>
              <Text style={styles.statLabel}>Plantes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{potsCount}</Text>
              <Text style={styles.statLabel}>Pots</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{historiqueCount}</Text>
              <Text style={styles.statLabel}>Calculs</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Vue systeme</Text>

          <View style={styles.dashboardGrid}>
            <View style={styles.dashboardCard}>
              <Text style={styles.dashboardTitle}>Plantes</Text>
              <Text style={styles.dashboardValue}>{plantesCount}</Text>
              <Text style={styles.dashboardSub}>Base locale</Text>
            </View>
            <View style={styles.dashboardCard}>
              <Text style={styles.dashboardTitle}>Pots</Text>
              <Text style={styles.dashboardValue}>{potsCount}</Text>
              <Text style={styles.dashboardSub}>Dimensions</Text>
            </View>
          </View>

          <View style={styles.dashboardGrid}>
            <View style={styles.dashboardCard}>
              <Text style={styles.dashboardTitle}>Calculs</Text>
              <Text style={styles.dashboardValue}>{historiqueCount}</Text>
              <Text style={styles.dashboardSub}>Historique</Text>
            </View>
            <View style={styles.dashboardCard}>
              <Text style={styles.dashboardTitle}>Mode actif</Text>
              <Text style={styles.dashboardValue}>{activeLabel}</Text>
              <Text style={styles.dashboardSub}>Capteur {activeLabel.toLowerCase()}</Text>
            </View>
          </View>

          <View style={styles.dashboardGrid}>
            <View style={styles.dashboardCard}>
              <Text style={styles.dashboardTitle}>Humidite</Text>
              <Text style={styles.dashboardValue}>{demoValue}%</Text>
              <View style={styles.decisionRow}>
                <View style={[styles.decisionBadge, isLow ? styles.decisionBadgeWarn : styles.decisionBadgeOk]}>
                  <Text style={styles.decisionBadgeText}>{isLow ? 'Bas' : 'OK'}</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, progressStyle, { width: `${progressPercent}%` }]} />
              </View>
            </View>
            <View style={styles.dashboardCard}>
              <Text style={styles.dashboardTitle}>Oyas</Text>
              <Text style={styles.dashboardValue}>{demoValue}%</Text>
              <View style={styles.decisionRow}>
                <View style={[styles.decisionBadge, isLow ? styles.decisionBadgeWarn : styles.decisionBadgeOk]}>
                  <Text style={styles.decisionBadgeText}>{isLow ? 'Bas' : 'OK'}</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, progressStyle, { width: `${progressPercent}%` }]} />
              </View>
            </View>
          </View>

          <View style={styles.dashboardGrid}>
            <View style={styles.dashboardCard}>
              <Text style={styles.dashboardTitle}>Seuils</Text>
              <Text style={styles.dashboardValue}>{minValue}% - {maxValue}%</Text>
              <Text style={styles.dashboardSub}>Min / Max</Text>
            </View>
            <View style={styles.dashboardCard}>
              <Text style={styles.dashboardTitle}>Decision</Text>
              <Text style={styles.dashboardValue}>{decisionText}</Text>
              <Text style={styles.dashboardSub}>Derniere mesure</Text>
            </View>
          </View>

          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Intelligent')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Mode intelligent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Classique')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Irrigation classique</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Historique: {historiqueCount}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Dernier test: {lastSmartAction?.date || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
