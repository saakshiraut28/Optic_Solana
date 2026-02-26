/** @format */

import { useState } from "react";
import LeftSidebar from "@/components/LeftSidebar";
import SignupModal from "@/components/SignupModal";
import Feed from "@/components/PostCard";
import FollowItem from "@/components/FollowItem";
import useAuthStore from "@/hooks/useAuthStore";

const Index = () => {
  const [showSignup, setShowSignup] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex w-screen justify-centered min-h-screen bg-gray-50">
      <div className="mx-20 mx-auto flex">
        {/* LEFT SIDEBAR */}
        <LeftSidebar />

        {/* CENTER FEED */}
        <main className="flex-1 w-xl border-r border-gray-200 bg-white">
          {/* Feed Header */}
          <div className="sticky top-0 flex justify-between items-center bg-white p-4 border-b border-gray-200">
            <p className="text-xl font-black">Home</p>
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={logout}
                  className="text-sm text-gray-400 hover:text-black underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSignup(true)}
                className="w-content bg-black text-white px-4 py-2 rounded-full hover:bg-gray-900 transition text-sm"
              >
                Sign up
              </button>
            )}
          </div>

          {/* Create Post Box */}
          <div className="p-4 border-b border-gray-200">
            <textarea
              placeholder="What's happening?"
              className="w-full resize-none border-none outline-none text-lg"
              rows={2}
            />
            <div className="flex justify-end mt-3">
              <button className="bg-black text-white px-4 py-1.5 rounded-full text-sm">
                Post
              </button>
            </div>
          </div>

          {/* Posts */}
          <Feed
            currentProfileId={user?.id ?? null}
            currentWalletAddress={user?.walletAddress ?? null}
            onAuthRequired={() => setShowSignup(true)}
            feedType="explore"
          />
        </main>

        {/* RIGHT PANEL */}
        <aside className="hidden lg:block w-80 p-6 space-y-6">
          <FollowItem
            currentProfileId={null}
            onAuthRequired={() => setShowSignup(true)}
          />

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h3 className="font-semibold mb-3">Trends</h3>
            <p className="text-sm text-gray-600">#Solana</p>
            <p className="text-sm text-gray-600">#Web3</p>
            <p className="text-sm text-gray-600">#Hackathon</p>
          </div>
        </aside>

        <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} />
      </div>
    </div>
  );
};

export default Index;

/* --- Small Components --- */

const SidebarItem = ({ icon, label }: any) => (
  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition">
    {icon}
    <span>{label}</span>
  </div>
);

