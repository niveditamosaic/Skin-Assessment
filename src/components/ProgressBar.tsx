import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TOTAL_STEPS } from '../constants/questions';

interface Props {
  currentStep: number; // 1-based
}

export function ProgressBar({ currentStep }: Props) {
  const progress = currentStep / TOTAL_STEPS;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>
      <Text style={styles.label}>
        Question {currentStep} of {TOTAL_STEPS}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 6,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5E5',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: '#1A1A1A',
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    color: '#888',
  },
});
