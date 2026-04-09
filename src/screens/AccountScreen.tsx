import { useState } from 'react';
import { Linking } from 'react-native';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Circle, Svg, Text as SvgText } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppSectionNav } from '../components/AppSectionNav';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { palette } from '../constants/colors';
import { brandDisplayFontFamily } from '../constants/typography';
import { BassTabApiError } from '../api';
import { useSubscription } from '../features/subscription';
import { subscriptionService } from '../features/subscription/subscriptionService';
import { RootStackParamList } from '../navigation/types';

// ---------------------------------------------------------------------------
// Branding constants (shared pattern across all Dad Band screens)
// ---------------------------------------------------------------------------
const NAMEPLATE_BG = '#1a120a';
const NAMEPLATE_TEXT = '#f5e6c8';
const NAMEPLATE_MUTED = '#a8957e';
const NAMEPLATE_GOLD = '#c8a96e';

// ---------------------------------------------------------------------------
// Cancel state machine
//   idle        → normal, cancel button visible
//   confirming  → modal open, awaiting user decision
//   submitting  → API call in flight, buttons disabled
//   scheduled   → cancellation confirmed; Pro active until period end
//   error       → request failed; surface message, allow retry
// ---------------------------------------------------------------------------
type CancelState = 'idle' | 'confirming' | 'submitting' | 'error';

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------
function DadBandBadge() {
  return (
    <Svg width={80} height={80} viewBox="0 0 120 120">
      <Circle cx="60" cy="60" r="54" fill="none" stroke={NAMEPLATE_GOLD} strokeWidth={3} />
      <Circle cx="60" cy="60" r="44" fill="none" stroke={NAMEPLATE_GOLD} strokeWidth={2} strokeDasharray="4 3" />
      <SvgText x="60" y="65" textAnchor="middle" fontSize={18} fontWeight="bold" letterSpacing={2} fill={NAMEPLATE_TEXT} fontFamily="Arial">DAD BAND</SvgText>
      <SvgText x="60" y="24" textAnchor="middle" fontSize={8} letterSpacing={1.5} fill={NAMEPLATE_GOLD} fontFamily="Arial">ACCOUNT</SvgText>
      <SvgText x="60" y="108" textAnchor="middle" fontSize={7} letterSpacing={1.2} fill={NAMEPLATE_GOLD} fontFamily="Arial">FINE. BE PROFESSIONAL.</SvgText>
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

export function AccountScreen({ navigation }: Props) {
  const { tier, status, currentPeriodEnd, cancelAtPeriodEnd, refresh } = useSubscription();

  const [cancelState, setCancelState] = useState<CancelState>('idle');
  const [cancelError, setCancelError] = useState('');

  const isProActive = tier === 'PRO';
  const modalVisible = cancelState === 'confirming' || cancelState === 'submitting';
  const isSubmitting = cancelState === 'submitting';
  const isCancelled = cancelAtPeriodEnd || status === 'cancellation_scheduled';
  const periodEndLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : 'Unknown';

  const handleManageBilling = async () => {
    try {
      const portalUrl = await subscriptionService.loadBillingPortalUrl();
      await Linking.openURL(portalUrl);
    } catch {
      setCancelError("Couldn't open billing portal right now. Please try again.");
      setCancelState('error');
    }
  };

  const handleRequestCancel = () => {
    setCancelError('');
    setCancelState('confirming');
  };

  const handleConfirmCancel = async () => {
    setCancelState('submitting');
    try {
      await subscriptionService.cancelSubscription();
      await refresh();
      setCancelState('idle');
    } catch (error) {
      if (error instanceof BassTabApiError && error.status === 409) {
        await refresh();
        setCancelState('idle');
        return;
      }
      if (error instanceof BassTabApiError && error.status === 404) {
        await refresh();
        setCancelError('No active subscription was found to cancel.');
        setCancelState('error');
        return;
      }
      setCancelError("Couldn't cancel subscription right now. Please try again.");
      setCancelState('error');
    }
  };

  const handleDismissModal = () => {
    if (!isSubmitting) {
      setCancelState(cancelState === 'error' ? 'error' : 'idle');
    }
  };

  return (
    <ScreenContainer>
      {/* Nav */}
      <View style={styles.navRow}>
        <AppSectionNav
          current="GoPro"
          onHome={() => navigation.navigate('Home')}
          onLibrary={() => navigation.navigate('MainTabs', { screen: 'Library' })}
          onSetlist={() => navigation.navigate('MainTabs', { screen: 'Setlist' })}
          onImport={() => navigation.navigate('MainTabs', { screen: 'Import' })}
          onAICreate={() => navigation.navigate('MainTabs', { screen: 'AICreate' })}
          onGoPro={() => navigation.navigate('Upgrade')}
        />
      </View>

      {/* Dark nameplate banner */}
      <View style={styles.nameplate}>
        <View style={styles.nameplateInner}>
          <View style={styles.nameplateText}>
            <Text style={styles.nameplateTitle}>Dad Band Account 🎸</Text>
            <Text style={styles.nameplateSubtitle}>Fine. Let's be professional for a minute.</Text>
            <View style={styles.warningPill}>
              <Text style={styles.warningPillText}>⚠️ This is the boring bit</Text>
            </View>
          </View>
          <View style={styles.badgeSlap}>
            <DadBandBadge />
          </View>
        </View>
      </View>

      {/* Subscription card */}
      <View style={[styles.subscriptionCard, isProActive && styles.subscriptionCardPro]}>
        <Text style={styles.sectionLabel}>The serious bit</Text>

        {isProActive ? (
          <>
            {/* Plan identity */}
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
            <Text style={styles.planTitle}>You're on Pro 🎸</Text>
            <Text style={styles.planText}>
              All features unlocked. What you do with it is up to you.
            </Text>

            <View style={styles.divider} />

            {/* Billing detail rows */}
            <View style={styles.billingTable}>
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Plan</Text>
                <Text style={styles.billingValue}>Pro</Text>
              </View>
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Status</Text>
                <Text style={[styles.billingValue, isCancelled && styles.billingValueScheduled]}>
                  {isCancelled ? 'Cancels at period end' : 'Active'}
                </Text>
              </View>
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>
                  {isCancelled ? 'Access until' : 'Renews on'}
                </Text>
                <Text style={styles.billingValue}>{periodEndLabel}</Text>
              </View>
            </View>

            {/* Post-cancel success note */}
            {isCancelled ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  Pro will stay active until the end of the billing period.
                </Text>
              </View>
            ) : null}

            {/* Inline error */}
            {cancelState === 'error' && cancelError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{cancelError}</Text>
              </View>
            ) : null}

            {/* Billing actions */}
            <View style={styles.billingActions}>
              <PrimaryButton
                label="Manage billing"
                onPress={() => { void handleManageBilling(); }}
                variant="secondary"
                size="compact"
              />
              {!isCancelled ? (
                <PrimaryButton
                  label="Cancel subscription"
                  onPress={handleRequestCancel}
                  variant="danger"
                  size="compact"
                />
              ) : null}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.planTitle}>You're on the Free Plan</Text>
            <Text style={styles.planText}>
              Upgrade for unlimited songs and setlists, SVG performance mode, and full community access.
            </Text>
            <PrimaryButton
              label="Upgrade to Pro"
              onPress={() => navigation.navigate('Upgrade')}
            />
          </>
        )}
      </View>

      {isProActive && !isCancelled ? (
        <Text style={styles.microcopy}>Cheaper than new strings.</Text>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/* Cancellation confirmation modal                                      */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleDismissModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel Pro?</Text>
            <Text style={styles.modalBody}>
              You'll keep Pro until the end of the current billing period. After that, your account will drop back to the free plan.
            </Text>
            <Text style={styles.modalReassurance}>
              No dramatic scenes. You can still use what you've already paid for.
            </Text>
            <View style={styles.modalActions}>
              <PrimaryButton
                label="Keep Pro"
                onPress={handleDismissModal}
                variant="secondary"
                disabled={isSubmitting}
              />
              <PrimaryButton
                label={isSubmitting ? 'Cancelling...' : 'Yes, cancel subscription'}
                onPress={() => { void handleConfirmCancel(); }}
                variant="danger"
                disabled={isSubmitting}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  navRow: {
    marginBottom: 0,
  },

  // Nameplate
  nameplate: {
    backgroundColor: NAMEPLATE_BG,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: NAMEPLATE_GOLD,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  nameplateInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameplateText: {
    flex: 1,
    gap: 8,
  },
  nameplateTitle: {
    fontFamily: brandDisplayFontFamily,
    fontSize: 20,
    fontWeight: '800',
    color: NAMEPLATE_TEXT,
    flexShrink: 1,
  },
  nameplateSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: NAMEPLATE_MUTED,
    fontStyle: 'italic',
  },
  warningPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#2e1f0a',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#7a5520',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  warningPillText: {
    fontSize: 11,
    color: '#d4a04a',
    fontWeight: '600',
  },
  badgeSlap: {
    transform: [{ rotate: '-10deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 5,
  },

  // Subscription card
  subscriptionCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: 18,
    gap: 12,
  },
  subscriptionCardPro: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: '700',
    color: palette.textMuted,
  },
  proBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#1e3a8a',
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#dbeafe',
  },
  planTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: palette.text,
  },
  planText: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(29, 78, 216, 0.18)',
    marginVertical: 2,
  },

  // Billing detail table
  billingTable: {
    gap: 8,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billingLabel: {
    fontSize: 13,
    color: palette.textMuted,
  },
  billingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.text,
  },
  billingValueScheduled: {
    color: '#b45309',
  },

  // Billing actions
  billingActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },

  // Success / error inline feedback
  successBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  successText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 13,
    color: palette.danger,
    lineHeight: 18,
  },

  // Microcopy
  microcopy: {
    fontSize: 11,
    color: palette.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.8,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.52)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    padding: 24,
    gap: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.text,
  },
  modalBody: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.text,
  },
  modalReassurance: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.textMuted,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
});
