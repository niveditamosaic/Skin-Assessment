import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { QuestionShell } from '../../src/components/QuestionShell';

const PHONE_REGEX = /^[6-9]\d{9}$/;

export default function Q1DetailsScreen() {
  const { profile, setBasicDetails } = useAssessmentStore();

  const [name, setName]   = useState(profile.name);
  const [age, setAge]     = useState(profile.age);
  const [phone, setPhone] = useState(profile.phone);
  const [errors, setErrors] = useState({ name: '', age: '', phone: '' });

  const validate = () => {
    const next = { name: '', age: '', phone: '' };
    let valid = true;
    if (!name.trim()) { next.name = 'Please enter your name'; valid = false; }
    const ageNum = parseInt(age, 10);
    if (!age.trim() || isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      next.age = 'Please enter a valid age'; valid = false;
    }
    if (!PHONE_REGEX.test(phone)) {
      next.phone = 'Please enter a valid 10-digit Indian mobile number'; valid = false;
    }
    setErrors(next);
    return valid;
  };

  const handleNext = () => {
    if (!validate()) return;
    setBasicDetails(name.trim(), age.trim(), phone.trim());
    router.push('/assessment/q2-skin-type');
  };

  const allFilled =
    name.trim().length > 0 &&
    age.trim().length > 0 &&
    phone.trim().length === 10;

  return (
    <QuestionShell
      step={1}
      onBack={() => router.replace('/')}
      onNext={handleNext}
      nextLabel="Continue"
      nextDisabled={!allFilled}
    >
      <Text style={s.heading}>Tell us a little{'\n'}about yourself</Text>

      <View style={s.fields}>
        <View style={s.field}>
          <Text style={s.label}>Full Name</Text>
          <TextInput
            style={[s.input, errors.name ? s.inputError : null]}
            value={name}
            onChangeText={v => { setName(v); if (errors.name) setErrors(e => ({ ...e, name: '' })); }}
            placeholder="Enter your full name"
            placeholderTextColor="#AAAAAA"
            autoCapitalize="words"
            returnKeyType="next"
          />
          {errors.name ? <Text style={s.errorText}>{errors.name}</Text> : null}
        </View>

        <View style={s.field}>
          <Text style={s.label}>Age</Text>
          <TextInput
            style={[s.input, errors.age ? s.inputError : null]}
            value={age}
            onChangeText={v => { setAge(v.replace(/[^0-9]/g, '')); if (errors.age) setErrors(e => ({ ...e, age: '' })); }}
            placeholder="Enter your age"
            placeholderTextColor="#AAAAAA"
            keyboardType="number-pad"
            maxLength={3}
            returnKeyType="next"
          />
          {errors.age ? <Text style={s.errorText}>{errors.age}</Text> : null}
        </View>

        <View style={s.field}>
          <Text style={s.label}>Phone Number</Text>
          <View style={[s.phoneRow, errors.phone ? s.inputError : null]}>
            <Text style={s.countryCode}>+91</Text>
            <TextInput
              style={s.phoneInput}
              value={phone}
              onChangeText={v => { setPhone(v.replace(/[^0-9]/g, '')); if (errors.phone) setErrors(e => ({ ...e, phone: '' })); }}
              placeholder="10-digit mobile number"
              placeholderTextColor="#AAAAAA"
              keyboardType="number-pad"
              maxLength={10}
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />
          </View>
          {errors.phone ? <Text style={s.errorText}>{errors.phone}</Text> : null}
        </View>
      </View>
    </QuestionShell>
  );
}

const s = StyleSheet.create({
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A2540',
    lineHeight: 34,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  fields: { paddingHorizontal: 24, gap: 20 },
  field: {},
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C6B80',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A2540',
    backgroundColor: '#FFFFFF',
  },
  inputError: { borderColor: '#E53E3E' },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  countryCode: {
    fontSize: 16,
    color: '#1A2540',
    fontWeight: '600',
    marginRight: 8,
    paddingVertical: 14,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A2540',
    paddingVertical: 14,
  },
  errorText: { fontSize: 12, color: '#E53E3E', marginTop: 4 },
});
