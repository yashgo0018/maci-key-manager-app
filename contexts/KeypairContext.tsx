import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { Keypair, PrivKey } from "../utils/maci";

interface IKeypairContext {
  keypairs: Keypair[];
  selectedKeypairId: number | null;
  setSelectedKeypairId: (id: number) => void;
  createKeypair: () => void;
}

export const KeypairContext = createContext<IKeypairContext>({
  keypairs: [],
  selectedKeypairId: null,
  setSelectedKeypairId: (id: number) => {},
  createKeypair: () => {},
} as IKeypairContext);

export function KeypairContextProvider(props: { children: React.ReactNode }) {
  const [selectedKeypairId, setSelectedKeypairId] = useState<number | null>(
    null
  );
  const [keypairs, setKeypairs] = useState<Keypair[]>([]);

  useEffect(() => {
    // load the keypairs from the async storage
    (async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("keys");
        const privateKeys = (
          jsonValue != null ? JSON.parse(jsonValue) : null
        ) as string[] | null;

        console.log(privateKeys);

        if (!privateKeys) {
          throw "no keypair found";
        }

        const _keypairs = privateKeys.map(
          (p) => new Keypair(PrivKey.deserialize(p))
        );
        setKeypairs(_keypairs);
        setSelectedKeypairId(0);
      } catch (e) {
        console.log(e);
        // error reading value
        createKeypair();
      }
    })();
  }, []);

  function createKeypair() {
    const keypair = new Keypair();
    const privateKeys = keypairs.map((k) => k.privKey.serialize());
    privateKeys.push(keypair.privKey.serialize());
    const newSelectedKeyId = keypairs.length;

    setKeypairs([...keypairs, keypair]);
    setSelectedKeypairId(newSelectedKeyId);
    AsyncStorage.setItem("keys", JSON.stringify(privateKeys));
  }

  return (
    <KeypairContext.Provider
      value={{
        keypairs,
        selectedKeypairId,
        setSelectedKeypairId,
        createKeypair,
      }}
    >
      {props.children}
    </KeypairContext.Provider>
  );
}

export const useKeypairContext = () => useContext(KeypairContext);
