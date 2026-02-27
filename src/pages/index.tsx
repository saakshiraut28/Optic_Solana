/** @format */
import { useState } from "react";
import { Link2, Image, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import api from "@/lib/api";
import LeftSidebar from "@/components/LeftSidebar";
import SignupModal from "@/components/SignupModal";
import Feed from "@/components/PostCard";
import WhoToFollow from "@/components/FollowItem";
import useAuthStore from "@/hooks/useAuthStore";

const Index = () => {
  const [showSignup, setShowSignup] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // ── Composer state ──
  const [content, setContent] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofMedia, setProofMedia] = useState("");
  const [proofCitation, setProofCitation] = useState("");
  const [showProofFields, setShowProofFields] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    status: string;
    score: number;
    reason: string;
  } | null>(null);
  const [feedKey, setFeedKey] = useState(0); // increment to force feed refresh

  const canPost = !!user && content.trim().length > 0;

  const handlePost = async () => {
    if (!canPost || posting || verifying) return;
    setPostError(null);

    // ── Step 1: AI verification ──
    setVerifying(true);
    try {
      const verifyRes = await api.post("/verify", {
        content: content.trim(),
        ...(proofUrl && { proofUrl: proofUrl.trim() }),
        ...(proofMedia && { proofMedia: proofMedia.trim() }),
        ...(proofCitation && { proofCitation: proofCitation.trim() }),
      });

      if (!verifyRes.data.approved) {
        setVerifyResult({
          status: verifyRes.data.status,
          score: verifyRes.data.score,
          reason: verifyRes.data.reason,
        });
        setVerifying(false);
        return;
      }
      // Approved — store result to show badge
      setVerifyResult({
        status: verifyRes.data.status,
        score: verifyRes.data.score,
        reason: verifyRes.data.reason,
      });
    } catch {
      // If verification request itself fails, allow post through
    } finally {
      setVerifying(false);
    }

    // ── Step 2: Submit post ──
    setPosting(true);
    try {
      const proofType = proofUrl
        ? "link"
        : proofMedia
          ? "media"
          : proofCitation
            ? "citation"
            : "none";

      await api.post("/posts", {
        profileId: user.id,
        content: content.trim(),
        proofType,
        ...(proofUrl && { proofUrl: proofUrl.trim() }),
        ...(proofMedia && { proofMedia: proofMedia.trim() }),
        ...(proofCitation && { proofCitation: proofCitation.trim() }),
      });

      // Reset composer
      setContent("");
      setProofUrl("");
      setProofMedia("");
      setProofCitation("");
      setShowProofFields(false);
      setVerifyResult(null);

      // Refresh the feed
      setFeedKey((k) => k + 1);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.error ??
        err?.response?.data?.error ??
        "Failed to post.";
      setPostError(typeof msg === "string" ? msg : "Failed to post.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="flex w-screen justify-centered min-h-screen bg-gray-50">
      <div className="mx-20 mx-auto flex">
        {/* LEFT SIDEBAR */}
        <LeftSidebar />

        {/* CENTER FEED */}
        <main className="flex-1 w-xl border-r border-gray-200 bg-white">
          {/* Feed Header */}
          <div className="sticky top-0 flex justify-between items-center bg-white p-4 border-b border-gray-200 z-10">
            <p className="text-xl font-black">Home</p>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">@{user.username}</span>
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
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-900 transition text-sm"
              >
                Sign up
              </button>
            )}
          </div>

          {/* ── COMPOSER ── */}
          <div className="p-4 border-b border-gray-200">
            {!user ? (
              // Logged out — prompt to sign in
              <div
                onClick={() => setShowSignup(true)}
                className="w-full text-gray-400 text-sm cursor-pointer py-2 hover:text-gray-600 transition"
              >
                Sign in to post your take with proof...
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-500">
                    {user.username?.[0]?.toUpperCase()}
                  </div>

                  {/* Text area */}
                  <div className="flex-1">
                    <textarea
                      placeholder="What's your take? Back it up with proof."
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        setVerifyResult(null);
                        setPostError(null);
                      }}
                      className="w-full resize-none border-none outline-none text-base placeholder-gray-400"
                      rows={2}
                    />

                    {/* PROOF FIELDS — toggle */}
                    {showProofFields && (
                      <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                        {/* Proof URL */}
                        <div className="flex items-center gap-2">
                          <Link2
                            size={14}
                            className="text-blue-400 flex-shrink-0"
                          />
                          <input
                            type="url"
                            placeholder="Proof link (e.g. https://source.com)"
                            value={proofUrl}
                            onChange={(e) => setProofUrl(e.target.value)}
                            className="flex-1 text-sm outline-none border-b border-gray-200 pb-1 focus:border-black transition"
                          />
                        </div>

                        {/* Proof Media */}
                        <div className="flex items-center gap-2">
                          <Image
                            size={14}
                            className="text-green-400 flex-shrink-0"
                          />
                          <input
                            type="url"
                            placeholder="Image URL (e.g. https://cdn.com/image.jpg)"
                            value={proofMedia}
                            onChange={(e) => setProofMedia(e.target.value)}
                            className="flex-1 text-sm outline-none border-b border-gray-200 pb-1 focus:border-black transition"
                          />
                        </div>

                        {/* Proof Citation */}
                        <div className="flex items-center gap-2">
                          <BookOpen
                            size={14}
                            className="text-purple-400 flex-shrink-0"
                          />
                          <input
                            type="text"
                            placeholder="Citation (e.g. NASA Report, 2024)"
                            value={proofCitation}
                            onChange={(e) => setProofCitation(e.target.value)}
                            className="flex-1 text-sm outline-none border-b border-gray-200 pb-1 focus:border-black transition"
                          />
                        </div>
                      </div>
                    )}

                    {/* Verification result */}
                    {verifyResult && (
                      <div
                        className={`mt-3 p-3 rounded-xl text-xs border ${
                          ["False", "Misleading", "Rejected"].includes(
                            verifyResult.status,
                          )
                            ? "bg-red-50 border-red-200 text-red-700"
                            : verifyResult.status === "Unverified"
                              ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                              : "bg-green-50 border-green-200 text-green-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">
                            {verifyResult.status}
                          </span>
                          <span className="font-bold">
                            Score: {verifyResult.score}/100
                          </span>
                        </div>
                        <p>{verifyResult.reason}</p>
                      </div>
                    )}

                    {/* Post error */}
                    {postError && (
                      <p className="mt-2 text-xs text-red-500">{postError}</p>
                    )}

                    {/* Action row */}
                    <div className="flex items-center justify-between mt-3">
                      {/* Toggle proof fields */}
                      <button
                        onClick={() => setShowProofFields((p) => !p)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-black transition"
                      >
                        {showProofFields ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                        {showProofFields ? "Hide proof fields" : "Add proof"}
                      </button>

                      {/* Char count + Post button */}
                      <div className="flex items-center gap-3">
                        {content.length > 0 && (
                          <span
                            className={`text-xs ${content.length > 280 ? "text-red-400" : "text-gray-300"}`}
                          >
                            {content.length}/280
                          </span>
                        )}
                        <button
                          onClick={handlePost}
                          disabled={
                            !canPost ||
                            posting ||
                            verifying ||
                            content.length > 280
                          }
                          className="bg-black text-white px-4 py-1.5 rounded-full text-sm hover:bg-gray-900 transition disabled:opacity-40"
                        >
                          {verifying
                            ? "Checking..."
                            : posting
                              ? "Posting..."
                              : "Post"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* FEED — key forces remount/refetch when new post is submitted */}
          <Feed
            key={feedKey}
            currentProfileId={user?.id ?? null}
            currentWalletAddress={user?.walletAddress ?? null}
            onAuthRequired={() => setShowSignup(true)}
            feedType="explore"
          />
        </main>

        {/* RIGHT PANEL */}
        <aside className="hidden lg:block w-80 p-6 space-y-6">
          <WhoToFollow
            currentProfileId={user?.id ?? null}
            onAuthRequired={() => setShowSignup(true)}
          />
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h3 className="font-semibold mb-3 text-sm">Trends</h3>
            <p className="text-sm text-gray-600 py-1">#Solana</p>
            <p className="text-sm text-gray-600 py-1">#Web3</p>
            <p className="text-sm text-gray-600 py-1">#Hackathon</p>
          </div>
        </aside>

        <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} />
      </div>
    </div>
  );
};

export default Index;
