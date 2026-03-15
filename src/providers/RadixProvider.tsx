import { createContext, useContext, useEffect, useRef, useState } from "react";
import { RadixDappToolkit, RadixNetwork } from "@radixdlt/radix-dapp-toolkit";

export interface RadixAccount {
  address: string;
  label?: string;
  appearanceId?: number;
}

interface RadixContextValue {
  rdt: RadixDappToolkit | null;
  accounts: RadixAccount[];
  connected: boolean;
}

const RadixContext = createContext<RadixContextValue>({
  rdt: null,
  accounts: [],
  connected: false,
});

export const useRadixWallet = () => useContext(RadixContext);

export const RadixProvider = ({ children }: { children: React.ReactNode }) => {
  const rdtRef = useRef<RadixDappToolkit | null>(null);
  const [accounts, setAccounts] = useState<RadixAccount[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const rdt = RadixDappToolkit({
      networkId: RadixNetwork.Mainnet,
      applicationName: "Hydra Bubbles",
      applicationVersion: "1.0.0",
      dAppDefinitionAddress:
        "account_rdx12xhz8r4t4l9ghkuzu5frdl4x5xalhu2d9uqwv2ag5trdcxrjhyyuz5",
    });

    rdtRef.current = rdt;

    const sub = rdt.walletApi.walletData$.subscribe((data) => {
      const accs = data?.accounts ?? [];
      if (accs.length > 0) {
        setAccounts(accs as RadixAccount[]);
        setConnected(true);
      } else {
        setAccounts([]);
        setConnected(false);
      }
    });

    return () => {
      sub.unsubscribe();
      rdt.destroy();
    };
  }, []);

  return (
    <RadixContext.Provider
      value={{ rdt: rdtRef.current, accounts, connected }}
    >
      {children}
    </RadixContext.Provider>
  );
};
