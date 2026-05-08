import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SmartModeScreen({
  styles,
  smartMode,
  setSmartMode,
  plantItems,
  selectedSmartPlant,
  onSelectSmartPlant,
  plantModes,
  plantSmartSettings,
  historique,
  humiditeMin,
  setHumiditeMin,
  humiditeMax,
  setHumiditeMax,
  oyasNiveauMin,
  setOyasNiveauMin,
  oyasNiveauMax,
  setOyasNiveauMax,
  handleTesterCapteur,
  handleMettreAJourMode,
  lastSmartAction,
  demoValue,
}) {
  const selectedLabel =
    plantItems.find((item) => item.value === selectedSmartPlant)?.label || 'Plante';
  const calculatedPlants = [];
  const seen = new Set();
  (historique || []).forEach((item) => {
    if (item.plantKey && !seen.has(item.plantKey)) {
      calculatedPlants.push(item);
      seen.add(item.plantKey);
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Mode intelligent</Text>

          <View style={styles.blockCard}>
            <Text style={styles.blockTitle}>0. Plantes calculees</Text>
            {calculatedPlants.length === 0 ? (
              <Text style={styles.statusMuted}>Aucune plante calculee pour le moment.</Text>
            ) : (
              <View style={styles.smartPlantList}>
                {calculatedPlants.map((item) => {
                  const isSelected = item.plantKey === selectedSmartPlant;
                  const settings = plantSmartSettings[item.plantKey] || {};
                  const modeLabel = settings.mode || item.smartMode || plantModes[item.plantKey] || 'humidite';
                  const modeText = modeLabel === 'oyas' ? 'Oyas' : 'Humidite';
                  const seuils = modeLabel === 'oyas'
                    ? `${settings.oyasNiveauMin || item.smartOyasMin || 'N/A'} - ${settings.oyasNiveauMax || item.smartOyasMax || 'N/A'}`
                    : `${settings.humiditeMin || item.smartHumiditeMin || 'N/A'} - ${settings.humiditeMax || item.smartHumiditeMax || 'N/A'}`;
                  return (
                    <TouchableOpacity
                      key={item.plantKey}
                      style={[styles.smartPlantCard, isSelected && styles.smartPlantCardActive]}
                      onPress={() => onSelectSmartPlant(item.plantKey)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.smartPlantName}>{item.fleur}</Text>
                      <Text style={styles.smartPlantMeta}>Mode: {modeText}</Text>
                      <Text style={styles.smartPlantMeta}>Seuils: {seuils}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            <View style={styles.selectedPlantRow}>
              <Text style={styles.statusMuted}>Plante selectionnee: {selectedLabel}</Text>
              <TouchableOpacity
                style={styles.inlineActionButton}
                onPress={handleMettreAJourMode}
                activeOpacity={0.8}
              >
                <Text style={styles.inlineActionText}>Appliquer seuils</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.blockCard}>
            <Text style={styles.blockTitle}>1. Choisir le mode</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeButton, smartMode === 'humidite' && styles.modeButtonActive]}
                onPress={() => setSmartMode('humidite')}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeText, smartMode === 'humidite' && styles.modeTextActive]}>Humidite</Text>
                <Text style={styles.modeSubtext}>Capteur d'humidite</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeButton, smartMode === 'oyas' && styles.modeButtonActive]}
                onPress={() => setSmartMode('oyas')}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeText, smartMode === 'oyas' && styles.modeTextActive]}>Oyas</Text>
                <Text style={styles.modeSubtext}>Capteur niveau d'eau</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.blockCard}>
            <Text style={styles.blockTitle}>2. Parametres</Text>
            {smartMode === 'humidite' ? (
              <View>
                <View style={styles.sensorRow}>
                  <Text style={styles.fieldLabel}>Humidite actuelle (capteur)</Text>
                  <Text style={styles.sensorValue}>{demoValue}%</Text>
                </View>

                <View style={styles.inlineFields}>
                  <View style={styles.inlineField}>
                    <Text style={styles.fieldLabel}>Seuil min (%)</Text>
                    <TextInput
                      value={humiditeMin}
                      onChangeText={setHumiditeMin}
                      placeholder="Ex: 30"
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.inlineField}>
                    <Text style={styles.fieldLabel}>Seuil max (%)</Text>
                    <TextInput
                      value={humiditeMax}
                      onChangeText={setHumiditeMax}
                      placeholder="Ex: 60"
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View>
                <View style={styles.sensorRow}>
                  <Text style={styles.fieldLabel}>Niveau actuel (capteur)</Text>
                  <Text style={styles.sensorValue}>{demoValue}%</Text>
                </View>

                <View style={styles.inlineFields}>
                  <View style={styles.inlineField}>
                    <Text style={styles.fieldLabel}>Seuil min (%)</Text>
                    <TextInput
                      value={oyasNiveauMin}
                      onChangeText={setOyasNiveauMin}
                      placeholder="Ex: 20"
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.inlineField}>
                    <Text style={styles.fieldLabel}>Seuil max (%)</Text>
                    <TextInput
                      value={oyasNiveauMax}
                      onChangeText={setOyasNiveauMax}
                      placeholder="Ex: 80"
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={styles.blockCard}>
            <Text style={styles.blockTitle}>3. Actions</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleTesterCapteur}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>Tester capteur</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleMettreAJourMode}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>Mettre a jour</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.blockCard}>
            <Text style={styles.blockTitle}>4. Derniere mesure</Text>
            {lastSmartAction ? (
              <View>
                <Text style={styles.statusText}>Mode: {lastSmartAction.mode}</Text>
                <Text style={styles.statusText}>Valeur: {lastSmartAction.value}%</Text>
                <Text style={styles.statusText}>Seuils: {lastSmartAction.min}% - {lastSmartAction.max}%</Text>
                <View style={styles.decisionRow}>
                  <Text style={styles.statusText}>Decision:</Text>
                  <View
                    style={[
                      styles.decisionBadge,
                      lastSmartAction.action &&
                      (String(lastSmartAction.action).toLowerCase().includes('ne pas') ||
                        String(lastSmartAction.action).toLowerCase().includes('ok'))
                        ? styles.decisionBadgeOk
                        : styles.decisionBadgeWarn,
                    ]}
                  >
                    <Text style={styles.decisionBadgeText}>{lastSmartAction.action}</Text>
                  </View>
                </View>
                <Text style={styles.statusMuted}>Mis a jour: {lastSmartAction.date}</Text>
              </View>
            ) : (
              <Text style={styles.statusMuted}>Aucune mesure pour le moment.</Text>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
