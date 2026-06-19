import React from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { QuestionShell } from '../../src/components/QuestionShell';
import { OptionCard } from '../../src/components/OptionCard';
import type { AcneType } from '../../src/types/assessment';
import { routeAfterQ4a } from '../../src/logic/branchRouter';
import { useGoBack } from '../../src/hooks/useGoBack';

const OPTIONS: { value: AcneType; label: string; description: string }[] = [
  { value: 'red_pimples', label: 'Red pimples', description: 'Raised red bumps, no visible pus' },
  { value: 'pus',         label: 'Pus pimples', description: 'Whiteheads or yellow-tipped pimples' },
  { value: 'cystic',      label: 'Cystic',      description: 'Deep, painful lumps under the skin' },
];

export default function Q4aAcneTypeScreen() {
  const { profile, setAcneType } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q3-concern');

  return (
    <QuestionShell
      step={4}
      onBack={goBack}
      onNext={() => router.push(routeAfterQ4a(profile.acne_type!) as any)}
      nextDisabled={!profile.acne_type}
    >
      <Text style={{ fontSize: 26, fontWeight: '800', color: '#1A2540', lineHeight: 34, paddingHorizontal: 24, marginBottom: 32 }}>
        What type of acne do you usually get?
      </Text>

      {OPTIONS.map(opt => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          description={opt.description}
          selected={profile.acne_type === opt.value}
          onPress={() => setAcneType(opt.value)}
        />
      ))}
    </QuestionShell>
  );
}
