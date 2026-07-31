import React from 'react';
import { watermarkBase64 } from './watermarkBase64';

export const WatermarkLogo: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity: 0.1,
        userSelect: 'none',
        zIndex: 0,
      }}
    >
      <img
        src={watermarkBase64}
        alt="Watermark Logo"
        style={{
          width: '450px',
          height: '450px',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
};
