import { signMessage } from "@/utils/zk-kit";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useGlobalContext } from "./Global";
import { useKeypairContext } from "./KeypairContext";

interface SignData {
  pollId: string;
  title: string;
  selectedOption: string;
}

// type Action = "connect" | "disconnect" | "sign" | "signed" | "cancel-signature-request"

type WebSocketMessage =
  | {
      action: "connect";
      peerId: string;
      publicKey: string;
    }
  | {
      action: "connected";
      peerId: string;
    }
  | { action: "disconnect" }
  | { action: "disconnected" }
  | { action: "sign"; data: SignData; hash: string; signatureId: string }
  | { action: "signed"; signatureId: string; signature: string }
  | { action: "cancel-signature-request"; signatureId: string };

interface WebSocketContextType {
  socket: WebSocket | null;
  messages: WebSocketMessage[];
  sendMessage: (msg: WebSocketMessage) => void;
  connectedWebId: string | null;
}

const WebSocketContext = createContext<WebSocketContextType>(
  {} as WebSocketContextType
);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [connectedWebId, setConnectedWebId] = useState<string | null>(null);
  const { setModal } = useGlobalContext();
  const { selectedKeypairId, keypairs } = useKeypairContext();
  const [currentSignatureRequest, setCurrentSignatureRequest] = useState<{
    title: string;
    selectedOption: string;
    signatureId: string;
    hash: string;
  } | null>(null);
  const [
    lastSignatureCancellationRequest,
    setLastSignatureCancellationRequest,
  ] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://192.168.23.110:8080");

    ws.onopen = () => {
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const newMessage: WebSocketMessage = JSON.parse(event.data);
      processIncommingMessage(newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    ws.onclose = () => {
      setSocket(null);
      setConnectedWebId(null);
      setCurrentSignatureRequest(null);
    };

    return () => {
      ws.close();
    };
  }, []);

  const processIncommingMessage = (msg: WebSocketMessage) => {
    console.log(msg)
    switch (msg.action) {
      case "connected": 
        setConnectedWebId(msg.peerId);
        break;
      case "disconnected":
        setConnectedWebId(null);
        setCurrentSignatureRequest(null);
        break;
      case "sign":
        // show modal
        setCurrentSignatureRequest({
          title: msg.data.title,
          selectedOption: msg.data.selectedOption,
          signatureId: msg.signatureId,
          hash: msg.hash,
        });
        break;
      case "cancel-signature-request":
        setLastSignatureCancellationRequest(msg.signatureId);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (
      lastSignatureCancellationRequest &&
      lastSignatureCancellationRequest === currentSignatureRequest?.signatureId
    ) {
      setCurrentSignatureRequest(null);
      setLastSignatureCancellationRequest(null);
    }
  }, [lastSignatureCancellationRequest, currentSignatureRequest]);

  useEffect(() => {
    if (!currentSignatureRequest) {
      setModal(null);
      return;
    }

    setModal(
      <ModalContent
        title={currentSignatureRequest.title}
        selectedOption={currentSignatureRequest.selectedOption}
        onCancel={() => {
          sendMessage({
            action: "cancel-signature-request",
            signatureId: currentSignatureRequest.signatureId,
          });
          setCurrentSignatureRequest(null);
        }}
        onVote={() => {
          console.log({ keypairs, selectedKeypairId });

          if (keypairs.length === 0 || selectedKeypairId === null) return;
          const keypair = keypairs[selectedKeypairId];
          const rawSignature = signMessage(
            keypair.privKey.rawPrivKey.toString(),
            BigInt(currentSignatureRequest.hash)
          );
          const signature = JSON.stringify({
            R8: {
              0: rawSignature.R8[0].toString(),
              1: rawSignature.R8[1].toString(),
            },
            S: rawSignature.S.toString(),
          });
          sendMessage({
            action: "signed",
            signatureId: currentSignatureRequest.signatureId,
            signature,
          });
          setCurrentSignatureRequest(null);
        }}
      />
    );
  }, [currentSignatureRequest]);

  const sendMessage = (msg: WebSocketMessage) => {
    if (socket) {
      socket.send(JSON.stringify(msg));
    }
  };

  console.log({ connectedWebId });

  return (
    <WebSocketContext.Provider
      value={{ socket, messages, sendMessage, connectedWebId }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export function useWebSocket() {
  return useContext(WebSocketContext);
}

export function ModalContent({
  title,
  selectedOption,
  onCancel,
  onVote,
}: {
  title: string;
  selectedOption: string;
  onCancel: () => void;
  onVote: () => void;
}) {
  return (
    <View className="bg-white">
      <Text className="fold-bold">{title}</Text>
      <View className="mt-2">
        <Text>Your Choice: {selectedOption}</Text>
      </View>
      <View className="flex flex-row gap-2 mt-2">
        <TouchableOpacity
          className="flex-1 bg-red-600 px-7 py-3 rounded-full"
          onPress={onCancel}
        >
          <Text className="text-white mx-auto">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-blue-600 px-7 py-3 rounded-full"
          onPress={onVote}
        >
          <Text className="text-white mx-auto">Vote</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
