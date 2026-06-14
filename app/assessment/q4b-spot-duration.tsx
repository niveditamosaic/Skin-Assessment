import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { ProgressBar } from '../../src/components/ProgressBar';
import { OptionCard } from '../../src/components/OptionCard';
import type { SpotDuration } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

const OPTIONS: { value: SpotDuration; label: string; description: string }[] = [
  {
    value: 'under_3m',
    label: 'Just started',
    description: 'Less than 3 months',
  },
  {
    value: '3m_1yr',
    label: 'Been a while',
    description: '3 months to 1 year',
  },
  {
    value: 'over_1yr',
    label: 'Long time',
    description: 'More than 1 year',
  },
];

export default function Q4bSpotDurationScreen() {
  const { profile, setSpotDuration } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q3-concern');

  const handleSelect = (value: SpotDuration) => {
    setSpotDuration(value);
    router.push('/assessment/q5b-spot-location' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ProgressBar currentStep={4} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>
          How long have you had these dark spots or marks?
        </Text>

        {OPTIONS.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={profile.spot_duration === opt.value}
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
