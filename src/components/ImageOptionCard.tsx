import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';

interface Props {
  label: string;
  imageUri: string;
  imageLabel: string;
  selected: boolean;
  onPress: () => void;
}

export function ImageOptionCard({
  label,
  imageUri,
  imageLabel,
  selected,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
        <Text style={styles.imageLabel}>{imageLabel}</Text>
      </View>
      <View style={styles.labelRow}>
        <View style={styles.indicator}>
          {selected && <View style={styles.dot} />}
        </View>
        <Text style={[styles.label, selected && styles.selectedLabel]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  selected: {
    borderColor: '#1A1A1A',
    backgroundColor: '#F5F5F5',
  },
  imageWrapper: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F9F9F9',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  imageLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1A1A1A',
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  selectedLabel: {
    color: '#1A1A1A',
  },
});
