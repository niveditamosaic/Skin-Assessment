import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function PrimaryButton({ label, onPress, disabled = false }: Props) {
  return (
    <TouchableOpacity
      style={[s.button, disabled && s.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={[s.label, disabled && s.disabledLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  button: {
    flex: 1,
    backgroundColor: '#1A2540',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: '#C8CDD9',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledLabel: {
    color: 'rgba(255,255,255,0.6)',
  },
});
