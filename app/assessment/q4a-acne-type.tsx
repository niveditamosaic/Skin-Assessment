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
  { value: 'red_painless', label: 'Red painless pimples', description: 'Small red bumps that are not painful or tender' },
  { value: 'red_pimples',  label: 'Red painful pimples',  description: 'Raised red bumps that are sore or tender to touch' },
  { value: 'pus',          label: 'Pus pimples',          description: 'Whiteheads or yellow-tipped pimples' },
  { value: 'cystic',       label: 'Cystic',               description: 'Deep, painful lumps under the skin' },
];

export default function Q4aAcneTypeScreen() {
  const { profile, setAcneType, finaliseSeverityAndPlan } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q3-concern');

  const handleNext = () => {
    const acneType = profile.acne_type!;
    // For types that skip Q5a/Q6a, finalise severity now before navigating.
    if (acneType === 'red_painless' || acneType === 'cystic') {
      finaliseSeverityAndPlan();
    }
    router.push(routeAfterQ4a(acneType) as any);
  };

  return (
    <QuestionShell
      step={4}
      onBack={goBack}
      onNext={handleNext}
      nextDisabled={!profile.acne_type}
    >
      <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A3A6B', lineHeight: 36, paddingHorizontal: 24, marginBottom: 32 }}>
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
