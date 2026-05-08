import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HistoryList from '../components/HistoryList';

export default function HistoryScreen({ styles, historique, onClear, onDeleteItem }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.sectionCard}>
          <HistoryList historique={historique} onClear={onClear} onDeleteItem={onDeleteItem} />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
