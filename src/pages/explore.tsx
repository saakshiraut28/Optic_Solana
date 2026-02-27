/** @format */
import { useEffect, useState, useRef } from "react";
import { Search, Link as LinkIcon, X } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import useAuthStore from "@/hooks/useAuthStore";
import LeftSidebar from "@/components/LeftSidebar";
import WhoToFollow from "@/components/FollowItem";
import SignupModal from "@/components/SignupModal";

interface SearchedProfile {
  id: string;
  username: string;
  image?: string;
  bio?: string;
}

interface TapestryPost {
  authorProfile: { id: string; username: string; image?: string };
  content: {
    id: string;
    text?: string;
    proofUrl?: string;
    proofType?: string;
    created_at: number;
  };
  socialCounts: { likeCount: number; commentCount: number };
}

const Explore = () => {
  const user = useAuthStore((state) => state.user);

  const [showSignup, setShowSignup] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchedProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [posts, setPosts] = useState<TapestryPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch explore posts on mount
  useEffect(() => {
    const load = async () => {
      setPostsLoading(true);
      try {
        const res = await api.get("/posts/feed/explore", {
          params: { page: 1, pageSize: 20 },
        });
        const newPosts = res.data.data?.contents ?? [];
        setPosts(newPosts);
        setHasMore(newPosts.length === 20);
      } catch {
        /* silent */
      } finally {
        setPostsLoading(false);
      }
    };
    load();
  }, []);

  // Load more posts
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await api.get("/posts/feed/explore", {
        params: { page: next, pageSize: 20 },
      });
      const newPosts = res.data.data?.contents ?? [];
      setPosts((prev) => [...prev, ...newPosts]);
      setHasMore(newPosts.length === 20);
      setPage(next);
    } catch {
      /* silent */
    } finally {
      setLoadingMore(false);
    }
  };

  // Debounced search
  const handleSearch = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get("/search", {
          params: { query: val.trim(), limit: 8 },
        });
        const profiles = res.data.data?.profiles ?? res.data.data ?? [];
        setSearchResults(
          profiles.map((p: any) => ({
            id: p.profile?.id ?? p.id,
            username: p.profile?.username ?? p.username,
            image: p.profile?.image ?? p.image,
            bio: p.profile?.bio ?? p.bio,
          })),
        );
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
  };

  return (
    <div className="flex w-screen min-h-screen bg-gray-50">
      <div className="mx-auto flex">
        {/* LEFT SIDEBAR */}
        <LeftSidebar />

        {/* CENTER COLUMN */}
        <main className="flex-1 w-[600px] border-x border-gray-200 bg-white min-h-screen">
          {/* Sticky search header */}
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search people..."
                className="w-full bg-gray-100 rounded-full pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </header>

          {/* SEARCH RESULTS */}
          {query && (
            <div className="border-b border-gray-200">
              {searching ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="space-y-1 flex-1">
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                        <div className="h-2 bg-gray-100 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  No users found for "{query}"
                </div>
              ) : (
                searchResults.map((profile) => (
                  <Link
                    to={`/profile/${profile.id}`}
                    key={profile.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {profile.image ? (
                        <img
                          src={profile.image}
                          alt={profile.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-gray-500">
                          {profile.username?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {profile.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        @{profile.id}
                      </p>
                      {profile.bio && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* SECTION TITLE */}
          {!query && (
            <div className="px-4 pt-4 pb-2">
              <p className="font-bold text-lg">Explore</p>
              <p className="text-sm text-gray-400">See what's happening</p>
            </div>
          )}

          {/* ALL POSTS */}
          {postsLoading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gray-200" />
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-24" />
                      <div className="h-2 bg-gray-100 rounded w-16" />
                    </div>
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <div
                  key={post.content.id}
                  className="px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  {/* Author row */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {post.authorProfile.image ? (
                        <img
                          src={post.authorProfile.image}
                          alt={post.authorProfile.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-gray-500">
                          {post.authorProfile.username?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-sm">
                        {post.authorProfile.username}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">
                        @{post.authorProfile.id}
                      </span>
                    </div>
                    <span className="ml-auto text-xs text-gray-300">
                      {new Date(post.content.created_at).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {post.content.text ?? "—"}
                  </p>

                  {/* Proof badge */}
                  {post.content.proofUrl && (
                    <a
                      href={post.content.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
                    >
                      <LinkIcon size={11} /> View Proof
                    </a>
                  )}

                  {/* Counts */}
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-gray-400">
                      👍 {post.socialCounts.likeCount}
                    </span>
                    <span className="text-xs text-gray-400">
                      👎 {post.socialCounts.commentCount}
                    </span>
                  </div>
                </div>
              ))}

              {/* Load more */}
              {hasMore && (
                <div className="p-4 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="text-sm text-gray-500 hover:text-black underline disabled:opacity-40"
                  >
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden lg:block w-80 p-6 space-y-4">
          <WhoToFollow
            currentProfileId={user?.id ?? null}
            onAuthRequired={() => setShowSignup(true)}
          />
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-sm mb-3">Trends</h3>
            <p className="text-sm text-gray-600 py-1">#Solana</p>
            <p className="text-sm text-gray-600 py-1">#Web3</p>
            <p className="text-sm text-gray-600 py-1">#Hackathon</p>
          </div>
        </aside>
      </div>

      <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} />
    </div>
  );
};

export default Explore;
