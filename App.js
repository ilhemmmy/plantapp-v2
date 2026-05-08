import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useCameraPermissions } from 'expo-camera';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { theme } from './theme';
import plantesInfo from './data/plants';
import { potsSoGarden, bacsData } from './data/pots';
import QRScanner from './components/QRScanner';
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import ClassicIrrigationScreen from './screens/ClassicIrrigationScreen';
import SmartModeScreen from './screens/SmartModeScreen';
import HistoryScreen from './screens/HistoryScreen';
import { calculerIrrigation, envoyerVersESP32, convertirQuotaEnEvenements, genererProchainesDates } from './utils/irrigation';
import {
  initDb,
  getHistory,
  insertHistory,
  deleteHistory,
  clearHistory,
  getPlantModes,
  upsertPlantMode,
  getPlantSmartSettings,
  upsertPlantSmartSettings,
  getKey,
  setKey,
} from './utils/db';

const potItems = Object.keys(potsSoGarden).map((pot) => ({
  label: pot,
  value: pot,
}));

const plantItems = Object.keys(plantesInfo).map((pl) => ({
  label: pl.replace(/_/g, ' '),
  value: pl,
}));

const DEMO_SENSOR_VALUE = 45;
const Tab = createBottomTabNavigator();

const defaultSmartSettings = {
  mode: 'humidite',
  humiditeMin: '',
  humiditeMax: '',
  oyasNiveauMin: '',
  oyasNiveauMax: '',
};

const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
};

