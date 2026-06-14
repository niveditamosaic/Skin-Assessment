import { supabase } from './supabase';
import type { AssessmentProfile } from '../types/assessment';
import { PLANS } from '../constants/plans';

// Mask phone number — store only last 4 digits, prefix with X's.
// Input '9876541234' → 'XXXXXX1234'. Handles any length ≥ 4.
function maskPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 4) return 'XXXXXXXX';
  return 'X'.repeat(digits.length - 4) + digits.slice(-4);
}

export async function saveAssessment(profile: AssessmentProfile): Promise<void> {
  console.log('[saveAssessment] called — plan_id:', profile.plan_id);

  if (!profile.plan_id) {
    console.warn('[saveAssessment] aborted — plan_id is null, assessment incomplete');
    return;
  }

  const planName = PLANS[profile.plan_id]?.name ?? '';

  const payload = {
    name:       profile.name,
    age:        parseInt(profile.age, 10) || null,
    phone:      maskPhone(profile.phone),
    skin_type:  profile.skin_type,
    concerns:   profile.concerns.join(','),
    acne_type:  profile.acne_type,
    severity:   profile.severity,
    plan_id:    profile.plan_id,
    plan_name:  planName,
    derm_flag:  profile.derm_flag,
  };

  console.log('[saveAssessment] inserting payload:', JSON.stringify(payload, null, 2));

  const { data, error } = await supabase.from('assessments').insert(payload).select();

  if (error) {
    console.error('[saveAssessment] INSERT FAILED');
    console.error('  code   :', error.code);
    console.error('  message:', error.message);
    console.error('  details:', error.details);
    console.error('  hint   :', error.hint);
    console.error('  Full error object:', JSON.stringify(error, null, 2));
  } else {
    console.log('[saveAssessment] INSERT SUCCESS — row saved:', JSON.stringify(data, null, 2));
  }
}
