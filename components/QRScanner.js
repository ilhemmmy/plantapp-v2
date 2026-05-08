import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { theme } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIEWFINDER_SIZE = SCREEN_WIDTH * 0.68;
const CORNER_LENGTH = 28;
const CORNER_THICKNESS = 3.5;
const CORNER_RADIUS = 4;

function CornerBracket({ position }) {
  const isTop = position === 'topLeft' || position === 'topRight';
  const isLeft = position === 'topLeft' || position === 'bottomLeft';

  return (
    <View
      style={[
        styles.corner,
        isTop ? { top: -CORNER_THICKNESS / 2 } : { bottom: -CORNER_THICKNESS / 2 },
        isLeft ? { left: -CORNER_THICKNESS / 2 } : { right: -CORNER_THICKNESS / 2 },
      ]}
    >
      {/* Horizontal bar */}
      <View
        style={[
          styles.cornerBar,
          {
            width: CORNER_LENGTH,
            height: CORNER_THICKNESS,
            borderRadius: CORNER_RADIUS,
          },
          isTop ? { top: 0 } : { bottom: 0 },
          isLeft ? { left: 0 } : { right: 0 },
          { position: 'absolute' },
        ]}
      />
      {/* Vertical bar */}
      <View
        style={[
          styles.cornerBar,
          {
            width: CORNER_THICKNESS,
            height: CORNER_LENGTH,
            borderRadius: CORNER_RADIUS,
          },
          isTop ? { top: 0 } : { bottom: 0 },
          isLeft ? { left: 0 } : { right: 0 },
          { position: 'absolute' },
        ]}
      />
    </View>
  );
}

export default function QRScanner({ onScanned, onCancel, scanned }) {
  // Calculate overlay region dimensions
  const viewfinderTop = (SCREEN_HEIGHT - VIEWFINDER_SIZE) / 2 - 40;
  const viewfinderLeft = (SCREEN_WIDTH - VIEWFINDER_SIZE) / 2;
  const viewfinderBottom = SCREEN_HEIGHT - viewfinderTop - VIEWFINDER_SIZE;

  return (
    <View style={styles.container}>
      {/* Full screen camera */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : onScanned}
      />

      {/* Dark overlay — top region */}
      <View
        style={[
          styles.overlayRegion,
          {
            top: 0,
            left: 0,
            right: 0,
            height: viewfinderTop,
          },
        ]}
      />

      {/* Dark overlay — left region */}
      <View
        style={[
          styles.overlayRegion,
          {
            top: viewfinderTop,
            left: 0,
            width: viewfinderLeft,
            height: VIEWFINDER_SIZE,
          },
        ]}
      />

      {/* Dark overlay — right region */}
      <View
        style={[
          styles.overlayRegion,
          {
            top: viewfinderTop,
            right: 0,
            width: viewfinderLeft,
            height: VIEWFINDER_SIZE,
          },
        ]}
      />

      {/* Dark overlay — bottom region */}
      <View
        style={[
          styles.overlayRegion,
          {
            top: viewfinderTop + VIEWFINDER_SIZE,
            left: 0,
            right: 0,
            bottom: 0,
          },
        ]}
      />

      {/* Viewfinder frame with corner brackets */}
      <View
        style={[
          styles.viewfinder,
          {
            top: viewfinderTop,
            left: viewfinderLeft,
            width: VIEWFINDER_SIZE,
            height: VIEWFINDER_SIZE,
          },
        ]}
      >
        <CornerBracket position="topLeft" />
        <CornerBracket position="topRight" />
        <CornerBracket position="bottomLeft" />
        <CornerBracket position="bottomRight" />
      </View>

      {/* Instruction text below viewfinder */}
      <View
        style={[
          styles.instructionContainer,
          { top: viewfinderTop + VIEWFINDER_SIZE + 28 },
        ]}
      >
        <Text style={styles.instructionText}>
          Scannez le QR code du pot
        </Text>
      </View>

      {/* Top bar — back button */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.backArrow}>{'\u2039'}</Text>
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom bar — cancel button */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Dark overlay panels
  overlayRegion: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  // Viewfinder cutout (transparent center)
  viewfinder: {
    position: 'absolute',
  },

  // Corner bracket wrapper
  corner: {
    position: 'absolute',
    width: CORNER_LENGTH,
    height: CORNER_LENGTH,
  },

  // Individual corner bar (L-shaped pieces)
  cornerBar: {
    backgroundColor: theme.colors.primaryLight,
  },

  // Instruction text
  instructionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.lg,
    fontWeight: '500',
    letterSpacing: 0.3,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'android' ? theme.spacing.xl : 0,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
    marginRight: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.lg,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: theme.spacing.xxxl,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    backdropFilter: 'blur(12px)',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.22)',
      },
      default: {},
    }),
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
