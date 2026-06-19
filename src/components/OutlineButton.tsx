import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  label?: string;
  onPress: () => void;
}

export function OutlineButton({ label = 'Back', onPress }: Props) {
  return (
    <TouchableOpacity style={s.button} onPress={onPress} activeOpacity={0.8}>
      <Text style={s.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  button: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#1A2540',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  label: {
    color: '#1A2540',
    fontSize: 16,
    fontWeight: '700',
  },
});
