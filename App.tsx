import 'react-native-gesture-handler';

import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/features/auth';
import { SubscriptionProvider, UpgradePromptProvider } from './src/features/subscription';
import { AppNavigator } from './src/navigation/AppNavigator';
import { BassTabProvider } from './src/store/BassTabProvider';
import { FinalizingUpgradeOverlay } from './src/components/FinalizingUpgradeOverlay';
import { logClientEvent } from './src/utils/clientTelemetry';

const frontendBuildId = '2026-04-11T12:58Z-library-debug-1';

export default function App() {
  useEffect(() => {
    logClientEvent('info', 'app.build_boot', { frontendBuildId });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <BassTabProvider>
            <UpgradePromptProvider>
              <StatusBar style="light" />
              <AppNavigator />
              <FinalizingUpgradeOverlay />
            </UpgradePromptProvider>
            </BassTabProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
