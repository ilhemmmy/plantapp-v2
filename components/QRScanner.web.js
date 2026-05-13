import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function QRScanner({ onCancel }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Scanner QR non disponible sur navigateur web.</Text>
      <TouchableOpacity style={styles.button} onPress={onCancel}>
        <Text style={styles.buttonText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 18, marginBottom: 24, textAlign: 'center', paddingHorizontal: 20 },
  button: { backgroundColor: 'rgba(255,255,255,0.18)', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 50 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
