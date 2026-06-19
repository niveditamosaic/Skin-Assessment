/**
 * Shared chrome for every questionnaire screen.
 *
 * Renders:
 *   - Header: "man matters" wordmark (left) + ✕ close (right)
 *   - Thin navy progress bar
 *   - Scrollable body (children)
 *   - Pinned bottom button row: Back (outline) + Next (solid navy)
 *
 * The ✕ icon navigates to the welcome screen without resetting state.
 * Pass onBack={undefined} to hide the Back button (e.g. first screen).
 * Pass onNext={undefined} to hide the Next button entirely.
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ProgressBar } from './ProgressBar';
import { PrimaryButton } from './PrimaryButton';
import { OutlineButton } from './OutlineButton';

interface Props {
  step: number;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  children: React.ReactNode;
}

export function QuestionShell({
  step,
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  children,
}: Props) {
  return (
    <SafeAreaView style={s.root}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Image
          source={require('../../assets/images/mm-logo.png')}
          style={s.logo}
          accessibilityLabel="Man Matters"
        />
        <TouchableOpacity
          style={s.closeBtn}
          onPress={() => router.replace('/')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={s.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* ── Progress bar ── */}
      <ProgressBar currentStep={step} />

      {/* ── Scrollable content + pinned buttons ── */}
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {/* ── Bottom buttons ── */}
        {(onBack || onNext) && (
          <View style={s.buttonRow}>
            {onBack ? (
              <OutlineButton onPress={onBack} />
            ) : (
              <View style={s.flex} />
            )}
            {onNext && (
              <PrimaryButton
                label={nextLabel}
                onPress={onNext}
                disabled={nextDisabled}
              />
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
  },
  logo: {
    width: 180,
    height: 56,
    resizeMode: 'contain',
    alignSelf: 'flex-start',
  },
  closeBtn: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 18,
    color: '#1A2540',
    fontWeight: '600',
  },

  scrollContent: {
    paddingTop: 28,
    paddingBottom: 24,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
});
