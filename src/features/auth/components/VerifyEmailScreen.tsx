import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '../../../components/PrimaryButton';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { RootStackParamList } from '../../../navigation/types';
import { useAuth } from '../state/useAuth';
import { authScreenStyles as styles } from './authScreenStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

export function VerifyEmailScreen({ route, navigation }: Props) {
  const maskedEmail = route.params?.maskedEmail;
  const { errorMessage, infoMessage, loadingAction, verifyEmail, resendVerification, clearError, setAuthView, draftEmail } = useAuth();
  // Real email comes from auth context (set during registration) — never from the URL.
  const email = draftEmail;
  const displayEmail = maskedEmail ?? email;
  const [code, setCode] = useState('');

  const isVerifying = loadingAction === 'verifyEmail';
  const isResending = loadingAction === 'resendVerification';

  const submit = () => {
    if (isVerifying || code.trim().length !== 6) return;
    void verifyEmail({ email, code });
  };

  return (
    <ScreenContainer contentStyle={styles.container}>
      <View style={[styles.card, styles.centerCard]}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={[styles.body, styles.centeredBody]}>
          {'We sent a 6-digit code to\n'}
          <Text style={localStyles.emailHighlight}>{displayEmail}</Text>
        </Text>

        <TextInput
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor="#94a3b8"
          style={[styles.input, localStyles.codeInput]}
          value={code}
          onChangeText={(value) => {
            setCode(value.replace(/[^0-9]/g, ''));
            if (errorMessage) clearError();
          }}
          returnKeyType="done"
          onSubmitEditing={submit}
          autoFocus
        />

        {errorMessage ? (
          <Text style={[styles.errorText, styles.centeredBody]}>{errorMessage}</Text>
        ) : null}

        {infoMessage ? (
          <Text style={[styles.successText, styles.centeredBody]}>{infoMessage}</Text>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label={isVerifying ? 'Verifying...' : 'Verify Email'}
            onPress={submit}
            disabled={isVerifying || code.trim().length !== 6}
          />
          <PrimaryButton
            label={isResending ? 'Sending...' : 'Resend code'}
            variant="ghost"
            size="compact"
            onPress={() => { void resendVerification({ rawEmail: email }); }}
            disabled={isResending}
          />
          <PrimaryButton
            label="Back to Sign In"
            variant="ghost"
            size="compact"
            onPress={() => {
              setAuthView('LOGIN');
              navigation.replace('AuthEntry');
            }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const localStyles = StyleSheet.create({
  codeInput: {
    alignSelf: 'stretch',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 12,
    textAlign: 'center',
  },
  emailHighlight: {
    fontWeight: '700',
  },
});
