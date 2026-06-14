import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { ProgressBar } from '../../src/components/ProgressBar';
import { OptionCard } from '../../src/components/OptionCard';
import type { SpotLocation } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

const OPTIONS: { value: SpotLocation; label: string }[] = [
  { value: 'cheeks_under_eyes', label: 'Cheeks and below the eyes' },
  { value: 'forehead_nose', label: 'Forehead and nose (T-zone)' },
  { value: 'jaw_chin', label: 'Around the jaw and chin' },
  { value: 'all_over', label: 'All over the face' },
];

export default function Q5cTanLocationScreen() {
  const { profile, setSpotLocation } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q4c-tan-duration');

  const handleSelect = (value: SpotLocation) => {
    setSpotLocation(value);
    router.push('/assessment/q6c-tan-sun-exposure' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ProgressBar currentStep={5} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>
          Where on your face is the tanning or unevenness most visible?
        </Text>

        {OPTIONS.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={profile.spot_location === opt.value}
            onPress={() => handleSelect(opt.value)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  backButton: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4 },
  backText: { fontSize: 15, color: '#555' },
  content: { paddingTop: 16, paddingBottom: 40 },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 28,
    paddingHorizontal: 24,
    lineHeight: 30,
  },
});
