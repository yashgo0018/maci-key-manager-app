import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import App from "@/App";
import { GlobalContextProvider } from "@/contexts/Global";
import { KeypairContextProvider } from "@/contexts/KeypairContext";
import { WebSocketProvider } from "@/contexts/WebSocket";
import { NativeWindStyleSheet } from "nativewind";
import { Text } from "react-native";

NativeWindStyleSheet.setOutput({
  default: "native",
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <Text>loading...</Text>;
  }

  return (
    <KeypairContextProvider>
      <GlobalContextProvider>
        <WebSocketProvider>
          <App />
        </WebSocketProvider>
      </GlobalContextProvider>
    </KeypairContextProvider>
  );
}
