"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

type InstallQrProps = {
  platform: "ios" | "android";
  label: string;
};

export function InstallQr({ platform, label }: InstallQrProps) {
  const [installUrl, setInstallUrl] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setInstallUrl(`${window.location.origin}/mobile#${platform}`);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [platform]);

  return (
    <div className="install-qr">
      {installUrl ? (
        <QRCodeSVG
          value={installUrl}
          size={126}
          level="M"
          marginSize={2}
          bgColor="#ffffff"
          fgColor="#111027"
          role="img"
          aria-label={`${label} MindWeather install QR code`}
        />
      ) : (
        <span className="install-qr__loading">Preparing QR code</span>
      )}
      <span>
        <strong>Scan from your phone</strong>
        <small>Point your camera at the code, then follow the install steps for your device.</small>
      </span>
    </div>
  );
}
