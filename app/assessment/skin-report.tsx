import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import type { Concern } from '../../src/types/assessment';
import { PLANS, PRODUCT_PRICES } from '../../src/constants/plans';
import type { ProductItem } from '../../src/constants/plans';
import { saveAssessment } from '../../src/lib/saveAssessment';
import { detectFaceZones } from '../../src/lib/faceMesh';
import type { FaceZonePositions } from '../../src/lib/faceMesh';

// ─── Concern dot markers ───────────────────────────────────────────────────
// Positions are fractions of the photo's width/height.
// Assumes a roughly centred close-up portrait — Phase 2 will replace these
// with coordinates derived from the real face-detection bounding box.
const MARKERS: Record<string, { x: number; y: number }[]> = {
  acne: [
    { x: 0.50, y: 0.24 }, // forehead centre
    { x: 0.30, y: 0.57 }, // left cheek
    { x: 0.70, y: 0.57 }, // right cheek
    { x: 0.50, y: 0.49 }, // nose
    { x: 0.50, y: 0.74 }, // chin
  ],
  dark_spots: [
    { x: 0.29, y: 0.56 }, // left cheek
    { x: 0.71, y: 0.56 }, // right cheek
    { x: 0.34, y: 0.44 }, // under-eye left
    { x: 0.66, y: 0.44 }, // under-eye right
  ],
  tanning: [
    { x: 0.37, y: 0.22 }, // forehead left
    { x: 0.63, y: 0.22 }, // forehead right
    { x: 0.50, y: 0.43 }, // nose bridge
  ],
};

const MARKER_COLORS: Record<string, string> = {
  acne: '#EF4444',
  dark_spots: '#D97706',
  tanning: '#CA8A04',
};

const MARKER_SIZE = 10;

// Maps each concern to the face zone keys from FaceZonePositions that should
// receive a dot marker when MediaPipe landmarks are available.
const CONCERN_ZONES: Record<string, (keyof FaceZonePositions)[]> = {
  acne:       ['forehead', 'left_cheek', 'right_cheek', 'nose', 'chin'],
  dark_spots: ['left_cheek', 'right_cheek', 'left_under_eye', 'right_under_eye'],
  tanning:    ['forehead', 'nose', 'left_temple', 'right_temple'],
};

// ─── Product copy ──────────────────────────────────────────────────────────
const PRODUCT_BENEFITS: Record<string, string> = {
  'Anti-Acne Face Wash':               'Clears excess oil and unclogs pores daily',
  'Pigmentation Serum':                'Fades dark spots and evens out skin tone',
  'Sunscreen SPF 50':                  'Protects against UV damage and prevents further tanning',
  'Clindamycin / Adapalene Gel':       'Kills acne-causing bacteria and prevents new breakouts',
  'Tretinoin Night Cream':             'Accelerates skin renewal and clears chronic acne overnight',
  'Hydroquinone / Azelaic Acid Cream': 'Targets stubborn pigmentation and reverses sun damage',
};

const PRODUCT_INGREDIENTS: Record<string, string[]> = {
  'Anti-Acne Face Wash':               ['Salicylic Acid', 'Niacinamide', 'Tea Tree'],
  'Pigmentation Serum':                ['Kojic Acid', 'Vitamin C', 'Alpha Arbutin'],
  'Sunscreen SPF 50':                  ['Zinc Oxide', 'Niacinamide', 'Hyaluronic Acid'],
  'Clindamycin / Adapalene Gel':       ['Adapalene 0.1%', 'Clindamycin 1%', 'Allantoin'],
  'Tretinoin Night Cream':             ['Tretinoin 0.05%', 'Squalane', 'Ceramides'],
  'Hydroquinone / Azelaic Acid Cream': ['Azelaic Acid 10%', 'Kojic Acid', 'Allantoin'],
};

