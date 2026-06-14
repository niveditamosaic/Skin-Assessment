import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>Man Matters</Text>
        <Text style={styles.headline}>Your skin, finally understood.</Text>
        <Text style={styles.subtext}>
          Answer 6 quick questions + a 10-second face scan.
        </Text>
      </View>
      <PrimaryButton
        label="Start my skin assessment"
        onPress={() => router.push('/assessment/q1-details')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  brand: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#888',
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 40,
  },
  subtext: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
});
