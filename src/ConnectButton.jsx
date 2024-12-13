// src/ConnectButton.jsx
import React from "react";
import { useAppKit } from "@reown/appkit/react";

export default function ConnectButton() {
  const { openModal } = useAppKit();

  return (
    <appkit-button label="Get  Started"size="md"
    
    ></appkit-button>
  );
}