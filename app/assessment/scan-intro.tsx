import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useGoBack } from '../../src/hooks/useGoBack';

const CHECKLIST = [
  'Good lighting — face a window or bright light',
  'Remove glasses if you wear them',
  'No filters — use your plain camera',
];

export default function ScanIntroScreen() {
  const goBack = useGoBack('/assessment/q6a-acne-duration');
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.headline}>
          Now let's take a look at your skin.
        </Text>

        <View style={styles.checklist}>
          {CHECKLIST.map(item => (
            <View key={item} style={styles.checkRow}>
              <Text style={styles.bullet}>✓</Text>
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.privacyBox}>
          <Text style={styles.privacyText}>
            🔒 Your photo is never stored. Only the skin analysis result is saved — never the image itself.
          </Text>
        </View>
      </View>

      <PrimaryButton
        label="Open camera"
        onPress={() => router.push('/assessment/scan-camera' as any)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'space-between' },
  backButton: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4 },
  backText: { fontSize: 15, color: '#555' },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 36,
  },
  checklist: { gap: 14 },
  checkRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  bullet: { fontSize: 16, color: '#1A1A1A', marginTop: 1 },
  checkText: { fontSize: 16, color: '#333', flex: 1, lineHeight: 22 },
  privacyBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 14,
  },
  privacyText: { fontSize: 13, color: '#555', lineHeight: 20 },
});
