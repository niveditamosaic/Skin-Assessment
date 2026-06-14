import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { ProgressBar } from '../../src/components/ProgressBar';
import { OptionCard } from '../../src/components/OptionCard';
import type { SunExposure } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

const OPTIONS: { value: SunExposure; label: string; description: string }[] = [
  { value: 'mostly_indoors', label: 'Mostly indoors', description: 'Less than 1 hour outside' },
  { value: 'moderate', label: 'Moderate', description: '1 to 3 hours outside' },
  { value: 'mostly_outdoors', label: 'Mostly outdoors', description: 'More than 3 hours' },
];

export default function Q6bSunExposureScreen() {
  const { profile, setSunExposure, finaliseSeverityAndPlan } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q5b-spot-location');

  const handleSelect = (value: SunExposure) => {
    setSunExposure(value);
    finaliseSeverityAndPlan();
    router.push('/assessment/scan-intro' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ProgressBar currentStep={6} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>
          How much time do you spend outdoors on a typical day?
        </Text>

        {OPTIONS.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={profile.sun_exposure === opt.value}
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
