import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { PLANS, PRODUCT_PRICES } from '../../src/constants/plans';
import type { ProductItem } from '../../src/constants/plans';

// ─── Per-product benefit copy ──────────────────────────────────────────────
const PRODUCT_BENEFITS: Record<string, string> = {
  'Anti-Acne Face Wash':               'Clears excess oil and unclogs pores daily',
  'Pigmentation Serum':                'Fades dark spots and evens out skin tone',
  'Sunscreen SPF 50':                  'Protects against UV damage and prevents further tanning',
  'Clindamycin / Adapalene Gel':       'Kills acne-causing bacteria and prevents new breakouts',
  'Tretinoin Night Cream':             'Accelerates skin renewal and clears chronic acne overnight',
  'Hydroquinone / Azelaic Acid Cream': 'Targets stubborn pigmentation and reverses sun damage',
};

// ─── Doctor-style introductory paragraph per plan ─────────────────────────
const DOCTOR_TEXT: Record<number, string> = {
  1: 'Based on your skin assessment, we have put together a targeted plan to treat your active breakouts and stop new ones from forming. This plan pairs daily cleansing care with a prescription antibacterial-retinoid gel for the best results.',
  2: 'Your assessment shows active acne alongside post-inflammatory pigmentation. This plan treats both concerns simultaneously, clearing breakouts while fading marks with a prescription combination gel and a brightening serum.',
  3: 'Your assessment indicates persistent or frequent acne that requires a stronger clinical approach. This intensive plan uses prescription-strength Tretinoin to accelerate skin cell renewal and clear deep-seated acne overnight.',
  4: 'Your skin has both chronic acne and significant pigmentation. This complete correction plan combines prescription-strength Tretinoin with a daily brightening serum to clear breakouts and even your skin tone at the same time.',
  5: 'Your assessment shows stubborn dark spots and uneven pigmentation. This plan uses a prescription brightening cream paired with a daily serum and UV protection to reverse pigmentation at the source and prevent it returning.',
  6: 'Your assessment shows sun-induced tanning and uneven patches that need targeted treatment. This plan uses a prescription brightening formula with daily sunscreen to reset your skin tone and prevent further UV damage.',
};

