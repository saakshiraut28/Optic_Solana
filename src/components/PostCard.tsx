/** @format */
import { useEffect, useState } from "react";
import api from "@/lib/api";

// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
interface TapestryPost {
  authorProfile: {
    id: string;
    username: string;
    image?: string;
    bio?: string;
  };
  content: {
    id: string;
    text?: string;
    proofType?: string;
    proofUrl?: string;
    proofMedia?: string;
    proofCitation?: string;
    postType?: string;
    created_at: number;
  };
  socialCounts: {
    likeCount: number;
    commentCount: number;
  };
}

interface Disagreement {
  comment: {
    id: string;
    text: string;
    proofUrl?: string;
    proofCitation?: string;
    created_at: number;
  };
  author: { id: string; username: string };
  socialCounts: { likeCount: number };
}

interface FeedProps {
  currentProfileId: string | null; // null = logged out
  currentWalletAddress: string | null; // null = logged out
  onAuthRequired: () => void; // open login/signup modal
  feedType?: "explore" | "home"; // default: explore
}

// ─────────────────────────────────────────────
//  SINGLE POST CARD
// ─────────────────────────────────────────────
function PostCard({
  post,
  currentProfileId,
  onAuthRequired,
}: {
  post: TapestryPost;
  currentProfileId: string | null;
  onAuthRequired: () => void;
}) {
  const isLoggedIn = !!currentProfileId;

  const [agreed, setAgreed] = useState<boolean | null>(null);
  const [showDisagreeForm, setShowDisagreeForm] = useState(false);
  const [showDisagreements, setShowDisagreements] = useState(false);
  const [reason, setReason] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [agreeCount, setAgreeCount] = useState(
    post.socialCounts.likeCount ?? 0,
  );
  const [disagreeCount, setDisagreeCount] = useState(
    post.socialCounts.commentCount ?? 0,
  );
  const [disagreements, setDisagreements] = useState<Disagreement[]>([]);
  const [loadingDisagreements, setLoadingDisagreements] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if logged-in user already agreed
  useEffect(() => {
    if (!isLoggedIn) return;
    api
      .get("/agree/check", {
        params: { profileId: currentProfileId, postId: post.content.id },
      })
      .then((res) => setAgreed(res.data.data?.liked ?? null))
      .catch(() => setAgreed(null));
  }, [post.content.id, currentProfileId, isLoggedIn]);

  const fetchDisagreements = async () => {
    if (loadingDisagreements) return;
    setLoadingDisagreements(true);
    try {
      const res = await api.get(`/disagree/${post.content.id}`, {
        params: { page: 1, pageSize: 20 },
      });
      setDisagreements(res.data.data?.comments ?? []);
    } catch {
      /* silent */
    } finally {
      setLoadingDisagreements(false);
    }
  };

  const toggleDisagreements = () => {
    if (!showDisagreements && disagreements.length === 0) fetchDisagreements();
    setShowDisagreements((prev) => !prev);
  };

  // AGREE
  const handleAgree = async () => {
    if (!isLoggedIn) return onAuthRequired();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      if (agreed === true) {
        await api.delete("/agree", {
          data: { profileId: currentProfileId, postId: post.content.id },
        });
        setAgreed(null);
        setAgreeCount((c) => Math.max(0, c - 1));
      } else {
        await api.post("/agree", {
          profileId: currentProfileId,
          postId: post.content.id,
        });
        api
          .post("/notifications/agree", {
            recipientWalletAddress: post.authorProfile.id,
            actorProfileId: currentProfileId,
            postId: post.content.id,
          })
          .catch(() => {});
        setAgreed(true);
        setAgreeCount((c) => c + 1);
        setShowDisagreeForm(false);
      }
    } catch {
      setError("Failed to register your agreement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // DISAGREE — open form
  const handleDisagree = async () => {
    if (!isLoggedIn) return onAuthRequired();
    if (loading) return;
    if (agreed === true) {
      try {
        await api.delete("/agree", {
          data: { profileId: currentProfileId, postId: post.content.id },
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

  // SUBMIT DISAGREE
  const submitDisagree = async () => {
    if (!reason.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/disagree", {
        profileId: currentProfileId,
        postId: post.content.id,
        reason: reason.trim(),
        ...(proofUrl.trim() && { proofUrl: proofUrl.trim() }),
      });

      api
        .post("/notifications/disagree", {
          recipientWalletAddress: post.authorProfile.id,
          actorProfileId: currentProfileId,
          postId: post.content.id,
          commentId: res.data.data?.id,
        })
        .catch(() => {});

      if (showDisagreements) {
        setDisagreements((prev) => [
          {
            comment: {
              id: res.data.data?.id ?? `temp-${Date.now()}`,
              text: reason.trim(),
              proofUrl: proofUrl.trim() || undefined,
              created_at: Date.now(),
            },
            author: { id: currentProfileId!, username: currentProfileId! },
            socialCounts: { likeCount: 0 },
          },
          ...prev,
        ]);
      }

      setAgreed(false);
      setShowDisagreeForm(false);
      setReason("");
      setProofUrl("");
      setDisagreeCount((c) => c + 1);
    } catch {
      setError("Failed to submit your disagreement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 hover:bg-gray-50 transition">
      {/* AUTHOR */}
      <div className="flex items-center gap-2 mb-2">
        {post.authorProfile.image && (
          <img
            src={post.authorProfile.image}
            alt={post.authorProfile.username}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
        <div>
          <div className="font-semibold text-sm">
            {post.authorProfile.username}
          </div>
          <div className="text-xs text-gray-400">@{post.authorProfile.id}</div>
        </div>
        <span className="ml-auto text-xs text-gray-300">
          {new Date(post.content.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* CONTENT */}
      <p className="text-gray-800 text-sm">{post.content.text ?? "—"}</p>

      {/* PROOF IMAGE — render if proofMedia is a direct image URL */}
      {post.content.proofMedia && (
        <img
          src={post.content.proofMedia}
          alt="Proof"
          className="mt-3 rounded-2xl border border-gray-100 max-h-80 w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}

      {/* PROOF LINK */}
      {post.content.proofUrl && (
        <a
          href={post.content.proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-blue-500 hover:underline break-all"
        >
          🔗 {post.content.proofUrl}
        </a>
      )}

      {/* PROOF MEDIA LINK — if proofMedia exists but image fails to load, show as link */}
      {post.content.proofMedia &&
        !post.content.proofMedia.match(
          /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i,
        ) && (
          <a
            href={post.content.proofMedia}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
          >
            🖼️ View Media
          </a>
        )}

      {/* PROOF CITATION */}
      {post.content.proofCitation && (
        <p className="mt-1 text-xs text-gray-400 italic">
          📚 {post.content.proofCitation}
        </p>
      )}

      {/* ERROR */}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={handleAgree}
          disabled={loading}
          title={!isLoggedIn ? "Sign in to agree" : undefined}
          className={`flex items-center gap-1 px-4 py-1 rounded-full text-sm border transition disabled:opacity-50 ${
            agreed === true
              ? "bg-green-500 text-white border-green-500"
              : "border-gray-300 hover:bg-green-50 text-gray-700"
          }`}
        >
          👍 Agree <span className="text-xs font-medium">{agreeCount}</span>
        </button>

        <button
          onClick={handleDisagree}
          disabled={loading}
          title={!isLoggedIn ? "Sign in to disagree" : undefined}
          className={`flex items-center gap-1 px-4 py-1 rounded-full text-sm border transition disabled:opacity-50 ${
            agreed === false
              ? "bg-red-500 text-white border-red-500"
              : "border-gray-300 hover:bg-red-50 text-gray-700"
          }`}
        >
          👎 Disagree{" "}
          <span className="text-xs font-medium">{disagreeCount}</span>
        </button>

        {disagreeCount > 0 && (
          <button
            onClick={toggleDisagreements}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline"
          >
            {showDisagreements ? "Hide" : "View"} disagreements
          </button>
        )}
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

      {/* DISAGREEMENTS LIST */}
      {showDisagreements && (
        <div className="mt-3 space-y-3">
          {loadingDisagreements ? (
            <p className="text-xs text-gray-400">Loading disagreements...</p>
          ) : disagreements.length === 0 ? (
            <p className="text-xs text-gray-400">No disagreements yet.</p>
          ) : (
            disagreements.map((d) => (
              <div
                key={d.comment.id}
                className="bg-red-50 border border-red-100 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-700">
                    @{d.author.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(d.comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{d.comment.text}</p>
                {d.comment.proofUrl && (
                  <a
                    href={d.comment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-xs text-blue-500 hover:underline block truncate"
                  >
                    🔗 {d.comment.proofUrl}
                  </a>
                )}
                {d.comment.proofCitation && (
                  <p className="mt-1 text-xs text-gray-500 italic">
                    📚 {d.comment.proofCitation}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  FEED — fetches posts and renders PostCards
// ─────────────────────────────────────────────
export default function Feed({
  currentProfileId,
  // @ts-ignore
  currentWalletAddress,
  onAuthRequired,
  feedType = "explore",
}: FeedProps) {
  const [allPosts, setAllPosts] = useState<TapestryPost[]>([]); // all fetched posts globally sorted
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const [fetchedAll, setFetchedAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  // Slice from globally sorted array for display
  const posts = allPosts.slice(0, page * PAGE_SIZE);
  const hasMore = posts.length < allPosts.length;

  const fetchPosts = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch a large batch, sort globally by created_at desc, paginate client-side
      const res =
        feedType === "home" && currentProfileId
          ? await api.get("/posts/feed/home", {
              params: { profileId: currentProfileId, pageSize: 100 },
            })
          : await api.get("/posts/feed/explore", {
              params: { page: 1, pageSize: 100 },
            });
      const fetched: TapestryPost[] =
        res.data.data?.contents ?? res.data.data ?? [];

      // Global sort — newest first
      const sorted = [...fetched].sort(
        (a, b) => b.content.created_at - a.content.created_at,
      );

      setAllPosts(sorted);
      setFetchedAll(true);
    } catch {
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when feedType/currentProfileId changes
  useEffect(() => {
    setPage(1);
    setAllPosts([]);
    setFetchedAll(false);
    fetchPosts();
  }, [feedType, currentProfileId]);

  const loadMore = () => setPage((p) => p + 1);

  return (
    <div className="max-w-xl mx-auto">
      {/* LOADING SKELETON */}
      {loading && posts.length === 0 && (
        <div className="space-y-4 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="p-4 text-sm text-red-500 text-center">{error}</div>
      )}

      {/* POSTS */}
      {posts.map((post) => (
        <PostCard
          key={post.content.id}
          post={post}
          currentProfileId={currentProfileId}
          onAuthRequired={onAuthRequired}
        />
      ))}

      {/* EMPTY STATE */}
      {!loading && posts.length === 0 && !error && (
        <div className="p-8 text-center text-gray-400 text-sm">
          No posts yet. Be the first to post!
        </div>
      )}

      {/* LOAD MORE */}
      {hasMore && !loading && posts.length > 0 && (
        <div className="p-4 text-center">
          <button
            onClick={loadMore}
            className="text-sm text-gray-500 hover:text-black underline"
          >
            Load more
          </button>
        </div>
      )}

      {/* LOADING MORE INDICATOR */}
      {loading && posts.length > 0 && (
        <div className="p-4 text-center text-xs text-gray-400">Loading...</div>
      )}
    </div>
  );
}