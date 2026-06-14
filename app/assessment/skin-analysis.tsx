import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import type { AssessmentProfile, Concern } from '../../src/types/assessment';
import { PrimaryButton } from '../../src/components/PrimaryButton';

// ─── Zone colour palette ────────────────────────────────────────────────────
const ZONE_COLORS = {
  acne:       { bg: '#FEE2E2', border: '#F87171', text: '#DC2626' },
  dark_spots: { bg: '#FEF3C7', border: '#FBBF24', text: '#92400E' },
  tanning:    { bg: '#FEF9C3', border: '#FDE047', text: '#78350F' },
  none:       { bg: '#F3F4F6', border: '#E5E7EB', text: '#9CA3AF' },
} as const;

// Each zone lists which concerns activate it, in priority order (first match wins).
const ZONE_CONCERN_MAP: Record<string, Concern[]> = {
  forehead:    ['acne', 'tanning'],
  left_cheek:  ['acne', 'dark_spots', 'tanning'],
  right_cheek: ['acne', 'dark_spots', 'tanning'],
  nose:        ['acne', 'tanning'],
  chin:        ['acne'],
  under_eyes:  ['dark_spots'],
};

function zoneColor(zoneId: string, active: Concern[]) {
  const match = (ZONE_CONCERN_MAP[zoneId] ?? []).find(c => active.includes(c));
  return ZONE_COLORS[match ?? 'none'];
}

