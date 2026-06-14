import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { ProgressBar } from '../../src/components/ProgressBar';
import { OptionCard } from '../../src/components/OptionCard';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Q3_OPTIONS } from '../../src/constants/questions';
import { routeAfterQ3 } from '../../src/logic/branchRouter';
import type { Concern } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

export default function Q3ConcernScreen() {
  const { profile, toggleConcern } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q2-skin-type');
  const hasSelection = profile.concerns.length > 0;

  const handleNext = () => {
    const nextRoute = routeAfterQ3(profile.concerns);
    router.push(nextRoute as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={goBack}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ProgressBar currentStep={3} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>
          What is your biggest skin concern right now?
        </Text>
        <Text style={styles.hint}>Select all that apply</Text>

        {Q3_OPTIONS.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={profile.concerns.includes(opt.value as Concern)}
            onPress={() => toggleConcern(opt.value as Concern)}
          />
        ))}
      </ScrollView>

      <PrimaryButton
        label="Next"
        onPress={handleNext}
        disabled={!hasSelection}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  backButton: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4 },
  backText: { fontSize: 15, color: '#555' },
  content: { paddingTop: 16, paddingBottom: 24 },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    paddingHorizontal: 24,
    lineHeight: 30,
  },
  hint: {
    fontSize: 13,
    color: '#888',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
});
