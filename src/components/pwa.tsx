"use client";

// Registers the service worker and shows an "Install app" button when the phone allows it.
import { useEffect, useState } from "react";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPrompt);
    };
    const onInstalled = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iPhones and iPads have no install prompt; people add the app from the Share menu.
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)) setIosHint(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (prompt) {
    return (
      <button
        type="button"
        className="install-btn"
        onClick={async () => {
          await prompt.prompt();
          await prompt.userChoice.catch(() => null);
          setPrompt(null);
        }}
      >
        Install app
      </button>
    );
  }

  if (iosHint) {
    return (
      <div className="install-ios">
        <button type="button" className="install-btn" onClick={() => setShowHelp((v) => !v)} aria-expanded={showHelp}>
          Install app
        </button>
        {showHelp && (
          <p className="install-help" role="status">
            Tap the <b>Share</b> button at the bottom of Safari, then <b>Add to Home Screen</b>.
          </p>
        )}
      </div>
    );
  }

  return null;
}
