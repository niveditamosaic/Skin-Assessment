import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { PrimaryButton } from '../../src/components/PrimaryButton';

const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian mobile: starts with 6–9, 10 digits

export default function Q1DetailsScreen() {
  const { profile, setBasicDetails } = useAssessmentStore();

  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [phone, setPhone] = useState(profile.phone);
  const [errors, setErrors] = useState({ name: '', age: '', phone: '' });

  const validate = () => {
    const next = { name: '', age: '', phone: '' };
    let valid = true;

    if (!name.trim()) {
      next.name = 'Please enter your name';
      valid = false;
    }

    const ageNum = parseInt(age, 10);
    if (!age.trim() || isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      next.age = 'Please enter a valid age';
      valid = false;
    }

    if (!PHONE_REGEX.test(phone)) {
      next.phone = 'Please enter a valid 10-digit Indian mobile number';
      valid = false;
    }

    setErrors(next);
    return valid;
  };

  const handleContinue = () => {
    if (!validate()) return;
    setBasicDetails(name.trim(), age.trim(), phone.trim());
    router.push('/assessment/q2-skin-type');
  };

  const allFilled =
    name.trim().length > 0 && age.trim().length > 0 && phone.trim().length === 10;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.question}>Please share your basic details</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              value={name}
              onChangeText={v => {
                setName(v);
                if (errors.name) setErrors(e => ({ ...e, name: '' }));
              }}
              placeholder="Enter your full name"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="words"
              returnKeyType="next"
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={[styles.input, errors.age ? styles.inputError : null]}
              value={age}
              onChangeText={v => {
                setAge(v.replace(/[^0-9]/g, ''));
                if (errors.age) setErrors(e => ({ ...e, age: '' }));
              }}
              placeholder="Enter your age"
              placeholderTextColor="#AAAAAA"
              keyboardType="number-pad"
              maxLength={3}
              returnKeyType="next"
            />
            {errors.age ? (
              <Text style={styles.errorText}>{errors.age}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={[styles.phoneRow, errors.phone ? styles.inputError : null]}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={v => {
                  setPhone(v.replace(/[^0-9]/g, ''));
                  if (errors.phone) setErrors(e => ({ ...e, phone: '' }));
                }}
                placeholder="10-digit mobile number"
                placeholderTextColor="#AAAAAA"
                keyboardType="number-pad"
                maxLength={10}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone}</Text>
            ) : null}
          </View>
        </ScrollView>

        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          disabled={!allFilled}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 28,
    lineHeight: 30,
  },
  field: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  inputError: { borderColor: '#E53E3E' },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
  },
  countryCode: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
    marginRight: 8,
    paddingVertical: 14,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    paddingVertical: 14,
  },
  errorText: { fontSize: 12, color: '#E53E3E', marginTop: 4 },
});
