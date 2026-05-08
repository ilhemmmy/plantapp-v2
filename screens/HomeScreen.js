import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../components/Logo';

export default function HomeScreen({
  styles,
  plantesCount,
  potsCount,
  historiqueCount,
}) {
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
              <Text style={styles.appTagline}>Irrigation intelligente</Text>
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
          <Text style={styles.sectionTitle}>Bienvenue</Text>
          <Text style={styles.statusText}>
            Utilisez l'onglet Dashboard pour le suivi systeme, et les onglets Classique et Intelligent pour les parametres.
          </Text>
          <Text style={styles.statusMuted}>
            Historique disponible dans l'onglet Historique.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
