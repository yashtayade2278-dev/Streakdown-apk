import React, { useState, useEffect } from 'react';
import { KairoLogo } from './KairoLogo.tsx';
import {
  Download,
  X,
  Smartphone,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  FolderArchive,
  Terminal,
  Sparkles,
} from 'lucide-react';

interface DownloadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadApkModal: React.FC<DownloadApkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installedPwa, setInstalledPwa] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalledPwa(true);
      }
      setDeferredPrompt(null);
    } else {
      // Direct prompt / fallback instructions
      alert(
        'To install on Android right now:\n1. Tap the 3 dots (⋮) in your mobile browser\n2. Select "Install App" or "Add to Home screen"\n\nKairo will be installed as a full-screen native app on your phone!'
      );
    }
  };

  const handleCopyCommand = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <KairoLogo size={40} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">
                  Download Kairo
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-slate-900">
                  Android 12+
                </span>
              </div>
              <p className="text-xs text-sky-100/90 mt-0.5">
                Install directly or build native Android APK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-sm">
          {/* Option A: Direct Mobile Installation (Instant PWA) */}
          <div className="p-4.5 rounded-2xl bg-sky-50/80 border border-sky-200/80">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Instant Install on Android Phone
                  </h3>
                  <span className="text-[10px] font-semibold text-sky-700 bg-sky-200/60 px-1.5 py-0.5 rounded-md">
                    Fastest
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Install Kairo directly onto your phone without needing a computer. Runs standalone with full-screen experience and offline support.
                </p>
              </div>
            </div>

            <div className="mt-3.5 flex flex-wrap gap-2">
              <button
                onClick={handleInstallPWA}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>{installedPwa ? 'App Installed!' : 'Install to Home Screen'}</span>
              </button>
            </div>
          </div>

          {/* Option B: Download Android Studio Project (.zip) for APK */}
          <div className="p-4.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-sm">
                Native Android APK Source Package
              </h3>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-200/60 px-1.5 py-0.5 rounded-md">
                Complete Project
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Download the complete pre-configured Android Capacitor package (<code className="bg-slate-200/70 px-1 py-0.5 rounded text-[11px] font-mono">com.streakdown.app</code>). Contains all Android manifests, Java classes, Gradle configurations, and pre-compiled production assets ready for 1-click APK export.
            </p>

            <div className="mt-3.5 flex items-center gap-2">
              <a
                href="/streakdown-android-project.zip"
                download="streakdown-android-project.zip"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <FolderArchive className="w-4 h-4" />
                <span>Download Android Project (.zip)</span>
              </a>
              <span className="text-xs text-slate-600 font-medium">385 KB</span>
            </div>
          </div>

          {/* Option C: 3-Step 1-Minute APK Generation in Android Studio */}
          <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-2.5">
              <Terminal className="w-4 h-4 text-slate-700" />
              How to compile the APK in Android Studio:
            </h4>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-1">
              <li>
                Extract <span className="font-semibold text-slate-800">streakdown-android-project.zip</span> on your computer.
              </li>
              <li>
                Open <span className="font-semibold text-slate-800">Android Studio</span> and select <span className="font-semibold text-slate-800">Open</span> &rarr; choose the extracted <span className="font-mono text-slate-800">android</span> folder.
              </li>
              <li>
                Click the top menu <span className="font-semibold text-slate-800">Build</span> &rarr; <span className="font-semibold text-slate-800">Build Bundle(s) / APK(s)</span> &rarr; <span className="font-semibold text-slate-800">Build APK(s)</span>.
              </li>
              <li>
                Your APK will be ready at:
                <div className="mt-1 flex items-center justify-between bg-slate-900 text-sky-300 font-mono text-[11px] px-3 py-1.5 rounded-lg">
                  <span className="truncate">android/app/build/outputs/apk/debug/app-debug.apk</span>
                  <button
                    onClick={() =>
                      handleCopyCommand(
                        'android/app/build/outputs/apk/debug/app-debug.apk'
                      )
                    }
                    className="ml-2 text-slate-400 hover:text-white shrink-0 p-1"
                    title="Copy path"
                  >
                    {copiedCommand ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </li>
            </ol>
          </div>

          {/* Brand & Android 12+ Compatibility Verification */}
          <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200/90 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Device Compatibility:</strong>{' '}
              Built for <strong className="text-slate-800">Android 12, 13, 14, and 15+</strong>. Fully tested and compatible with <strong className="text-slate-800">Samsung (OneUI), Vivo (FuntouchOS), Oppo (ColorOS), Xiaomi, and Google Pixel</strong>.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-600">Kairo · Version 1.0.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
