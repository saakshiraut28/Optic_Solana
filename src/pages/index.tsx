/** @format */

import { useState } from "react";
import { Home, Search, Bell, User, PlusSquare } from "lucide-react";
import SignupModal from "@/components/SignupModal";

const Index = () => {
  const [open, setOpen] = useState(false);

  const mockPosts = [
    {
      id: 1,
      name: "Saakshi",
      handle: "@saak",
      content: "Building something cool with Tapestry 🚀",
    },
    {
      id: 2,
      name: "Sol Dev",
      handle: "@soldev",
      content: "Solana dev ecosystem is evolving fast.",
    },
  ];

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
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
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

const PostCard = ({ post }: any) => {
  const [agreed, setAgreed] = useState<boolean | null>(null);
  const [showDisagreeForm, setShowDisagreeForm] = useState(false);
  const [reason, setReason] = useState("");

  const handleAgree = () => {
    setAgreed(true);
    setShowDisagreeForm(false);
  };

  const handleDisagree = () => {
    setAgreed(false);
    setShowDisagreeForm(true);
  };

  const submitReason = () => {
    console.log("Disagree reason:", reason);
    setShowDisagreeForm(false);
  };

  return (
    <div className="p-4 border-b border-gray-200 hover:bg-gray-50 transition">
      <div className="font-semibold">{post.name}</div>
      <div className="text-sm text-gray-500">{post.handle}</div>
      <p className="mt-2 text-gray-800">{post.content}</p>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleAgree}
          className={`px-4 py-1 rounded-full text-sm border transition ${
            agreed === true
              ? "bg-green-500 text-white border-green-500"
              : "border-gray-300 hover:bg-green-50 text-white"
          }`}
        >
          👍 Agree
        </button>

        <button
          onClick={handleDisagree}
          className={`px-4 py-1 rounded-full bg-red-500 text-sm border transition ${
            agreed === false
              ? "bg-red-500 text-white border-red-500"
              : "border-gray-300 hover:bg-red-50  text-white"
          }`}
        >
          👎 Disagree
        </button>
      </div>

      {/* DISAGREE FORM */}
      {showDisagreeForm && (
        <div className="mt-4 bg-gray-100 p-3 rounded-lg">
          <textarea
            placeholder="Why do you disagree?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full resize-none outline-none bg-transparent text-sm"
            rows={2}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={submitReason}
              className="text-sm bg-black text-white px-4 py-1 rounded-full"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};