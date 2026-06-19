import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={s.root}>
      {/* Hero copy — logo sits inline above the headline */}
      <View style={s.body}>
        <Image
          source={require('../assets/images/mm-logo.png')}
          style={{ width: 140, height: 44, resizeMode: 'contain', alignSelf: 'flex-start', marginTop: 48, marginLeft: 0, marginBottom: 24 }}
          accessibilityLabel="Man Matters"
        />
        <Text style={s.headline}>
          Your skin,{'\n'}finally understood.
        </Text>
        <Text style={s.subtext}>
          Answer 6 quick questions and get a personalised treatment plan for your skin concern.
        </Text>
      </View>

      {/* CTA */}
      <View style={s.footer}>
        <TouchableOpacity
          style={s.ctaBtn}
          onPress={() => router.push('/assessment/q1-details')}
          activeOpacity={0.85}
        >
          <Text style={s.ctaBtnText}>Start my skin assessment</Text>
        </TouchableOpacity>
        <Text style={s.disclaimer}>
          Takes about 2 minutes. No account needed.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  headline: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1A3A6B',
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 17,
    color: '#1A3A6B',
    lineHeight: 26,
    maxWidth: 320,
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 14,
    alignItems: 'center',
  },
  ctaBtn: {
    backgroundColor: '#1A2540',
    borderRadius: 8,
    paddingVertical: 17,
    alignItems: 'center',
    width: '100%',
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 13,
    color: '#4A5568',
    textAlign: 'center',
  },
});
