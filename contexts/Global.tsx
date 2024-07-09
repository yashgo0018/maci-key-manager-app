import { ReactNode, createContext, useContext, useState } from "react";

interface IGlobalContext {
  drawer: ReactNode | null;
  modal: ReactNode | null;
  setDrawer: (drawer: ReactNode | null) => void;
  setModal: (modal: ReactNode | null) => void;
}

const GlobalContext = createContext<IGlobalContext>({} as IGlobalContext);

export function GlobalContextProvider(props: { children: React.ReactNode }) {
  const [drawer, setDrawer] = useState<React.ReactNode | null>(null);
  const [modal, setModal] = useState<React.ReactNode | null>(null);

  return (
    <GlobalContext.Provider value={{ drawer, setDrawer, modal, setModal }}>
      {props.children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  return useContext(GlobalContext);
}