// ─── Cause analysis copy (per plan) ───────────────────────────────────────
const CAUSE_ANALYSIS: Record<number, string> = {
  1: 'Your skin is producing excess sebum which is blocking pores and causing breakouts. This is commonly triggered by hormonal fluctuations, stress, or diet. Your skin type makes you more prone to congestion, especially in the T-zone. The good news — mild acne responds very well to the right topical routine.',
  2: 'Your skin is dealing with two connected issues — active breakouts and the pigmentation marks they leave behind. Each new pimple triggers inflammation that deposits excess melanin in the skin. Hormonal shifts and sun exposure amplify both concerns. Treating acne and pigmentation simultaneously is the only way to break this cycle.',
  3: 'Your skin is experiencing a persistent inflammatory response that keeps producing new breakouts despite your efforts. This typically involves overactive sebaceous glands, bacterial overgrowth, and chronically clogged follicles. Stress hormones and dietary triggers may be accelerating the cycle. Prescription-strength Tretinoin is the clinically proven way to reset this pattern.',
  4: 'Your skin faces a chronic cycle of deep inflammation producing active breakouts and simultaneously depositing stubborn pigmentation. Hormonal androgens are likely driving excess sebum production, while post-inflammatory hyperpigmentation deepens with every new breakout. Sun exposure without protection accelerates both. This requires a dual prescription approach — targeting the root cause and the visible damage at the same time.',
  5: 'Your skin is overproducing melanin in targeted areas, most likely triggered by past sun exposure, prior inflammation, or hormonal changes. When melanocytes are stimulated — by UV rays, heat, or old acne — they deposit dark pigment unevenly across the skin. Without a dedicated brightening routine these marks deepen over time. Consistent treatment and daily SPF are the two most critical steps to reversing this.',
  6: 'Your skin tone has been unevenly altered by cumulative sun exposure, which has darkened melanin across both the surface and deeper dermal layers. UV radiation triggers melanocytes to overproduce pigment as a protective response, but the results are patchy and persistent. Your skin\'s natural renewal cycle is too slow to reverse this on its own. A targeted brightening formula paired with daily SPF is the fastest clinical route to an even tone.',
};

// ─── Results timeline (per plan) ──────────────────────────────────────────
interface TimelinePhase {
  period: string;
  phase: string;
  bullets: string[];
  accentColor: string;
}

