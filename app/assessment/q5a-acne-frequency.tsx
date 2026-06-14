import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { ProgressBar } from '../../src/components/ProgressBar';
import { OptionCard } from '../../src/components/OptionCard';
import type { AcneFrequency } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

const OPTIONS: { value: AcneFrequency; label: string; description: string }[] = [
  {
    value: 'rarely',
    label: 'Rarely',
    description: 'Only during stress or travel',
  },
  {
    value: 'monthly',
    label: 'Sometimes',
    description: '2 to 3 times a month',
  },
  {
    value: 'always',
    label: 'Often',
    description: 'Almost always have active breakouts',
  },
];

export default function Q5aAcneFrequencyScreen() {
  const { profile, setAcneFrequency } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q4a-acne-type');

  const handleSelect = (value: AcneFrequency) => {
    setAcneFrequency(value);
    router.push('/assessment/q6a-acne-duration' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ProgressBar currentStep={5} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>How often do you get breakouts?</Text>

        {OPTIONS.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={profile.acne_frequency === opt.value}
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
