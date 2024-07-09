import React from "react";
import { View } from "react-native";

export default function Modal(props: { children: React.ReactNode }) {
  return props.children ? (
    <View className="z-[999] absolute bg-black/20 top-0 left-0 w-full h-full flex items-center justify-center">
      <View className="flex flex-col self-center place-self-center bg-white w-[80%] p-5 rounded-lg">
        {props.children}
      </View>
    </View>
  ) : null;
}
