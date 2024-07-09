import { useKeypairContext } from "@/contexts/KeypairContext";
import { useWebSocket } from "@/contexts/WebSocket";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableHighlight,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { twMerge } from "tailwind-merge";

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const [data, setData] = useState<string | null>(null);

  const [errored, setErrored] = useState(false);
  const [errorTimeout, setErrorTimeout] = useState<NodeJS.Timeout>();
  const { sendMessage, connectedWebId } = useWebSocket();
  const { selectedKeypairId, keypairs } = useKeypairContext();

  async function startVotingSession() {
    let id = "";
    if (!data) return setData(null);
    if (keypairs.length === 0) return setData(null);
    if (selectedKeypairId === null) return setData(null);

    try {
      const parsedData = JSON.parse(data);
      id = parsedData.webId;
      if (!id) throw "Invalid data";

      sendMessage({
        action: "connect",
        peerId: id,
        publicKey: keypairs[selectedKeypairId].pubKey.serialize(),
      });
    } catch (err) {
      errorTimeout && clearTimeout(errorTimeout);
      setData(null);
      setErrored(true);
      const t = setTimeout(() => {
        setErrored(false);
      }, 1500);
      setErrorTimeout(t);
    }

    if (!id) return setData(null);

    Vibration.vibrate();
  }

  function disconnect() {
    setData(null);
    sendMessage({ action: "disconnect" });
  }

  useEffect(() => {
    data && startVotingSession();
  }, [data]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <TouchableHighlight
          onPress={requestPermission}
          className="bg-blue-700 px-8 py-2 rounded-md"
        >
          <Text>grant permission</Text>
        </TouchableHighlight>
      </View>
    );
  }

  return (
    <View className="flex flex-col">
      {!connectedWebId && (
        <Text className="text-white mb-4 text-xl font-semibold text-center">
          Scan QR Code
        </Text>
      )}

      {!connectedWebId && (
        <CameraView
          facing={"back"}
          className="w-full aspect-square relative"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={(code) => {
            setData(code.data);
          }}
        >
          <Text
            className={twMerge(
              "text-white font-medium mb-2 absolute bottom-0 self-center bg-black px-2 py-1 rounded-sm",
              errored && "text-red-500"
            )}
          >
            {!errored && "Place QR inside the square"}
            {errored && "Invalid QR"}
          </Text>
        </CameraView>
      )}

      {connectedWebId && (
        <VotingScreen id={connectedWebId} disconnect={disconnect} />
      )}
    </View>
  );
}

function VotingScreen(props: { id: string; disconnect: () => void }) {
  const { sendMessage } = useWebSocket();

  return (
    <View>
      <Text className="text-xl text-center text-green-400">
        Connected to #{props.id}
      </Text>
      <TouchableOpacity
        className="bg-red-600 px-5 py-1 self-center mt-4 rounded"
        onPress={props.disconnect}
      >
        <Text className="text-white font-medium text-sm">Disconnect</Text>
      </TouchableOpacity>
    </View>
  );
}
