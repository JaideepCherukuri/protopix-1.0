// src/TestButton.jsx
import React from 'react';
import { useAppKit } from '@reown/appkit/react';

export default function TestButton() {
  const { openModal } = useAppKit();

  return (
    <button onClick={openModal}>
      Open Modal
    </button>
  );
}