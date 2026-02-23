/** @format */
import { useEffect, useState } from "react";
import axios from "axios";

// ─────────────────────────────────────────────
//  CONFIG — point this to your Express server
// ─────────────────────────────────────────────
const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
interface Post {
  id: string;
  name: string;
  handle: string;
  content: string;
  ownerWalletAddress: string; // needed to send notifications
}

interface PostCardProps {
  post: Post;
  currentProfileId: string; 
  currentWalletAddress: string; 
}

export default function PostCard({
  post,
  currentProfileId,
  currentWalletAddress,
}: PostCardProps) {
  const [agreed, setAgreed] = useState<boolean | null>(null);
  const [showDisagreeForm, setShowDisagreeForm] = useState(false);
  const [reason, setReason] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [agreeCount, setAgreeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── On mount: check if this user already agreed + get agree count ──
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        // Check if user has already agreed with this post
        const [checkRes, countRes] = await Promise.all([
          api.get("/agree/check", {
            params: { profileId: currentProfileId, postId: post.id },
          }),
          api.get(`/agree/${post.id}/count`),
        ]);

        setAgreed(checkRes.data.data?.liked ?? false);
        setAgreeCount(countRes.data.data?.count ?? 0);
      } catch {
        // If check fails (e.g. not found), default to null — user hasn't reacted yet
        setAgreed(null);
      }
    };

    fetchInitialState();
  }, [post.id, currentProfileId]);

  // ─────────────────────────────────────────────
  //  AGREE
  // ─────────────────────────────────────────────
  const handleAgree = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      if (agreed === true) {
        // Already agreed → remove agreement
        await api.delete("/agree", {
          data: { profileId: currentProfileId, postId: post.id },
        });
        setAgreed(null);
        setAgreeCount((c) => Math.max(0, c - 1));
      } else {
        // Not agreed yet → agree
        // If they had previously disagreed, the disagree form was a modal
        // so no extra cleanup needed here (disagrees are separate comments)
        await api.post("/agree", {
          profileId: currentProfileId,
          postId: post.id,
        });

        // Notify the post owner (fire and forget — don't block UI)
        api
          .post("/notifications/agree", {
            recipientWalletAddress: post.ownerWalletAddress,
            actorProfileId: currentProfileId,
            postId: post.id,
          })
          .catch(() => {}); // silent fail — notification is non-critical

        setAgreed(true);
        setAgreeCount((c) => c + 1);
        setShowDisagreeForm(false);
      }
    } catch (err: any) {
      setError("Failed to register your agreement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  //  DISAGREE — open the form
  //  If the user currently agrees, remove that first
  // ─────────────────────────────────────────────
  const handleDisagree = async () => {
    if (loading) return;

    // If user had agreed, silently remove it before showing disagree form
    if (agreed === true) {
      try {
        await api.delete("/agree", {
          data: { profileId: currentProfileId, postId: post.id },
        });
        setAgreed(null);
        setAgreeCount((c) => Math.max(0, c - 1));
      } catch {
        setError("Something went wrong. Please try again.");
        return;
      }
    }
    setShowDisagreeForm(true);
  };


  const submitDisagree = async () => {
    if (!reason.trim() || loading) return; 
    setLoading(true);
    setError(null);

    try {
      const disagreeRes = await api.post("/disagree", {
        profileId: currentProfileId,
        postId: post.id,
        reason: reason.trim(),
        ...(proofUrl.trim() && { proofUrl: proofUrl.trim() }),
      });

      // Notify the post owner
      api
        .post("/notifications/disagree", {
          recipientWalletAddress: post.ownerWalletAddress,
          actorProfileId: currentProfileId,
          postId: post.id,
          commentId: disagreeRes.data.data?.id,
        })
        .catch(() => {});

      setAgreed(false);
      setShowDisagreeForm(false);
      setReason("");
      setProofUrl("");
    } catch (err: any) {
      setError("Failed to submit your disagreement. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-4 border-b border-gray-200 hover:bg-gray-50 transition">
      <div className="font-semibold">{post.name}</div>
      <div className="text-sm text-gray-500">{post.handle}</div>
      <p className="mt-2 text-gray-800">{post.content}</p>

      {/* ERROR */}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleAgree}
          disabled={loading}
          className={`px-4 py-1 rounded-full text-sm border transition ${
            agreed === true
              ? "bg-green-500 text-white border-green-500"
              : "border-gray-300 hover:bg-green-50 text-gray-700"
          } disabled:opacity-50`}
        >
          👍 Agree{" "}
          {agreeCount > 0 && <span className="ml-1 text-xs">{agreeCount}</span>}
        </button>

        <button
          onClick={handleDisagree}
          disabled={loading}
          className={`px-4 py-1 rounded-full text-sm border transition ${
            agreed === false
              ? "bg-red-500 text-white border-red-500"
              : "border-gray-300 hover:bg-red-50 text-gray-700"
          } disabled:opacity-50`}
        >
          👎 Disagree
        </button>
      </div>

      {/* DISAGREE FORM */}
      {showDisagreeForm && (
        <div className="mt-4 bg-gray-100 p-3 rounded-lg space-y-2">
          <textarea
            placeholder="Why do you disagree? (required)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full resize-none outline-none bg-transparent text-sm"
            rows={2}
          />
          <input
            type="url"
            placeholder="Proof link (optional)"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            className="w-full outline-none bg-white border border-gray-200 rounded px-2 py-1 text-sm"
          />
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={() => {
                setShowDisagreeForm(false);
                setReason("");
                setProofUrl("");
              }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={submitDisagree}
              disabled={!reason.trim() || loading}
              className="text-sm bg-black text-white px-4 py-1 rounded-full disabled:opacity-40 transition"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
