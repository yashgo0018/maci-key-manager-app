import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Drawer from "./common/Drawer";
import Modal from "./common/Modal";
import { GlobalContextProvider, useGlobalContext } from "./contexts/Global";
import { KeypairContextProvider } from "./contexts/KeypairContext";
import { WebSocketProvider } from "./contexts/WebSocket";
import Pages from "./pages";

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
  const [loaded] = useFonts({
    SpaceMono: require("./assets/fonts/SpaceMono-Regular.ttf"),
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
          <SafeAreaView>
            <Layout />
          </SafeAreaView>
        </WebSocketProvider>
      </GlobalContextProvider>
    </KeypairContextProvider>
  );
}
