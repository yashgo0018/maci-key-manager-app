import React, { useState } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { twMerge } from "tailwind-merge";
import ExploreScreen from "./explore";
import HomeScreen from "./home";
import ScannerScreen from "./scanner";

export default function Pages() {
  const [currentTab, setCurrentTab] = useState(0);

  function showQRscanner() {
    setCurrentTab(2);
  }

  const tabs = [
    {
      element: <HomeScreen showQRscanner={showQRscanner} />,
      icon: "https://cdn2.iconfinder.com/data/icons/ui-kit-developer-glyphs/16/GlyphIcons-Home-512.png",
    },
    {
      element: <ExploreScreen />,
      icon: "https://cdn-icons-png.flaticon.com/512/565/565504.png",
    },
    {
      element: <ScannerScreen />,
      icon: "https://static-00.iconduck.com/assets.00/qr-scan-icon-2048x2048-aeh36n7y.png",
    },
    {
      element: <ExploreScreen />,
      icon: "https://cdn-icons-png.freepik.com/512/7605/7605078.png",
    },
    {
      element: <ExploreScreen />,
      icon: "https://static-00.iconduck.com/assets.00/settings-icon-1964x2048-8nigtrtt.png",
    },
  ];

  return (
    <View className="flex h-full pt-10 pb-6">
      <ScrollView className="px-3 flex-grow">
        {tabs[currentTab].element}
      </ScrollView>

      <View className="flex flex-row text-2xl border-t pt-2 px-2 border-white/20">
        {tabs.map((tab, key) => (
          <TouchableOpacity
            className={twMerge(
              "flex justify-center items-center h-[4vh]",
              currentTab == key && "bg-blue-800 rounded-full"
            )}
            style={{ width: `${100 / tabs.length}%` }}
            onPress={() => setCurrentTab(key)}
            key={key}
          >
            <Image
              src={tab.icon}
              className={twMerge(
                "w-[4vw] aspect-square opacity-30",
                currentTab == key && "opacity-100"
              )}
              style={{
                tintColor: "#fff",
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