export default function App() {
  const [selectedPot, setSelectedPot] = useState('');
  const [fleur, setFleur] = useState('');
  const [resultat, setResultat] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [mode, setMode] = useState('event'); // 'event' or 'quota'
  const [quotaMinutes, setQuotaMinutes] = useState('');
  const [quotaEvents, setQuotaEvents] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [flowRate, setFlowRate] = useState(''); // L/min, string for input
  const [permission, requestPermission] = useCameraPermissions();
  const [smartMode, setSmartMode] = useState('humidite'); // 'humidite' or 'oyas'
  const [selectedPlantMode, setSelectedPlantMode] = useState('humidite');
  const [plantModes, setPlantModes] = useState({});
  const [selectedSmartPlant, setSelectedSmartPlant] = useState(plantItems[0]?.value || '');
  const [plantSmartSettings, setPlantSmartSettings] = useState({});
  const [humiditeMin, setHumiditeMin] = useState('');
  const [humiditeMax, setHumiditeMax] = useState('');
  const [oyasNiveauMin, setOyasNiveauMin] = useState('');
  const [oyasNiveauMax, setOyasNiveauMax] = useState('');
  const [lastSmartAction, setLastSmartAction] = useState(null);

  useEffect(() => {
    // load saved state from db
    (async () => {
      try {
        await initDb();

        const flow = await getKey('flowRate');
        if (flow) setFlowRate(flow);

        const modes = await getPlantModes();
        setPlantModes(modes || {});

        const smartSettings = await getPlantSmartSettings();
        setPlantSmartSettings(smartSettings || {});

        const hist = await getHistory();
        if (Array.isArray(hist)) setHistorique(hist);

        const res = await getKey('resultat');
        if (res) {
          const parsed = safeParse(res, null);
          setResultat(parsed || null);
        }

        const sel = await getKey('uiSelections');
        if (sel) {
          const parsed = safeParse(sel, null);
          if (parsed) {
            setSelectedPot(parsed.selectedPot || '');
            setFleur(parsed.fleur || '');
            setMode(parsed.mode || 'event');
            setQuotaMinutes(parsed.quotaMinutes || '');
            setQuotaEvents(parsed.quotaEvents || '');
            setSelectedPlantMode(parsed.selectedPlantMode || 'humidite');
            setSelectedSmartPlant(parsed.selectedSmartPlant || plantItems[0]?.value || '');
            setSmartMode(parsed.smartMode || 'humidite');
          }
        }

        const last = await getKey('lastSmartAction');
        if (last) {
          const parsed = safeParse(last, null);
          setLastSmartAction(parsed || null);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    setKey('historique', JSON.stringify(historique));
  }, [historique]);

  useEffect(() => {
    setKey('resultat', JSON.stringify(resultat));
  }, [resultat]);

  useEffect(() => {
    const payload = {
      selectedPot,
      fleur,
      mode,
      quotaMinutes,
      quotaEvents,
      selectedPlantMode,
      selectedSmartPlant,
      smartMode,
    };
    setKey('uiSelections', JSON.stringify(payload));
  }, [selectedPot, fleur, mode, quotaMinutes, quotaEvents, selectedPlantMode, selectedSmartPlant, smartMode]);

  useEffect(() => {
    setKey('lastSmartAction', JSON.stringify(lastSmartAction));
  }, [lastSmartAction]);

  useEffect(() => {
    if (fleur) {
      const savedMode = plantModes[fleur];
      setSelectedPlantMode(savedMode || 'humidite');
    }
  }, [fleur, plantModes]);

  useEffect(() => {
    if (!historique || historique.length === 0) return;
    const hasSelected = selectedSmartPlant && historique.some((item) => item.plantKey === selectedSmartPlant);
    if (!hasSelected) {
      const latest = historique.find((item) => item.plantKey);
      if (latest && latest.plantKey) {
        setSelectedSmartPlant(latest.plantKey);
      }
    }
  }, [historique, selectedSmartPlant]);

  useEffect(() => {
    if (!selectedSmartPlant) return;
    const settings = plantSmartSettings[selectedSmartPlant] || defaultSmartSettings;
    setSmartMode(settings.mode || 'humidite');
    setHumiditeMin(settings.humiditeMin || '');
    setHumiditeMax(settings.humiditeMax || '');
    setOyasNiveauMin(settings.oyasNiveauMin || '');
    setOyasNiveauMax(settings.oyasNiveauMax || '');
  }, [selectedSmartPlant, plantSmartSettings]);

  const updatePlantSmartSettings = (plantKey, updates) => {
    const current = plantSmartSettings[plantKey] || defaultSmartSettings;
    const next = {
      ...plantSmartSettings,
      [plantKey]: {
        ...current,
        ...updates,
      },
    };
    setPlantSmartSettings(next);
    upsertPlantSmartSettings(plantKey, next[plantKey]);
  };

  const handleSelectSmartPlant = (plantKey) => {
    setSelectedSmartPlant(plantKey);
  };

  const handleSetSmartMode = (modeValue) => {
    setSmartMode(modeValue);
    if (selectedSmartPlant) {
      updatePlantSmartSettings(selectedSmartPlant, { mode: modeValue });
      const nextModes = { ...plantModes, [selectedSmartPlant]: modeValue };
      setPlantModes(nextModes);
      upsertPlantMode(selectedSmartPlant, modeValue);
    }
  };

  const handleSetSelectedPlantMode = (modeValue) => {
    setSelectedPlantMode(modeValue);
    if (fleur) {
      const nextModes = { ...plantModes, [fleur]: modeValue };
      setPlantModes(nextModes);
      upsertPlantMode(fleur, modeValue);
      updatePlantSmartSettings(fleur, { mode: modeValue });
    }
  };

  const ouvrirScanner = async () => {
    if (!permission?.granted) {
      const response = await requestPermission();
      if (!response.granted) {
        Alert.alert('Permission refusée', 'Vous devez autoriser la caméra.');
        return;
      }
    }
    setScanned(false);
    setShowScanner(true);
  };

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    try {
      const qrData = JSON.parse(data);
      if (qrData.pot && potsSoGarden[qrData.pot]) {
        setSelectedPot(qrData.pot);
        Alert.alert('Succès', `Pot scanné : ${qrData.pot}`);
      } else {
        Alert.alert('QR invalide');
      }
    } catch {
      Alert.alert('Format QR invalide');
    }
    setShowScanner(false);
  };

  const handleCalculer = () => {
    if (!selectedPot || !fleur) {
      Alert.alert('Sélectionnez un pot et une plante');
      return;
    }

    const smartSettings = plantSmartSettings[fleur] || defaultSmartSettings;
    const nextPlantModes = {
      ...plantModes,
      [fleur]: selectedPlantMode,
    };
    setPlantModes(nextPlantModes);
    upsertPlantMode(fleur, selectedPlantMode);
    updatePlantSmartSettings(fleur, { mode: selectedPlantMode });

    const pot = potsSoGarden[selectedPot];
    const plante = plantesInfo[fleur];
    if (mode === 'quota') {
      const total = parseInt(quotaMinutes, 10);
      const desired = quotaEvents ? parseInt(quotaEvents, 10) : null;
      if (!total || total <= 0) {
        Alert.alert('Entrez un total de minutes par mois valide');
        return;
      }

      // basic validation
      if (total > 10000) {
        Alert.alert('Valeur trop élevée', "Entrez un total raisonnable (<= 10000 minutes)");
        return;
      }
      if (desired && (desired < 1 || desired > 365)) {
        Alert.alert('Événements invalides', 'Le nombre d\'événements doit être entre 1 et 365');
        return;
      }

      const parsedFlow = flowRate ? parseFloat(flowRate) : null;

      const { eventsPerPeriod, minutesPerEvent } = convertirQuotaEnEvenements(
        total,
        'month',
        desired,
        2,
        120
      );

      // generate preview dates (ISO strings)
      const nextRuns = genererProchainesDates(eventsPerPeriod, 'month', new Date());

      const litresPerEvent = parsedFlow ? Math.round(minutesPerEvent * parsedFlow * 100) / 100 : null;

      const nouveauCalcul = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        date: new Date().toLocaleString(),
        pot: selectedPot,
        fleur: fleur.replace(/_/g, ' '),
        plantKey: fleur,
        plantLabel: fleur.replace(/_/g, ' '),
        smartMode: selectedPlantMode,
        smartHumiditeMin: smartSettings.humiditeMin,
        smartHumiditeMax: smartSettings.humiditeMax,
        smartOyasMin: smartSettings.oyasNiveauMin,
        smartOyasMax: smartSettings.oyasNiveauMax,
        temps: minutesPerEvent,
        heure: plante.periodeFloraison,
        mode: 'quota',
        totalMinutes: total,
        eventsPerPeriod,
        litresPerEvent,
      };

      setHistorique([nouveauCalcul, ...historique]);
      insertHistory(nouveauCalcul);
      const nextResult = { temps: minutesPerEvent, heure: plante.periodeFloraison, events: eventsPerPeriod, totalMinutes: total, nextRuns, litresPerEvent, flowRate: parsedFlow };
      setResultat(nextResult);
      setKey('resultat', JSON.stringify(nextResult));
    } else {
      const parsedFlow = flowRate ? parseFloat(flowRate) : null;
      const { temps, heure, litres, flowRate: usedFlow } = calculerIrrigation(pot, plante, bacsData, { flowRate: parsedFlow });

      const nouveauCalcul = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        date: new Date().toLocaleString(),
        pot: selectedPot,
        fleur: fleur.replace(/_/g, ' '),
        plantKey: fleur,
        plantLabel: fleur.replace(/_/g, ' '),
        smartMode: selectedPlantMode,
        smartHumiditeMin: smartSettings.humiditeMin,
        smartHumiditeMax: smartSettings.humiditeMax,
        smartOyasMin: smartSettings.oyasNiveauMin,
        smartOyasMax: smartSettings.oyasNiveauMax,
        temps,
        heure,
        litres,
        flowRate: usedFlow || parsedFlow,
      };

      setHistorique([nouveauCalcul, ...historique]);
      insertHistory(nouveauCalcul);
      const nextResult = { temps, heure, litres, flowRate: usedFlow || parsedFlow };
      setResultat(nextResult);
      setKey('resultat', JSON.stringify(nextResult));
    }
  };

  const handleSaveFlowRate = async () => {
    const v = parseFloat(flowRate);
    if (!v || v <= 0 || v > 50) {
      Alert.alert('Débit invalide', 'Entrez un débit en L/min raisonnable (ex: 0.5 - 50)');
      return;
    }
    await setKey('flowRate', String(v));
    Alert.alert('Débit sauvegardé', `Débit pompe enregistré: ${v} L/min`);
  };

  const handleEnvoyerESP32 = () => {
    if (!resultat) {
      Alert.alert("Pas de résultat à envoyer !");
      return;
    }
    envoyerVersESP32(resultat.temps);
  };

  const handleTesterCapteur = () => {
    const now = new Date().toLocaleString();
    const label = smartMode === 'humidite' ? 'Humidite' : 'Oyas';
    const plantLabel = selectedSmartPlant ? selectedSmartPlant.replace(/_/g, ' ') : 'N/A';
    const minValue = smartMode === 'humidite' ? parseFloat(humiditeMin) : parseFloat(oyasNiveauMin);
    const shouldAlert = Number.isFinite(minValue) && DEMO_SENSOR_VALUE < minValue;
    setLastSmartAction({
      plant: plantLabel,
      mode: label,
      value: DEMO_SENSOR_VALUE,
      min: smartMode === 'humidite' ? (humiditeMin || 'N/A') : (oyasNiveauMin || 'N/A'),
      max: smartMode === 'humidite' ? (humiditeMax || 'N/A') : (oyasNiveauMax || 'N/A'),
      action: 'Lecture capteur',
      date: now,
    });
    setKey('lastSmartAction', JSON.stringify({
      plant: plantLabel,
      mode: label,
      value: DEMO_SENSOR_VALUE,
      min: smartMode === 'humidite' ? (humiditeMin || 'N/A') : (oyasNiveauMin || 'N/A'),
      max: smartMode === 'humidite' ? (humiditeMax || 'N/A') : (oyasNiveauMax || 'N/A'),
      action: 'Lecture capteur',
      date: now,
    }));
    Alert.alert('Test capteur', `Valeur lue: ${DEMO_SENSOR_VALUE}%`);
    if (shouldAlert) {
      Alert.alert('Alerte', 'Valeur en dessous du seuil minimum.');
    }
  };

  const handleMettreAJourMode = () => {
    const now = new Date().toLocaleString();
    const plantLabel = selectedSmartPlant ? selectedSmartPlant.replace(/_/g, ' ') : 'N/A';
    if (smartMode === 'humidite') {
      const current = DEMO_SENSOR_VALUE;
      const min = parseFloat(humiditeMin);
      const max = parseFloat(humiditeMax);
      const shouldWater = Number.isFinite(current) && Number.isFinite(min) && current < min;
      const action = shouldWater ? 'Arroser' : 'Ne pas arroser';
      setLastSmartAction({
        plant: plantLabel,
        mode: 'Humidite',
        value: Number.isFinite(current) ? current : 'N/A',
        min: Number.isFinite(min) ? min : 'N/A',
        max: Number.isFinite(max) ? max : 'N/A',
        action,
        date: now,
      });
      setKey('lastSmartAction', JSON.stringify({
        plant: plantLabel,
        mode: 'Humidite',
        value: Number.isFinite(current) ? current : 'N/A',
        min: Number.isFinite(min) ? min : 'N/A',
        max: Number.isFinite(max) ? max : 'N/A',
        action,
        date: now,
      }));
    } else {
      const current = DEMO_SENSOR_VALUE;
      const min = parseFloat(oyasNiveauMin);
      const max = parseFloat(oyasNiveauMax);
      const shouldWater = Number.isFinite(current) && Number.isFinite(min) && current < min;
      const action = shouldWater ? 'Remplir / Arroser' : 'Niveau OK';
      setLastSmartAction({
        plant: plantLabel,
        mode: 'Oyas',
        value: Number.isFinite(current) ? current : 'N/A',
        min: Number.isFinite(min) ? min : 'N/A',
        max: Number.isFinite(max) ? max : 'N/A',
        action,
        date: now,
      });
      setKey('lastSmartAction', JSON.stringify({
        plant: plantLabel,
        mode: 'Oyas',
        value: Number.isFinite(current) ? current : 'N/A',
        min: Number.isFinite(min) ? min : 'N/A',
        max: Number.isFinite(max) ? max : 'N/A',
        action,
        date: now,
      }));
    }
    Alert.alert('Mise a jour', 'Parametres enregistres.');
  };

  const handleDeleteHistoryItem = (id) => {
    setHistorique((prev) => prev.filter((item) => item.id !== id));
    deleteHistory(id);
  };

  const handleClearHistory = () => {
    setHistorique([]);
    clearHistory();
  };

  if (showScanner) {
    return (
      <QRScanner
        onScanned={handleBarCodeScanned}
        onCancel={() => setShowScanner(false)}
        scanned={scanned}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTitleStyle: { color: theme.colors.text },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textLight,
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
            },
            tabBarIcon: ({ color }) => {
              const icon =
                route.name === 'Accueil'
                  ? '🏠'
                  : route.name === 'Classique'
                  ? '💧'
                  : route.name === 'Intelligent'
                  ? '🤖'
                  : '🕒';
              return <Text style={{ color }}>{icon}</Text>;
            },
          })}
        >
          <Tab.Screen name="Dashboard">
            {({ navigation }) => (
              <DashboardScreen
                styles={styles}
                plantesCount={Object.keys(plantesInfo).length}
                potsCount={Object.keys(potsSoGarden).length}
                historiqueCount={historique.length}
                smartMode={smartMode}
                lastSmartAction={lastSmartAction}
                demoValue={DEMO_SENSOR_VALUE}
                humiditeMin={humiditeMin}
                humiditeMax={humiditeMax}
                oyasNiveauMin={oyasNiveauMin}
                oyasNiveauMax={oyasNiveauMax}
                navigation={navigation}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Accueil">
            {() => (
              <HomeScreen
                styles={styles}
                plantesCount={Object.keys(plantesInfo).length}
                potsCount={Object.keys(potsSoGarden).length}
                historiqueCount={historique.length}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Classique">
            {() => (
              <ClassicIrrigationScreen
                styles={styles}
                potItems={potItems}
                plantItems={plantItems}
                selectedPot={selectedPot}
                setSelectedPot={setSelectedPot}
                fleur={fleur}
                setFleur={setFleur}
                selectedPlantMode={selectedPlantMode}
                setSelectedPlantMode={handleSetSelectedPlantMode}
                mode={mode}
                setMode={setMode}
                quotaMinutes={quotaMinutes}
                setQuotaMinutes={setQuotaMinutes}
                quotaEvents={quotaEvents}
                setQuotaEvents={setQuotaEvents}
                flowRate={flowRate}
                setFlowRate={setFlowRate}
                handleSaveFlowRate={handleSaveFlowRate}
                ouvrirScanner={ouvrirScanner}
                handleCalculer={handleCalculer}
                resultat={resultat}
                handleEnvoyerESP32={handleEnvoyerESP32}
                plantesInfo={plantesInfo}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Intelligent">
            {() => (
              <SmartModeScreen
                styles={styles}
                smartMode={smartMode}
                setSmartMode={handleSetSmartMode}
                plantItems={plantItems}
                selectedSmartPlant={selectedSmartPlant}
                onSelectSmartPlant={handleSelectSmartPlant}
                plantModes={plantModes}
                plantSmartSettings={plantSmartSettings}
                historique={historique}
                humiditeMin={humiditeMin}
                setHumiditeMin={(v) => {
                  setHumiditeMin(v);
                  if (selectedSmartPlant) {
                    updatePlantSmartSettings(selectedSmartPlant, { humiditeMin: v });
                  }
                }}
                humiditeMax={humiditeMax}
                setHumiditeMax={(v) => {
                  setHumiditeMax(v);
                  if (selectedSmartPlant) {
                    updatePlantSmartSettings(selectedSmartPlant, { humiditeMax: v });
                  }
                }}
                oyasNiveauMin={oyasNiveauMin}
                setOyasNiveauMin={(v) => {
                  setOyasNiveauMin(v);
                  if (selectedSmartPlant) {
                    updatePlantSmartSettings(selectedSmartPlant, { oyasNiveauMin: v });
                  }
                }}
                oyasNiveauMax={oyasNiveauMax}
                setOyasNiveauMax={(v) => {
                  setOyasNiveauMax(v);
                  if (selectedSmartPlant) {
                    updatePlantSmartSettings(selectedSmartPlant, { oyasNiveauMax: v });
                  }
                }}
                handleTesterCapteur={handleTesterCapteur}
                handleMettreAJourMode={handleMettreAJourMode}
                lastSmartAction={lastSmartAction}
                demoValue={DEMO_SENSOR_VALUE}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Historique">
            {() => (
              <HistoryScreen
                styles={styles}
                historique={historique}
                onDeleteItem={handleDeleteHistoryItem}
                onClear={handleClearHistory}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },

  // Hero
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerText: {
    marginLeft: theme.spacing.md,
  },
  appName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    letterSpacing: -0.5,
    fontFamily: theme.fontFamily.display,
  },
  appTagline: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontFamily: theme.fontFamily.body,
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.display,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: theme.fontFamily.body,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },

  // Sections
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.fontFamily.display,
  },
  dashboardGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  dashboardCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  dashboardTitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: theme.fontFamily.body,
  },
  dashboardValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    marginTop: theme.spacing.xs,
    fontFamily: theme.fontFamily.display,
  },
  dashboardSub: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: 2,
    fontFamily: theme.fontFamily.body,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  chip: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.body,
  },
  progressBar: {
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.waterBlueBg,
    overflow: 'hidden',
    marginTop: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.waterBlue,
  },
  progressFillOk: {
    backgroundColor: theme.colors.success,
  },
  progressFillWarn: {
    backgroundColor: theme.colors.warning,
  },
  progressFillDanger: {
    backgroundColor: theme.colors.danger,
  },
  plantList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  plantChip: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  plantChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  plantChipText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.body,
  },
  plantChipTextActive: {
    color: theme.colors.surface,
  },
  smartPlantList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  smartPlantCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  smartPlantCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceAlt,
  },
  smartPlantName: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fontFamily.display,
    marginBottom: 2,
  },
  smartPlantMeta: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.body,
  },
  selectedPlantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  inlineActionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
  },
  inlineActionText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.surface,
    fontWeight: '700',
    fontFamily: theme.fontFamily.body,
  },
  fieldGroup: {
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: theme.fontFamily.body,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  primaryButtonIcon: {
    fontSize: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    fontFamily: theme.fontFamily.display,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  inlineButton: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
  },
  secondaryButtonIcon: {
    fontSize: 16,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    fontFamily: theme.fontFamily.body,
  },
  modeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  modeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modeText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fontFamily.body,
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  modeSubtext: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: 4,
    fontFamily: theme.fontFamily.body,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.fontFamily.body,
    height: 48,
  },
  blockCard: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  blockTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fontFamily.display,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  inlineField: {
    flex: 1,
  },
  sensorRow: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sensorValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    marginTop: theme.spacing.xs,
    fontFamily: theme.fontFamily.display,
  },
  statusText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.fontFamily.body,
    marginBottom: theme.spacing.xs,
  },
  statusMuted: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.body,
  },
  decisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  decisionBadge: {
    marginLeft: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.warning,
  },
  decisionBadgeOk: {
    backgroundColor: theme.colors.success,
  },
  decisionBadgeWarn: {
    backgroundColor: theme.colors.warning,
  },
  decisionBadgeText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    fontFamily: theme.fontFamily.body,
  },
});
