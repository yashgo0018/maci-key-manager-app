import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function Drawer(props: { children?: React.ReactNode | null }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    props.children && setShow(true);
  }, [props.children]);

  useEffect(() => {
    !props.children && setShow(false);
  }, [props.children]);

  return show ? (
    <View
      className="z-[999] absolute bg-white/10 top-0 left-0 w-full h-full"
      onTouchEnd={() => setShow(false)}
    >
      <ScrollView
        className="bg-slate-950 absolute bottom-0 left-0 w-full p-3 rounded-t-3xl max-h-[60vh]"
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <View className="mb-3 w-1/2 self-center border border-white/20 rounded-full" />
        {props.children}
      </ScrollView>
    </View>
  ) : null;
}