// ─── Product card (Fix 4: price added) ────────────────────────────────────
function ProductCard({ product }: { product: ProductItem }) {
  const isRx    = product.type === 'rx';
  const benefit = PRODUCT_BENEFITS[product.name] ?? '';
  const price   = PRODUCT_PRICES[product.name] ?? '';

  return (
    <View style={[styles.productCard, isRx && styles.productCardRx]}>
      <View style={styles.productCardBody}>
        {/* Name row with price on the right */}
        <View style={styles.productNameRow}>
          <Text style={styles.productName}>{product.name}</Text>
          {price ? <Text style={styles.productPrice}>{price}</Text> : null}
        </View>
        <Text style={styles.productBenefit}>{benefit}</Text>
      </View>
      {isRx && (
        <View style={styles.rxBadgeGroup}>
          <Text style={styles.lockIcon}>🔒</Text>
          <View style={styles.rxBadge}>
            <Text style={styles.rxBadgeText}>Rx</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function PlanResultScreen() {
  const { profile, reset } = useAssessmentStore();
  const { plan_id, derm_flag } = profile;
  const plan       = plan_id ? PLANS[plan_id] : null;
  const doctorText = plan_id ? DOCTOR_TEXT[plan_id] : '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Dark navy header ── */}
        <View style={styles.header}>
          <Text style={styles.brandMark}>MAN MATTERS</Text>
          <Text style={styles.headerEyebrow}>Your personalised skin plan</Text>
          {plan && (
            <>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.doctorText}>{doctorText}</Text>
            </>
          )}
        </View>

        {/* ── Derm flag ── */}
        {derm_flag && (
          <View style={styles.dermBox}>
            <Text style={styles.dermIcon}>⚠</Text>
            <Text style={styles.dermText}>
              Your acne type indicates you should consult a dermatologist
              alongside this plan. Our skin coach can help connect you.
            </Text>
          </View>
        )}

        {/* ── Products ── */}
        {plan ? (
          <View style={styles.productsSection}>
            <Text style={styles.sectionHeading}>What's in your plan</Text>

            {plan.products.map(p => (
              <ProductCard key={p.name} product={p} />
            ))}

            <View style={styles.rxNote}>
              <Text style={styles.rxNoteText}>
                🔒 Rx products are prescription-only and reviewed by a Man
                Matters skin coach before dispensing.{' '}
                <Text style={styles.rxNoteBold}>
                  Human review required before clinical use.
                </Text>
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.errorText}>
            Plan could not be determined. Please retake the assessment.
          </Text>
        )}

        {/* ── Fix 6: Results timeline card ── */}
        <View style={styles.timelineCard}>
          <View style={styles.timelineRow}>
            <Text style={styles.timelineIcon}>📅</Text>
            <Text style={styles.timelineText}>
              Follow this plan consistently for 3 months to see full results.
            </Text>
          </View>
          <View style={styles.timelineDivider} />
          <View style={styles.timelineRow}>
            <Text style={styles.timelineIcon}>⏱</Text>
            <Text style={styles.timelineText}>
              Most users notice visible improvement within 2 weeks of consistent use.
            </Text>
          </View>
        </View>

        {/* ── Fix 5: Two CTA buttons side by side ── */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaDerm} activeOpacity={0.85}>
            <Text style={styles.ctaDermText}>Talk to a{'\n'}Dermatologist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaBuy} activeOpacity={0.85}>
            <Text style={styles.ctaBuyText}>Buy Now</Text>
          </TouchableOpacity>
        </View>

        {/* Start over (tertiary) */}
        <TouchableOpacity
          style={styles.startOver}
          onPress={() => { reset(); router.replace('/'); }}
          activeOpacity={0.7}
        >
          <Text style={styles.startOverText}>Start over</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F6' },
  content: { gap: 0, paddingBottom: 32 },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    backgroundColor: '#1A2540',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    gap: 8,
  },
  brandMark: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 3,
    marginBottom: 4,
  },
  headerEyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  planName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 36,
  },
  doctorText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 22,
    marginTop: 4,
  },

  // ── Derm warning ────────────────────────────────────────────────────────
  dermBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  dermIcon: { fontSize: 16, color: '#D97706', marginTop: 1 },
  dermText: { flex: 1, fontSize: 14, color: '#92400E', lineHeight: 21 },

  // ── Products ────────────────────────────────────────────────────────────
  productsSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  productCardRx: {
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  productCardBody: { flex: 1, gap: 4 },
  // Fix 4: name row holds name + price
  productNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  productBenefit: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
  },
  rxBadgeGroup: { alignItems: 'center', gap: 4 },
  lockIcon: { fontSize: 13 },
  rxBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rxBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rxNote: {
    backgroundColor: '#F0F0F5',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  rxNoteText: { fontSize: 12, color: '#777', lineHeight: 18 },
  rxNoteBold: { fontWeight: '700', color: '#555' },

  // ── Fix 6: Timeline card ─────────────────────────────────────────────────
  timelineCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  timelineIcon: { fontSize: 18, marginTop: 1 },
  timelineText: {
    flex: 1,
    fontSize: 14,
    color: '#78350F',
    lineHeight: 21,
  },
  timelineDivider: {
    height: 1,
    backgroundColor: '#FDE68A',
  },

  // ── Fix 5: Two CTA buttons ───────────────────────────────────────────────
  ctaRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  ctaDerm: {
    flex: 1,
    backgroundColor: '#1A2540',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  ctaDermText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaBuy: {
    flex: 1,
    backgroundColor: '#E07B54',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBuyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ── Start over (tertiary text button) ────────────────────────────────────
  startOver: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
  },
  startOverText: {
    fontSize: 14,
    color: '#AAA',
  },

  errorText: { fontSize: 16, color: '#EF4444', padding: 24 },
});
