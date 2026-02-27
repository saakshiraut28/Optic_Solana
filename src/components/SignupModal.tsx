/** @format */
import { useState } from "react";
import { X } from "lucide-react";
import useAuthStore from "@/hooks/useAuthStore";
import api from "@/lib/api";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PhantomProvider {
  isPhantom: boolean;
  connect: (opts?: {
    onlyIfTrusted?: boolean;
  }) => Promise<{ publicKey: { toString: () => string } }>;
  signMessage: (
    msg: Uint8Array,
    encoding: string,
  ) => Promise<{ signature: Uint8Array }>;
  disconnect: () => Promise<void>;
}

const getPhantom = (): PhantomProvider | null => {
  if (typeof window !== "undefined" && (window as any).solana?.isPhantom) {
    return (window as any).solana as PhantomProvider;
  }
  return null;
};

// Uint8Array → base58 (no external dep needed in frontend)
const toBase58 = (bytes: Uint8Array): string => {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const digits: number[] = [0];
  let carry: number;
  for (let i = 0; i < bytes.length; i++) {
    carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let result = "";
  for (let k = 0; bytes[k] === 0 && k < bytes.length - 1; k++) result += "1";
  for (let q = digits.length - 1; q >= 0; q--) result += ALPHABET[digits[q]];
  return result;
};

const SignupModal = ({ isOpen, onClose }: SignupModalProps) => {
  const setUser = useAuthStore((state) => state.setUser);

  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [username, setUsername] = useState("");
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [step, setStep] = useState<"connect" | "confirm">("connect");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const reset = () => {
    setUsername("");
    setConnectedWallet(null);
    setStep("connect");
    setError(null);
    setDone(false);
  };

  const switchMode = (m: "signup" | "signin") => {
    setMode(m);
    reset();
  };

  // ── Step 1: Connect Phantom ──
  const connectWallet = async () => {
    const phantom = getPhantom();
    if (!phantom) {
      setError("Phantom not found. Install it at phantom.app then refresh.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await phantom.connect();
      setConnectedWallet(resp.publicKey.toString());
      setStep("confirm");
    } catch {
      setError("Connection cancelled.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Sign message → submit ──
  const handleSubmit = async () => {
    if (!connectedWallet) return;
    if (mode === "signup" && !username.trim()) {
      setError("Please enter a username.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const phantom = getPhantom()!;

      // Get nonce from server
      const { data: nonceData } = await api.get("/auth/nonce");
      const nonce: string = nonceData.nonce;

      // Ask Phantom to sign it — user sees a popup
      const encoded = new TextEncoder().encode(nonce);
      const { signature } = await phantom.signMessage(encoded, "utf8");
      const sig58 = toBase58(signature);

      if (mode === "signup") {
        const res = await api.post("/auth/signup", {
          walletAddress: connectedWallet,
          username: username.trim(),
          signature: sig58,
          nonce,
        });
        const profile = res.data.data?.profile;
        setUser({
          id: profile.id ?? username.trim(),
          username: profile.username ?? username.trim(),
          walletAddress: connectedWallet,
          bio: profile.bio ?? "",
          profileImage: profile.image ?? "",
          website: profile.website ?? "",
        });
      } else {
        const res = await api.post("/auth/signin", {
          walletAddress: connectedWallet,
          signature: sig58,
          nonce,
        });
        const profile = res.data.data?.profile;
        setUser({
          id: profile.id,
          username: profile.username,
          walletAddress: connectedWallet,
          bio: profile.bio ?? "",
          profileImage: profile.image ?? "",
          website: profile.website ?? "",
        });
      }
      setDone(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ?? err?.message ?? "Something went wrong.";
      setError(typeof msg === "string" ? msg : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    onClose();
    reset();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <X size={18} />
        </button>

        {/* ── SUCCESS ── */}
        {done ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h2 className="text-2xl font-semibold">You're in.</h2>
            <p className="text-gray-500 text-sm">
              Welcome{mode === "signin" ? " back" : ""} to Optic.
            </p>
            <button
              onClick={handleDone}
              className="w-full bg-black text-white py-2.5 rounded-full hover:bg-gray-900 transition text-sm"
            >
              Let's go
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">
                {mode === "signup" ? "Get started" : "Welcome back"}
              </p>
              <h2 className="text-2xl font-semibold">
                {mode === "signup" ? "Create account" : "Sign in"}
              </h2>
            </div>

            {/* Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              {(["signup", "signin"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition ${
                    mode === m
                      ? "bg-white shadow text-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {m === "signup" ? "Sign up" : "Sign in"}
                </button>
              ))}
            </div>

            {/* ── STEP 1: Connect wallet ── */}
            {step === "connect" && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-2">
                  <p className="font-medium text-gray-800">How it works:</p>
                  <p>1. Connect your Phantom wallet</p>
                  <p>2. Sign a message to prove ownership</p>
                  <p>
                    3.{" "}
                    {mode === "signup"
                      ? "Choose a username and you're in"
                      : "We'll find your profile and log you in"}
                  </p>
                </div>
                {error && (
                  <p className="text-xs text-red-500 text-center">{error}</p>
                )}
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-900 transition text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Connecting..." : "🔮 Connect Phantom Wallet"}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Don't have Phantom?{" "}
                  <a
                    href="https://phantom.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-gray-600"
                  >
                    Install it here
                  </a>
                </p>
              </div>
            )}

            {/* ── STEP 2: Confirm + sign ── */}
            {step === "confirm" && connectedWallet && (
              <div className="space-y-4">
                {/* Wallet connected badge */}
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-700 font-medium">
                    Wallet connected
                  </span>
                  <span className="ml-auto text-xs text-gray-400 font-mono truncate max-w-[140px]">
                    {connectedWallet.slice(0, 4)}...{connectedWallet.slice(-4)}
                  </span>
                </div>

                {/* Username field — signup only */}
                {mode === "signup" && (
                  <div>
                    <label className="text-sm font-medium">
                      Choose a username
                    </label>
                    <input
                      type="text"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError(null);
                      }}
                      className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-xs text-red-500 text-center">{error}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading || (mode === "signup" && !username.trim())}
                  className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-900 transition text-sm font-medium disabled:opacity-50"
                >
                  {loading
                    ? "Waiting for signature..."
                    : "Sign message & continue"}
                </button>

                <button
                  onClick={() => {
                    setStep("connect");
                    setConnectedWallet(null);
                    setError(null);
                  }}
                  className="w-full text-sm text-gray-400 hover:text-black transition"
                >
                  ← Use a different wallet
                </button>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center mt-4">
              By continuing, you agree to our{" "}
              <a href="#" className="underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="underline">
                Privacy Policy
              </a>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
};;

export default SignupModal;
