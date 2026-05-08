# PlantApp - Système d'Irrigation Intelligent

Application React Native / Expo pour calculer le temps d'irrigation de vos plantes selon le pot utilisé. Contient une base de données de **742 plantes** avec leurs besoins en eau, exposition et période de floraison.

## Fonctionnalités

- Sélection de pot et de plante avec recherche intégrée
- Calcul automatique du temps d'irrigation
- Fiche détaillée de chaque plante
- Scanner QR pour identifier un pot
- Envoi des données vers un ESP32
- Historique des calculs

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/ilhemmmy/PlantApp.git
cd PlantApp
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer l'application

```bash
npx expo start
```

Un QR code s'affiche dans le terminal.

## Tester sur votre téléphone avec Expo Go

### iPhone

1. Télécharger **Expo Go** depuis l'App Store
2. Ouvrir l'app **Appareil photo** de l'iPhone
3. Scanner le QR code affiché dans le terminal
4. L'app s'ouvre automatiquement dans Expo Go

### Android

1. Télécharger **Expo Go** depuis le Play Store
2. Ouvrir Expo Go
3. Appuyer sur **Scan QR Code**
4. Scanner le QR code affiché dans le terminal

### Important

- Le téléphone et l'ordinateur doivent être sur le **même réseau Wi-Fi**
- Si ça ne marche pas, essayer le mode tunnel : `npx expo start --tunnel`

## Tester sur navigateur

```bash
npx expo start --web
```

Puis ouvrir http://localhost:8081 dans le navigateur.

## Structure du projet

```
PlantApp/
├── App.js                          # Écran principal
├── components/
│   ├── ModalPicker.js              # Sélecteur adapté iOS/Android
│   ├── QRScanner.js                # Scanner QR code
│   ├── PlantInfoCard.js            # Fiche plante
│   ├── IrrigationResult.js         # Résultat du calcul
│   └── HistoryList.js              # Historique
├── data/
│   ├── plants.js                   # 742 plantes
│   └── pots.js                     # Pots et coefficients
└── utils/
    └── irrigation.js               # Calcul + communication ESP32
```
