import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalPicker from '../components/ModalPicker';
import PlantInfoCard from '../components/PlantInfoCard';
import IrrigationResult from '../components/IrrigationResult';

export default function ClassicIrrigationScreen({
  styles,
  potItems,
  plantItems,
  selectedPot,
  setSelectedPot,
  fleur,
  setFleur,
  selectedPlantMode,
  setSelectedPlantMode,
  mode,
  setMode,
  quotaMinutes,
  setQuotaMinutes,
  quotaEvents,
  setQuotaEvents,
  flowRate,
  setFlowRate,
  handleSaveFlowRate,
  ouvrirScanner,
  handleCalculer,
  resultat,
  handleEnvoyerESP32,
  plantesInfo,
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Configuration</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Pot</Text>
            <ModalPicker
              label="Selectionner un pot"
              selectedValue={selectedPot}
              onValueChange={setSelectedPot}
              items={potItems}
              placeholder="Choisir un pot..."
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Plante</Text>
            <ModalPicker
              label="Selectionner une plante"
              selectedValue={fleur}
              onValueChange={setFleur}
              items={plantItems}
              placeholder="Choisir une plante..."
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mode intelligent (par plante)</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeButton, selectedPlantMode === 'humidite' && styles.modeButtonActive]}
                onPress={() => setSelectedPlantMode('humidite')}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeText, selectedPlantMode === 'humidite' && styles.modeTextActive]}>Humidite</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeButton, selectedPlantMode === 'oyas' && styles.modeButtonActive]}
                onPress={() => setSelectedPlantMode('oyas')}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeText, selectedPlantMode === 'oyas' && styles.modeTextActive]}>Oyas</Text>
              </TouchableOpacity>
            </View>
            {!fleur && (
              <Text style={styles.statusMuted}>
                Selectionnez une plante pour memoriser le mode.
              </Text>
            )}
          </View>

          <View style={[styles.fieldGroup, { marginTop: 16 }]}>
            <Text style={styles.fieldLabel}>Mode d'irrigation</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'event' && styles.modeButtonActive]}
                onPress={() => setMode('event')}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeText, mode === 'event' && styles.modeTextActive]}>Par calcul</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeButton, mode === 'quota' && styles.modeButtonActive]}
                onPress={() => setMode('quota')}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeText, mode === 'quota' && styles.modeTextActive]}>Quota / mois</Text>
              </TouchableOpacity>
            </View>

            {mode === 'quota' && (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.fieldLabel, { marginBottom: 4 }]}>Minutes totales / mois</Text>
                <TextInput
                  value={quotaMinutes}
                  onChangeText={setQuotaMinutes}
                  placeholder="Ex: 120"
                  keyboardType="numeric"
                  style={styles.input}
                />

                <Text style={[styles.fieldLabel, { marginTop: 12, marginBottom: 4 }]}>Evenements souhaites (optionnel)</Text>
                <TextInput
                  value={quotaEvents}
                  onChangeText={setQuotaEvents}
                  placeholder="Ex: 4"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            )}

            <View style={{ marginTop: 16 }}>
              <Text style={[styles.fieldLabel, { marginBottom: 4 }]}>Debit pompe (L/min)</Text>
              <TextInput
                value={flowRate}
                onChangeText={setFlowRate}
                placeholder="Ex: 1.5"
                keyboardType="numeric"
                style={styles.input}
              />
              <TouchableOpacity
                style={[styles.secondaryButton, styles.inlineButton]}
                onPress={handleSaveFlowRate}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Enregistrer le debit</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={ouvrirScanner}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Scanner QR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCalculer}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Calculer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <IrrigationResult resultat={resultat} onSendToESP32={handleEnvoyerESP32} />

        {fleur && plantesInfo[fleur] && (
          <PlantInfoCard
            plant={plantesInfo[fleur]}
            name={fleur.replace(/_/g, ' ')}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
