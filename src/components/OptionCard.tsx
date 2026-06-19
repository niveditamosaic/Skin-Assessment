import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionCard({ label, description, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[s.card, selected ? s.cardSelected : s.cardUnselected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[s.label, selected && s.labelSelected]}>{label}</Text>
      {description ? (
        <Text style={[s.description, selected && s.descriptionSelected]}>
          {description}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cardUnselected: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    backgroundColor: '#FFFFFF',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#1A2540',
    backgroundColor: '#F0F2F6',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2540',
    textAlign: 'center',
  },
  labelSelected: {
    color: '#1A2540',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  descriptionSelected: {
    color: '#1A2540',
    opacity: 0.75,
  },
});
