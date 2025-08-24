import { createContext, useContext, useState } from 'react';

interface NetState {
  wsMock: boolean;
}

const NetContext = createContext<{
  state: NetState;
  setState: React.Dispatch<React.SetStateAction<NetState>>;
}>({ state: { wsMock: false }, setState: () => {} });

export const NetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NetState>({ wsMock: false });
  return <NetContext.Provider value={{ state, setState }}>{children}</NetContext.Provider>;
};

export const useNet = () => useContext(NetContext);