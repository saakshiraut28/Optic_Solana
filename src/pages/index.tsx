/** @format */

import { useState } from "react";
import { Home, Search, Bell, User } from "lucide-react";
import SignupModal from "@/components/SignupModal";
import Feed from "@/components/PostCard";

const Index = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-screen justify-centered min-h-screen bg-gray-50">
      <div className="mx-20 mx-auto flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden md:flex w-64 flex-col justify-between border-r border-gray-200 p-6 bg-white">
          <div className="space-y-6">
            <h1 className="text-2xl font-black">Optic</h1>

            <nav className="space-y-4 text-gray-700">
              <SidebarItem icon={<Home size={20} />} label="Home" />
              <SidebarItem icon={<Search size={20} />} label="Explore" />
              <SidebarItem icon={<Bell size={20} />} label="Notifications" />
              <SidebarItem icon={<User size={20} />} label="Profile" />
            </nav>
          </div>

          <div className="text-sm text-gray-500">© 2026 YourApp</div>
        </aside>

        {/* CENTER FEED */}
        <main className="flex-1 w-xl border-r border-gray-200 bg-white">
          {/* Feed Header */}
          <div className="sticky top-0 flex justify-between items-center bg-white p-4 border-b border-gray-200">
            <p className="text-xl font-black">Home</p>
            <button
              onClick={() => setOpen(true)}
              className="w-content bg-black text-white py-2.5 rounded-full hover:bg-gray-900 transition"
            >
              Sign up
            </button>
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
            currentProfileId={null}
            currentWalletAddress={null}
            onAuthRequired={() => setOpen(true)}
            feedType="explore" // or "home" for following feed
          />
        </main>

        {/* RIGHT PANEL */}
        <aside className="hidden lg:block w-80 p-6 space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h3 className="font-semibold mb-3">Who to follow</h3>
            <FollowItem name="Web3 Builder" handle="@web3" />
            <FollowItem name="Solana Dev" handle="@solana" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h3 className="font-semibold mb-3">Trends</h3>
            <p className="text-sm text-gray-600">#Solana</p>
            <p className="text-sm text-gray-600">#Web3</p>
            <p className="text-sm text-gray-600">#Hackathon</p>
          </div>
        </aside>

        <SignupModal isOpen={open} onClose={() => setOpen(false)} />
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

const FollowItem = ({ name, handle }: any) => (
  <div className="flex justify-between items-center mb-3">
    <div>
      <p className="font-medium text-sm">{name}</p>
      <p className="text-xs text-gray-500">{handle}</p>
    </div>
    <button className="text-xs bg-black text-white px-3 py-1 rounded-full">
      Follow
    </button>
  </div>
);