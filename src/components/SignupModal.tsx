/** @format */
import { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import useAuthStore from "@/hooks/useAuthStore";

const api = axios.create({ baseURL: "http://localhost:3000/api" });

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal = ({ isOpen, onClose }: SignupModalProps) => {
  const setUser = useAuthStore((state) => state.setUser);

  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Signup fields
  const [signupForm, setSignupForm] = useState({
    walletAddress: "",
    username: "",
  });

  // Sign in field — just username/profileId
  const [signinId, setSigninId] = useState("");

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
    setError(null);
  };

  // ── SIGN UP ──
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.walletAddress.trim() || !signupForm.username.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/profile/findOrCreate", {
        walletAddress: signupForm.walletAddress.trim(),
        username: signupForm.username.trim(),
      });
      const raw = res.data.data;
      const profile = raw?.profile ?? raw;
      setUser({
        id: profile.id ?? signupForm.username.trim(),
        username: profile.username ?? signupForm.username.trim(),
        walletAddress: signupForm.walletAddress.trim(),
        bio: profile.bio ?? "",
        profileImage: profile.profileImage ?? "",
        website: profile.website ?? "",
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.error ??
        err?.response?.data?.error ??
        "Something went wrong.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  // ── SIGN IN — just fetch the profile by ID ──
  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signinId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/profile/${signinId.trim()}`);
      const raw = res.data.data;
      const profile = raw?.profile ?? raw;

      if (!profile?.id) throw new Error("Profile not found.");

      setUser({
        id: profile.id,
        username: profile.username,
        walletAddress: raw.walletAddress ?? "",
        bio: profile.bio ?? "",
        profileImage: profile.image ?? "",
        website: profile.website ?? "",
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.error ??
        err?.response?.data?.error ??
        "Profile not found. Check your username.";
      setError(
        typeof msg === "string"
          ? msg
          : "Profile not found. Check your username.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    onClose();
    setSubmitted(false);
    setSignupForm({ walletAddress: "", username: "" });
    setSigninId("");
    setError(null);
  };

  const switchMode = (m: "signup" | "signin") => {
    setMode(m);
    setError(null);
    setSignupForm({ walletAddress: "", username: "" });
    setSigninId("");
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
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* SUCCESS */}
        {submitted ? (
          <div className="text-center space-y-4">
            <div className="text-3xl">✓</div>
            <h2 className="text-2xl font-semibold">You're in.</h2>
            <p className="text-gray-500 text-sm">
              Welcome{mode === "signin" ? " back" : ""},{" "}
              <span className="font-semibold">
                @{mode === "signin" ? signinId : signupForm.username}
              </span>
            </p>
            <button
              onClick={handleDone}
              className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-900 transition"
            >
              Let's go
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6 space-y-1">
              <p className="text-sm text-gray-400 uppercase tracking-wide">
                {mode === "signup" ? "Get started" : "Welcome back"}
              </p>
              <h2 className="text-2xl font-semibold text-gray-900">
                {mode === "signup" ? "Create account" : "Sign in"}
              </h2>
            </div>

            {/* MODE TOGGLE */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => switchMode("signup")}
                className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition ${
                  mode === "signup"
                    ? "bg-white shadow text-black"
                    : "text-gray-500"
                }`}
              >
                Sign up
              </button>
              <button
                onClick={() => switchMode("signin")}
                className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition ${
                  mode === "signin"
                    ? "bg-white shadow text-black"
                    : "text-gray-500"
                }`}
              >
                Sign in
              </button>
            </div>

            {/* SIGN UP FORM */}
            {mode === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <input
                    name="username"
                    type="text"
                    required
                    placeholder="johndoe"
                    value={signupForm.username}
                    onChange={handleSignupChange}
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Solana Wallet Address
                  </label>
                  <input
                    name="walletAddress"
                    type="text"
                    required
                    placeholder="e.g. 7xKX..."
                    value={signupForm.walletAddress}
                    onChange={handleSignupChange}
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-500 text-center">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !signupForm.username.trim() ||
                    !signupForm.walletAddress.trim()
                  }
                  className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-900 transition disabled:opacity-50 text-sm"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>
            )}

            {/* SIGN IN FORM */}
            {mode === "signin" && (
              <form onSubmit={handleSignin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Your Username</label>
                  <input
                    type="text"
                    required
                    placeholder="johndoe"
                    value={signinId}
                    onChange={(e) => {
                      setSigninId(e.target.value);
                      setError(null);
                    }}
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter the username you signed up with.
                  </p>
                </div>
                {error && (
                  <p className="text-xs text-red-500 text-center">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !signinId.trim()}
                  className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-900 transition disabled:opacity-50 text-sm"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
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
