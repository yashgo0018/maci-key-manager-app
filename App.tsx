import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";
import React, { useEffect, useState } from "react";
import { Text, View, Alert, StyleSheet } from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Drawer from "./common/Drawer";
import Modal from "./common/Modal";
import { GlobalContextProvider, useGlobalContext } from "./contexts/Global";
import { KeypairContextProvider } from "./contexts/KeypairContext";
import { WebSocketProvider } from "./contexts/WebSocket";
import Pages from "./pages";
import * as LocalAuthentication from 'expo-local-authentication';

NativeWindStyleSheet.setOutput({
  default: "native",
});

function Layout() {
  const { drawer, modal } = useGlobalContext();

  return (
    <View className="flex flex-col h-full bg-slate-900 text-white">
      <Pages />
      <Drawer>{drawer}</Drawer>
      <Modal>{modal}</Modal>
    </View>
  );
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require("./assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) {
          Alert.alert('Biometrics Not Available');
          setAuthenticated(false);
          return;
        }
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (supportedTypes.length === 0) {
          Alert.alert('No Biometric Types Supported', 'No biometric types are supported on this device.');
          setAuthenticated(false);
          return;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock Maci Key Manager',
          fallbackLabel: 'Use Passcode',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setAuthenticated(true);
        } else {
          Alert.alert('Authentication Failed', 'Failed to Authenticate. Please try again.', [
            { text: 'OK', onPress: () => authenticateUser() } 
          ]);
          setAuthenticated(false);
        }
      } catch (error) {
        console.error('Biometric authentication error: ', error);
        Alert.alert('Authentication Error', 'An error occurred during authentication.');
        setAuthenticated(false);
      }
    };

    authenticateUser();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <Text>Loading...</Text>;
  }

  if (!authenticated) {
    return (
      <View style={styles.whiteBackground}>
        <Text style={styles.text}>Please authenticate to access the app.</Text>
      </View>
    );
  }

  return (
    <KeypairContextProvider>
      <GlobalContextProvider>
        <WebSocketProvider>
          <SafeAreaView>
            <Layout />
          </SafeAreaView>
        </WebSocketProvider>
      </GlobalContextProvider>
    </KeypairContextProvider>
  );
}

const styles = StyleSheet.create({
  whiteBackground: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'black',
  },
});
