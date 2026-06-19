import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TOTAL_STEPS } from '../constants/questions';

interface Props {
  currentStep: number;
}

export function ProgressBar({ currentStep }: Props) {
  const pct = Math.min(currentStep / TOTAL_STEPS, 1);

  return (
    <View style={s.track}>
      <View style={[s.fill, { flex: pct }]} />
      <View style={{ flex: 1 - pct }} />
    </View>
  );
}

const s = StyleSheet.create({
  track: {
    height: 3,
    backgroundColor: '#E8E8E8',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: '#1A2540',
  },
});
