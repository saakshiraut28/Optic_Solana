/** @format */

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal = ({ isOpen, onClose }: SignupModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    walletAddress: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", form);
    setSubmitted(true);
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
        aria-labelledby="signup-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="text-3xl">✓</div>
            <h2 className="text-2xl font-semibold">You're in.</h2>
            <p className="text-gray-600">
              Welcome aboard. Check your inbox to verify your email.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-900 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6 space-y-2">
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Get started
              </p>
              <h2
                id="signup-title"
                className="text-2xl font-semibold text-gray-900"
              >
                Connect your wallet
              </h2>
              <p className="text-sm text-gray-600">
                Join the Network. Verify the Content.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              {/* Name */}
              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium">
                  Solana Wallet Address
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Jane Smith"
                  value={form.walletAddress}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-900 transition"
              >
                Create account
              </button>

              <p className="text-xs text-gray-500 text-center">
                By signing up, you agree to our{" "}
                <a href="#" className="underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="underline">
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SignupModal;