const TIMELINE: Record<number, TimelinePhase[]> = {
  1: [
    { period: 'Month 1–2',  phase: 'RESET PHASE',       accentColor: '#EF4444', bullets: ['Breakouts reduce in frequency', 'Skin feels less oily and congested'] },
    { period: 'Month 3–4',  phase: 'REPAIR PHASE',      accentColor: '#F97316', bullets: ['Pores begin to clear, fewer new pimples forming', 'Skin tone starts to even out'] },
    { period: 'Month 5–6',  phase: 'RENEW PHASE',       accentColor: '#22C55E', bullets: ['Skin texture improves noticeably', 'Old marks begin to fade'] },
    { period: 'Ongoing',    phase: 'PLAN FOR LIFE',     accentColor: '#1A2540', bullets: ['Clear, balanced skin maintained with a simple consistent routine'] },
  ],
  2: [
    { period: 'Month 1–2',  phase: 'RESET PHASE',       accentColor: '#EF4444', bullets: ['Active breakouts reduce, inflammation calms', 'Dark marks stop deepening with daily SPF'] },
    { period: 'Month 3–4',  phase: 'REPAIR PHASE',      accentColor: '#F97316', bullets: ['New breakouts become rare', 'Existing dark marks begin to lighten visibly'] },
    { period: 'Month 5–6',  phase: 'RENEW PHASE',       accentColor: '#22C55E', bullets: ['Skin tone evens out across the face', 'Texture improves and complexion brightens'] },
    { period: 'Ongoing',    phase: 'PLAN FOR LIFE',     accentColor: '#1A2540', bullets: ['Clear skin with a brightening maintenance routine and daily SPF'] },
  ],
  3: [
    { period: 'Month 1–2',  phase: 'RESET PHASE',       accentColor: '#EF4444', bullets: ['Breakout frequency drops significantly', 'A purge phase may occur in weeks 2–3 as skin clears'] },
    { period: 'Month 3–4',  phase: 'REPAIR PHASE',      accentColor: '#F97316', bullets: ['Deep-clogged pores begin to clear', 'Skin feels less congested and inflamed'] },
    { period: 'Month 5–6',  phase: 'RENEW PHASE',       accentColor: '#22C55E', bullets: ['Skin texture smooths significantly', 'Old scarring begins to visibly remodel'] },
    { period: 'Ongoing',    phase: 'PLAN FOR LIFE',     accentColor: '#1A2540', bullets: ['Long-term clear skin maintained with a lower-dose prescription routine'] },
  ],
  4: [
    { period: 'Month 1–2',  phase: 'RESET PHASE',       accentColor: '#EF4444', bullets: ['Inflammatory breakouts reduce', 'Skin surface begins to stabilise'] },
    { period: 'Month 3–4',  phase: 'REPAIR PHASE',      accentColor: '#F97316', bullets: ['Dark marks begin to lift, active acne is minimal', 'Skin feels cleaner and less reactive'] },
    { period: 'Month 5–6',  phase: 'RENEW PHASE',       accentColor: '#22C55E', bullets: ['Skin tone evens, texture improves', 'Complexion visibly brightens'] },
    { period: 'Ongoing',    phase: 'PLAN FOR LIFE',     accentColor: '#1A2540', bullets: ['Balanced, clear skin — maintain with a lighter daily routine'] },
  ],
  5: [
    { period: 'Month 1–2',  phase: 'RESET PHASE',       accentColor: '#EF4444', bullets: ['Melanin production slows, new marks stop forming', 'Existing spots begin to lift at the surface'] },
    { period: 'Month 3–4',  phase: 'REPAIR PHASE',      accentColor: '#F97316', bullets: ['Dark spots lighten visibly — expect 30–50% improvement', 'Skin tone starts to unify'] },
    { period: 'Month 5–6',  phase: 'RENEW PHASE',       accentColor: '#22C55E', bullets: ['Skin tone evens out across the face', 'Post-acne dullness and uneven patches resolve'] },
    { period: 'Ongoing',    phase: 'PLAN FOR LIFE',     accentColor: '#1A2540', bullets: ['Consistent SPF and brightening serum prevent recurrence of pigmentation'] },
  ],
  6: [
    { period: 'Month 1–2',  phase: 'RESET PHASE',       accentColor: '#EF4444', bullets: ['Surface tan begins to lift within 3–4 weeks', 'Skin tone appears slightly more uniform'] },
    { period: 'Month 3–4',  phase: 'REPAIR PHASE',      accentColor: '#F97316', bullets: ['Deeper pigmentation lightens', 'Skin tone becomes noticeably more uniform'] },
    { period: 'Month 5–6',  phase: 'RENEW PHASE',       accentColor: '#22C55E', bullets: ['Significant tone evenness achieved', 'Post-tan dullness and patchy areas resolved'] },
    { period: 'Ongoing',    phase: 'PLAN FOR LIFE',     accentColor: '#1A2540', bullets: ['Daily SPF keeps UV-induced pigmentation from returning'] },
  ],
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatKeyConcern(concerns: Concern[]): string {
  const hasAcne = concerns.includes('acne');
  const hasDark = concerns.includes('dark_spots');
  const hasTan  = concerns.includes('tanning');
  if (hasAcne && hasDark && hasTan) return 'Acne, Pigmentation and Tanning';
  if (hasAcne && hasDark)           return 'Acne and Pigmentation';
  if (hasAcne && hasTan)            return 'Acne and Sun Damage';
  if (hasAcne)                      return 'Active Acne';
  if (hasDark && hasTan)            return 'Pigmentation and Tanning';
  if (hasDark)                      return 'Pigmentation and Dark Spots';
  if (hasTan)                       return 'Tanning and Sun Damage';
  return 'General Skin Health';
}

function formatSkinType(t: string | null): string {
  if (!t) return '—';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function calculatePlanTotal(planId: number): number {
  const plan = PLANS[planId];
  if (!plan) return 0;
  return plan.products.reduce((sum, p) => {
    const raw = PRODUCT_PRICES[p.name] ?? '₹0';
    return sum + (parseInt(raw.replace(/[^\d]/g, ''), 10) || 0);
  }, 0);
}

// ─── ProductCard ───────────────────────────────────────────────────────────
function ProductCard({ product }: { product: ProductItem }) {
  const isRx       = product.type === 'rx';
  const benefit    = PRODUCT_BENEFITS[product.name] ?? '';
  const price      = PRODUCT_PRICES[product.name] ?? '';
  const ingredients = PRODUCT_INGREDIENTS[product.name] ?? [];

  return (
    <View style={pStyles.card}>
      {isRx && (
        <View style={pStyles.rxBanner}>
          <Text style={pStyles.rxBannerText}>Rx  |  Prescription Formula</Text>
        </View>
      )}
      <View style={pStyles.body}>
        <View style={pStyles.imageBox}>
          <Text style={pStyles.imageBoxLabel}>📦</Text>
        </View>
        <View style={pStyles.info}>
          <View style={pStyles.nameRow}>
            <Text style={pStyles.name}>{product.name}</Text>
            <Text style={pStyles.price}>{price}</Text>
          </View>
          <Text style={pStyles.benefit}>{benefit}</Text>
          <View style={pStyles.tagRow}>
            {ingredients.map(ing => (
              <View key={ing} style={pStyles.tag}>
                <Text style={pStyles.tagText}>{ing}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Animation config ─────────────────────────────────────────────────────
// One animated slot per content section that fades in after detection.
// Indices: 0=summary, 1=cause, 2=plan, 3=timeline, 4=derm, 5=startOver+sticky
const SECTION_COUNT = 6;

function makeSectionAnim() {
  return { opacity: new Animated.Value(0), translateY: new Animated.Value(16) };
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function SkinReportScreen() {
  const { profile, capturedImageUri, reset } = useAssessmentStore();
  const { width } = useWindowDimensions();

  const photoW = Math.min(width - 32, 360);
  const photoH = photoW * 1.2;

  const plan      = profile.plan_id ? PLANS[profile.plan_id] : null;
  const timeline  = profile.plan_id ? TIMELINE[profile.plan_id] : [];
  const causeText = profile.plan_id ? CAUSE_ANALYSIS[profile.plan_id] : '';
  const planTotal = profile.plan_id ? calculatePlanTotal(profile.plan_id) : 0;
  const isSevere  = profile.severity === 'severe' || profile.derm_flag;

  console.log('[SkinReport] plan_id:', profile.plan_id, '| concerns:', JSON.stringify(profile.concerns));
  console.log('[SkinReport] products:', plan ? plan.products.map(p => p.name).join(', ') : 'none');

  // ── MediaPipe face zone detection ────────────────────────────────────────
  const [faceZones, setFaceZones]   = useState<FaceZonePositions | null>(null);
  // Always start in 'detecting' so the loading screen shows immediately.
  const [faceState, setFaceState]   = useState<'detecting' | 'done'>('detecting');
  const detectionSettled            = useRef(false);

  const settle = (zones: FaceZonePositions | null) => {
    if (detectionSettled.current) return;
    detectionSettled.current = true;
    setFaceZones(zones);
    setFaceState('done');
  };

  useEffect(() => {
    // Hard 15-second cap — never make the user wait longer than this.
    const cap = setTimeout(() => settle(null), 15_000);

    if (capturedImageUri) {
      detectFaceZones(capturedImageUri).then(zones => {
        clearTimeout(cap);
        settle(zones);
      });
    } else {
      // No photo: skip detection entirely, go straight to report.
      clearTimeout(cap);
      settle(null);
    }

    return () => clearTimeout(cap);
  }, []);

  // ── Stagger animation once detection finishes ─────────────────────────
  const anims = useRef(
    Array.from({ length: SECTION_COUNT }, makeSectionAnim)
  ).current;

  useEffect(() => {
    if (faceState !== 'done') return;
    Animated.stagger(
      110,
      anims.map(a =>
        Animated.parallel([
          Animated.timing(a.opacity,     { toValue: 1, duration: 380, useNativeDriver: true }),
          Animated.timing(a.translateY,  { toValue: 0, duration: 380, useNativeDriver: true }),
        ])
      )
    ).start();
  }, [faceState]);

  const animStyle = (i: number) => ({
    opacity:   anims[i].opacity,
    transform: [{ translateY: anims[i].translateY }],
  });

  // ── Save to Supabase once on mount ───────────────────────────────────
  const hasSaved = useRef(false);
  useEffect(() => {
    if (!hasSaved.current) {
      hasSaved.current = true;
      saveAssessment(profile);
    }
  }, []);

  // ── Marker helper ──────────────────────────────────────────────────────
  const renderMarkers = () =>
    profile.concerns.map(concern => {
      const color = MARKER_COLORS[concern];
      if (!color) return null;

      if (faceZones) {
        return (CONCERN_ZONES[concern] ?? []).map(zone => {
          const pos = faceZones[zone];
          if (!pos) return null;
          return (
            <View
              key={`${concern}-${zone}`}
              style={[s.marker, {
                left:            pos.x * photoW - MARKER_SIZE / 2,
                top:             pos.y * photoH - MARKER_SIZE / 2,
                backgroundColor: color,
              }]}
            />
          );
        });
      }

      return (MARKERS[concern] ?? []).map((pos, i) => (
        <View
          key={`${concern}-${i}`}
          style={[s.marker, {
            left:            pos.x * photoW - MARKER_SIZE / 2,
            top:             pos.y * photoH - MARKER_SIZE / 2,
            backgroundColor: color,
          }]}
        />
      ));
    });

  const isLoading = faceState === 'detecting';

  return (
    <SafeAreaView style={[s.root, isLoading && s.rootLoading]}>

      <ScrollView
        contentContainerStyle={[s.scroll, isLoading && s.scrollLoading]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Nav bar — always visible ── */}
        <View style={[s.navBar, isLoading && s.navBarLoading]}>
          <Image
            source={require('../../assets/images/mm-logo-white.png')}
            style={{ width: 140, height: 44, resizeMode: 'contain', marginBottom: 4 }}
            accessibilityLabel="Man Matters"
          />
          <Text style={s.navTitle}>Skin Assessment Report</Text>
        </View>

        {/* ── Photo ── */}
        <View style={[s.photoWrap, { width: photoW, height: photoH }]}>
          {capturedImageUri ? (
            <Image source={{ uri: capturedImageUri }} style={s.photo} resizeMode="cover" />
          ) : (
            <View style={s.photoPlaceholder}>
              <Text style={s.photoPlaceholderIcon}>📷</Text>
              <Text style={s.photoPlaceholderText}>Photo not available</Text>
            </View>
          )}

          {/* Loading overlay — sits over photo while detecting */}
          {isLoading && (
            <View style={s.analysisOverlay}>
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginBottom: 10 }} />
            </View>
          )}

          {/* Concern markers — shown only after detection finishes */}
          {!isLoading && renderMarkers()}
        </View>

        {/* Loading caption below photo */}
        {isLoading && (
          <View style={s.loadingCaption}>
            <Text style={s.loadingTitle}>Analysing your skin...</Text>
            <Text style={s.loadingSubtitle}>This usually takes a few seconds</Text>
          </View>
        )}

        {/* ════════════════════════════════════════════════════
            Sections — animated in after detection
        ════════════════════════════════════════════════════ */}

        {/* 0 — Key Concern summary card */}
        <Animated.View style={[{ width: '100%' }, animStyle(0)]}>
          <View style={s.summaryCard}>
            <View style={s.summaryRow}>
              <View style={s.summaryField}>
                <Text style={s.summaryLabel}>KEY CONCERN</Text>
                <Text style={s.summaryValue}>{formatKeyConcern(profile.concerns)}</Text>
              </View>
              <View style={s.summaryField}>
                <Text style={s.summaryLabel}>SKIN TYPE</Text>
                <Text style={s.summaryValue}>{formatSkinType(profile.skin_type)}</Text>
              </View>
              <View style={s.summaryField}>
                <Text style={s.summaryLabel}>SEVERITY</Text>
                <View style={[s.severityBadge, isSevere ? s.severeBadge : s.mildBadge]}>
                  <Text style={[s.severityBadgeText, isSevere ? s.severeBadgeText : s.mildBadgeText]}>
                    {isSevere ? 'Severe' : 'Mild'}
                  </Text>
                </View>
              </View>
            </View>
            {isSevere && (
              <TouchableOpacity style={s.dermCta} activeOpacity={0.85}>
                <Text style={s.dermCtaText}>🩺  Consult a Dermatologist for Free</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* 1 — Cause Analysis */}
        <Animated.View style={[{ width: '100%' }, animStyle(1)]}>
          <View style={s.section}>
            <Text style={s.eyebrow}>SKIN ANALYSIS</Text>
            <Text style={s.sectionHeading}>What's causing this?</Text>
            <Text style={s.causeText}>{causeText}</Text>
          </View>
        </Animated.View>

        {/* 2 — Treatment Plan */}
        <Animated.View style={[{ width: '100%' }, animStyle(2)]}>
          <View style={s.section}>
            <Text style={s.eyebrow}>YOUR PRESCRIPTION</Text>
            <Text style={s.sectionHeading}>Your treatment plan — crafted for your skin</Text>
            <Text style={s.sectionSubheading}>
              Recommended by a dermatologist based on your skin analysis.
            </Text>
            {plan ? plan.products.map(p => <ProductCard key={p.name} product={p} />) : null}
          </View>
        </Animated.View>

        {/* 3 — Results Timeline */}
        <Animated.View style={[{ width: '100%' }, animStyle(3)]}>
          <View style={s.section}>
            <Text style={s.eyebrow}>WHAT TO EXPECT</Text>
            <Text style={s.sectionHeading}>See results in 3 months</Text>
            {timeline.map((phase, idx) => {
              const isLast = idx === timeline.length - 1;
              return (
                <View key={phase.phase} style={tStyles.row}>
                  <View style={tStyles.rail}>
                    <View style={[tStyles.node, { backgroundColor: phase.accentColor }]} />
                    {!isLast && <View style={tStyles.connector} />}
                  </View>
                  <View style={[tStyles.content, isLast && tStyles.contentLast]}>
                    <Text style={[tStyles.period, { color: phase.accentColor }]}>{phase.period}</Text>
                    <Text style={tStyles.phase}>{phase.phase}</Text>
                    {phase.bullets.map(b => (
                      <Text key={b} style={tStyles.bullet}>· {b}</Text>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* 4 — Derm Banner */}
        <Animated.View style={[{ width: '100%' }, animStyle(4)]}>
          <View style={s.dermBanner}>
            <View style={s.dermAvatarBox}>
              <Text style={s.dermAvatarIcon}>👨‍⚕️</Text>
            </View>
            <Text style={s.dermBannerHeading}>
              Not sure about your plan?{'\n'}Talk to one of our dermatologists.
            </Text>
            <Text style={s.dermBannerSub}>
              All our dermatologists are MBBS / MD qualified with 10+ years of clinical experience.
            </Text>
            <TouchableOpacity style={s.dermBannerBtn} activeOpacity={0.85}>
              <Text style={s.dermBannerBtnText}>Book a Free Consultation</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* 5 — Start over */}
        <Animated.View style={animStyle(5)}>
          <TouchableOpacity
            style={s.startOver}
            onPress={() => { reset(); router.replace('/'); }}
            activeOpacity={0.7}
          >
            <Text style={s.startOverText}>Start over</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      {/* ── Sticky Add to Cart — hidden during loading ── */}
      {!isLoading && (
        <Animated.View style={[s.stickyBar, animStyle(5)]}>
          <TouchableOpacity style={s.stickyBtn} activeOpacity={0.9}>
            <Text style={s.stickyBtnText}>
              Add plan to cart — ₹{planTotal.toLocaleString('en-IN')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

    </SafeAreaView>
  );
}

// ─── Product card styles ───────────────────────────────────────────────────
const pStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  rxBanner: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  rxBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  body: {
    flexDirection: 'row',
    padding: 14,
    gap: 14,
    alignItems: 'flex-start',
  },
  imageBox: {
    width: 72,
    height: 80,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  imageBoxLabel: { fontSize: 28 },
  info: { flex: 1, gap: 6 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2540',
    flex: 1,
    lineHeight: 20,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2540',
    flexShrink: 0,
  },
  benefit: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
});

// ─── Timeline styles ───────────────────────────────────────────────────────
const tStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  rail: {
    width: 20,
    alignItems: 'center',
  },
  node: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 2,
    flexShrink: 0,
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    minHeight: 24,
    marginTop: 4,
    marginBottom: 0,
  },
  content: {
    flex: 1,
    paddingBottom: 28,
    gap: 4,
  },
  contentLast: {
    paddingBottom: 0,
  },
  period: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  phase: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A2540',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bullet: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
});

// ─── Screen styles ─────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FB' },
  rootLoading: { backgroundColor: '#1A2540' },
  scroll: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  scrollLoading: {
    // Centre the photo vertically during loading — no bottom padding needed
    paddingBottom: 0,
  },

  // Nav bar
  navBar: {
    width: '100%',
    backgroundColor: '#1A2540',
    paddingTop: 18,
    paddingBottom: 20,
    paddingHorizontal: 24,
    gap: 4,
    alignItems: 'center',
    marginBottom: 20,
  },
  navBarLoading: {
    // Seamless with the dark page — remove bottom separator gap
    marginBottom: 12,
  },
  navBrand: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 3,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Photo
  photoWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#CBD5E1',
    position: 'relative',
    marginHorizontal: 16,
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoPlaceholderIcon: { fontSize: 36 },
  photoPlaceholderText: { fontSize: 14, color: '#94A3B8' },
  marker: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    opacity: 0.9,
  },

  // Overlay that sits on top of the photo while MediaPipe is running
  analysisOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(26,37,64,0.55)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },

  // Caption below photo during loading
  loadingCaption: {
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  loadingTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  loadingSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '400',
  },

  // Summary card
  summaryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 16,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryField: { flex: 1, gap: 6 },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A2540',
    lineHeight: 18,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  severeBadge:     { backgroundColor: '#FEE2E2' },
  mildBadge:       { backgroundColor: '#DCFCE7' },
  severityBadgeText: { fontSize: 12, fontWeight: '700' },
  severeBadgeText: { color: '#DC2626' },
  mildBadgeText:   { color: '#16A34A' },
  dermCta: {
    backgroundColor: '#22C55E',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  dermCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Sections
  section: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2540',
    lineHeight: 27,
    marginTop: -4,
  },
  sectionSubheading: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginTop: -4,
  },
  causeText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  },

  // Derm banner
  dermBanner: {
    width: '100%',
    backgroundColor: '#EFF6FF',
    borderTopWidth: 3,
    borderTopColor: '#1A2540',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  },
  dermAvatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dermAvatarIcon: { fontSize: 30 },
  dermBannerHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2540',
    textAlign: 'center',
    lineHeight: 26,
  },
  dermBannerSub: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
  dermBannerBtn: {
    backgroundColor: '#1A2540',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 4,
  },
  dermBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Start over
  startOver: {
    paddingVertical: 20,
  },
  startOverText: {
    fontSize: 14,
    color: '#94A3B8',
  },

  // Sticky CTA
  stickyBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  stickyBtn: {
    backgroundColor: '#1A2540',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  stickyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
