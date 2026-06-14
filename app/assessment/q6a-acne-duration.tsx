import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { ProgressBar } from '../../src/components/ProgressBar';
import { OptionCard } from '../../src/components/OptionCard';
import type { AcneDuration } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

const OPTIONS: { value: AcneDuration; label: string; description: string }[] = [
  { value: 'under_6m', label: 'Less than 6 months', description: 'Relatively recent breakouts' },
  { value: '6m_2yr', label: '6 months to 2 years', description: 'Been dealing with it for a while' },
  { value: 'over_2yr', label: 'More than 2 years', description: 'Long-standing skin concern' },
];

export default function Q6aAcneDurationScreen() {
  const { profile, setAcneDuration, finaliseSeverityAndPlan } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q5a-acne-frequency');

  const handleSelect = (value: AcneDuration) => {
    setAcneDuration(value);
    // Severity calculation runs here — needs Q4a + Q5a + Q6a all stored.
    // setAcneDuration is synchronous in Zustand so the store is updated before
    // finaliseSeverityAndPlan reads it. We pass value directly to avoid a
    // stale-closure read on profile.acne_duration.
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
          How long have you been dealing with breakouts?
        </Text>

        {OPTIONS.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={profile.acne_duration === opt.value}
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
