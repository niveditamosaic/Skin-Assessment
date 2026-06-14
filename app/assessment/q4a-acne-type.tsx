import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useGoBack } from '../../src/hooks/useGoBack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ImageOptionCard } from '../../src/components/ImageOptionCard';
import type { AcneType } from '../../src/types/assessment';
import { routeAfterQ4a } from '../../src/logic/branchRouter';

const OPTIONS: { value: AcneType; label: string; imageLabel: string; imageUri: string }[] = [
  {
    value: 'red_pimples',
    label: 'Red pimples without pus',
    imageLabel: 'Inflammatory acne',
    imageUri: 'https://placehold.co/120x120/ffcccc/cc0000?text=Red+Pimples',
  },
  {
    value: 'pus',
    label: 'Pimples with pus',
    imageLabel: 'Pustular acne',
    imageUri: 'https://placehold.co/120x120/fff0cc/cc8800?text=Pus+Pimples',
  },
  {
    value: 'cystic',
    label: 'Cystic or nodular acne',
    imageLabel: 'Cystic / nodular',
    imageUri: 'https://placehold.co/120x120/e0ccff/6600cc?text=Cystic+Acne',
  },
];

export default function Q4aAcneTypeScreen() {
  const { profile, setAcneType } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q3-concern');

  const handleSelect = (value: AcneType) => {
    setAcneType(value); // sets derm_flag + severity silently for cystic
    router.push(routeAfterQ4a(value) as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ProgressBar currentStep={4} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>
          What type of acne do you usually get?
        </Text>

        {OPTIONS.map(opt => (
          <ImageOptionCard
            key={opt.value}
            label={opt.label}
            imageUri={opt.imageUri}
            imageLabel={opt.imageLabel}
            selected={profile.acne_type === opt.value}
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