// ─── Face Zone Map ─────────────────────────────────────────────────────────
// A clinical dermatology-style zone diagram. Five labelled zones are coloured
// based on which concerns were detected. No overlay on the photo.
function FaceZoneMap({ concerns }: { concerns: Concern[] }) {
  const fh = zoneColor('forehead',    concerns);
  const lc = zoneColor('left_cheek',  concerns);
  const rc = zoneColor('right_cheek', concerns);
  const ns = zoneColor('nose',        concerns);
  const ch = zoneColor('chin',        concerns);
  const ue = zoneColor('under_eyes',  concerns);

  const activeLegendItems: { label: string; color: string }[] = [];
  if (concerns.includes('acne'))
    activeLegendItems.push({ label: 'Acne / breakout zones', color: ZONE_COLORS.acne.border });
  if (concerns.includes('dark_spots'))
    activeLegendItems.push({ label: 'Pigmentation zones', color: ZONE_COLORS.dark_spots.border });
  if (concerns.includes('tanning'))
    activeLegendItems.push({ label: 'Tanning / sun damage zones', color: ZONE_COLORS.tanning.border });

  return (
    <View style={zoneStyles.wrapper}>
      <Text style={zoneStyles.zoneTitle}>Affected Zones</Text>

      {/* Face oval outline */}
      <View style={zoneStyles.face}>

        {/* Forehead */}
        <View style={[zoneStyles.forehead, { backgroundColor: fh.bg, borderColor: fh.border }]}>
          <Text style={[zoneStyles.zoneLabel, { color: fh.text }]}>Forehead</Text>
        </View>

        {/* Row 2: L Cheek | Under-eye | R Cheek */}
        <View style={zoneStyles.middleRow}>
          <View style={[zoneStyles.cheek, { backgroundColor: lc.bg, borderColor: lc.border }]}>
            <Text style={[zoneStyles.zoneLabel, { color: lc.text }]}>L. Cheek</Text>
          </View>
          <View style={[zoneStyles.underEyes, { backgroundColor: ue.bg, borderColor: ue.border }]}>
            <Text style={[zoneStyles.zoneLabel, { color: ue.text }]}>Under-eye</Text>
          </View>
          <View style={[zoneStyles.cheek, { backgroundColor: rc.bg, borderColor: rc.border }]}>
            <Text style={[zoneStyles.zoneLabel, { color: rc.text }]}>R. Cheek</Text>
          </View>
        </View>

        {/* Row 3: Nose (centred) */}
        <View style={[zoneStyles.nose, { backgroundColor: ns.bg, borderColor: ns.border }]}>
          <Text style={[zoneStyles.zoneLabel, { color: ns.text }]}>Nose</Text>
        </View>

        {/* Row 4: Chin */}
        <View style={[zoneStyles.chin, { backgroundColor: ch.bg, borderColor: ch.border }]}>
          <Text style={[zoneStyles.zoneLabel, { color: ch.text }]}>Chin</Text>
        </View>

      </View>

      {/* Legend */}
      <View style={zoneStyles.legend}>
        {activeLegendItems.length > 0 ? activeLegendItems.map(item => (
          <View key={item.label} style={zoneStyles.legendRow}>
            <View style={[zoneStyles.legendSwatch, { backgroundColor: item.color }]} />
            <Text style={zoneStyles.legendLabel}>{item.label}</Text>
          </View>
        )) : (
          <View style={zoneStyles.legendRow}>
            <View style={[zoneStyles.legendSwatch, { backgroundColor: ZONE_COLORS.none.border }]} />
            <Text style={zoneStyles.legendLabel}>No active concern zones detected</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Findings ─────────────────────────────────────────────────────────────
interface Finding {
  dot: string;
  label: string;
  dotColor: string;
}

function buildFindings(profile: AssessmentProfile): Finding[] {
  const out: Finding[] = [];

  if (profile.scan_acne && profile.scan_acne !== 'none') {
    out.push({
      dot: '●',
      dotColor: '#EF4444',
      label: `Active acne detected, ${profile.scan_acne} severity`,
    });
  }

  if (profile.scan_pigmentation && profile.scan_pigmentation !== 'none') {
    const loc =
      profile.spot_location === 'cheeks_under_eyes' ? 'on cheeks and under-eyes' :
      profile.spot_location === 'forehead_nose'     ? 'on forehead and T-zone' :
      profile.spot_location === 'jaw_chin'          ? 'along jawline and chin' :
      profile.spot_location === 'all_over'          ? 'across most of the face' :
                                                      'on the face';
    out.push({
      dot: '●',
      dotColor: '#92400E',
      label: `Pigmentation visible ${loc}, ${profile.scan_pigmentation} depth`,
    });
  }

  if (profile.scan_tan && profile.scan_tan !== 'none') {
    out.push({
      dot: '●',
      dotColor: '#D97706',
      label: profile.scan_tan === 'widespread'
        ? 'Widespread sun tanning detected across face'
        : 'Patchy sun tanning detected on exposed areas',
    });
  }

  if (profile.scan_oiliness === 'high') {
    out.push({
      dot: '●',
      dotColor: '#2563EB',
      label: 'High oil production detected, T-zone most affected',
    });
  }

  if (profile.scan_texture === 'rough' || profile.scan_texture === 'uneven') {
    out.push({
      dot: '●',
      dotColor: '#7C3AED',
      label: 'Uneven skin texture noted, likely from past breakouts',
    });
  }

  if (out.length === 0) {
    out.push({
      dot: '●',
      dotColor: '#22C55E',
      label: 'No major concerns detected, skin looks healthy',
    });
  }

  return out;
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function SkinAnalysisScreen() {
  const { profile, capturedImageUri, setCapturedImageUri } = useAssessmentStore();
  const { width } = useWindowDimensions();

  const photoSize   = Math.min(width - 48, 320);
  const photoHeight = photoSize * 1.15;
  const findings    = buildFindings(profile);

  // Debug: confirm what concerns are in the store when this screen renders
  console.log('[SkinAnalysis] profile.concerns:', JSON.stringify(profile.concerns));
  console.log('[SkinAnalysis] scan_acne:', profile.scan_acne, '| scan_tan:', profile.scan_tan, '| scan_pigmentation:', profile.scan_pigmentation);

  const handleContinue = () => {
    setCapturedImageUri(null); // spec: no face image retained after analysis
    router.replace('/assessment/plan-result' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <Text style={styles.eyebrow}>Skin Analysis</Text>
        <Text style={styles.heading}>Here's what we found</Text>
        <Text style={styles.subheading}>
          Your face analysis reveals the following skin concerns. The zone map
          below shows where each condition was detected.
        </Text>

        {/* ── Photo: clean reference image, no overlays ── */}
        <View style={[styles.photoContainer, { width: photoSize, height: photoHeight }]}>
          {capturedImageUri ? (
            <Image
              source={{ uri: capturedImageUri }}
              style={styles.photo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>
                📷{'\n'}Photo not available
              </Text>
            </View>
          )}
        </View>

        {/* ── Face zone map ── */}
        <FaceZoneMap concerns={profile.concerns} />

        {/* ── Findings card ── */}
        <View style={styles.findingsCard}>
          <Text style={styles.findingsHeading}>What we found</Text>
          {findings.map((f, i) => (
            <View key={i} style={styles.findingRow}>
              <Text style={[styles.findingDot, { color: f.dotColor }]}>{f.dot}</Text>
              <Text style={styles.findingText}>{f.label}</Text>
            </View>
          ))}
          <Text style={styles.findingsDisclaimer}>
            This analysis was generated by an AI scan. It does not constitute a
            medical diagnosis. Human review required before clinical use.
          </Text>
        </View>

      </ScrollView>

      <PrimaryButton label="See your skin plan →" onPress={handleContinue} />
    </SafeAreaView>
  );
}

// ─── Zone map styles ───────────────────────────────────────────────────────
const zoneStyles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  zoneTitle: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // Oval face outline — 220×280
  face: {
    width: 220,
    height: 280,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    gap: 6,
    overflow: 'hidden',
  },

  // Row 1: Forehead — wide band across the top
  forehead: {
    width: 152,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Row 2: L Cheek | Under-eye | R Cheek side by side
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cheek: {
    width: 58,
    height: 72,
    borderRadius: 29,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  underEyes: {
    width: 58,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Row 3: Nose — centred, below the cheek row
  nose: {
    width: 52,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Row 4: Chin — small oval at the bottom
  chin: {
    width: 72,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  zoneLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  // Legend
  legend: {
    alignSelf: 'flex-start',
    gap: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 12,
    color: '#555',
  },
});

// ─── Screen styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  content: { padding: 24, paddingBottom: 12, alignItems: 'center', gap: 20 },

  eyebrow: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  heading: {
    alignSelf: 'flex-start',
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 32,
  },
  subheading: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#666',
    lineHeight: 21,
    marginTop: -8,
  },

  photoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#DDD',
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E5E5',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },

  findingsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  findingsHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  findingRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  findingDot: { fontSize: 14, marginTop: 1 },
  findingText: { flex: 1, fontSize: 15, color: '#1A1A1A', lineHeight: 22 },
  findingsDisclaimer: {
    fontSize: 11,
    color: '#AAA',
    lineHeight: 17,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
});
