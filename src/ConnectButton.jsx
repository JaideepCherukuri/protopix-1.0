// src/ConnectButton.jsx
import React from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

export default function ConnectButton() {
  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();

  return (
    <appkit-button 
      label={isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Get Started"}
      size="md"
      onClick={() => open({ view: isConnected ? 'Account' : 'Connect' })}
    ></appkit-button>
  );
}