import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { ProgressBar } from '../../src/components/ProgressBar';
import { OptionCard } from '../../src/components/OptionCard';
import { Q2_OPTIONS } from '../../src/constants/questions';
import type { SkinType } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

export default function Q2SkinTypeScreen() {
  const { profile, setSkinType } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q1-details');

  const handleSelect = (value: SkinType) => {
    setSkinType(value);
    router.push('/assessment/q3-concern');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={goBack}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ProgressBar currentStep={2} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>
          How does your skin feel a few hours after washing your face?
        </Text>

        {Q2_OPTIONS.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={profile.skin_type === opt.value}
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
