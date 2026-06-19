import React from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { QuestionShell } from '../../src/components/QuestionShell';
import { OptionCard } from '../../src/components/OptionCard';
import { Q3_OPTIONS } from '../../src/constants/questions';
import { routeAfterQ3 } from '../../src/logic/branchRouter';
import type { Concern } from '../../src/types/assessment';
import { useGoBack } from '../../src/hooks/useGoBack';

export default function Q3ConcernScreen() {
  const { profile, toggleConcern } = useAssessmentStore();
  const goBack = useGoBack('/assessment/q2-skin-type');

  return (
    <QuestionShell
      step={3}
      onBack={goBack}
      onNext={() => router.push(routeAfterQ3(profile.concerns) as any)}
      nextDisabled={profile.concerns.length === 0}
    >
      <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A3A6B', lineHeight: 36, paddingHorizontal: 24, marginBottom: 32 }}>
        What is your biggest skin concern right now?
      </Text>
      <Text style={{ fontSize: 14, color: '#9AA5B4', paddingHorizontal: 24, marginBottom: 20, marginTop: -20 }}>
        Select all that apply
      </Text>

      {Q3_OPTIONS.map(opt => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          description={opt.description}
          selected={profile.concerns.includes(opt.value as Concern)}
          onPress={() => toggleConcern(opt.value as Concern)}
        />
      ))}
    </QuestionShell>
  );
}
