/** @format */

import { useState } from "react";
import SignupModal from "@/components/SignupModal";
import bg from "@/assets/optic.png";

const Index = () => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative flex w-screen min-h-screen items-center justify-center overflow-hidden" 
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[hsl(36_20%_90%/0.4)]" />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-4">
        <button
          onClick={() => setOpen(true)}
          className="btn-primary bg-white text-white"
          style={{ width: "auto", padding: "0.625rem 2rem" }}
        >
          Get started
        </button>
      </div>

      <SignupModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default Index;
