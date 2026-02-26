/** @format */
import { useEffect, useState } from "react";
import {
  Pencil,
  ArrowLeft,
  Link as LinkIcon,
  Calendar,
  Grid3X3,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import useAuthStore from "@/hooks/useAuthStore";
import LeftSidebar from "@/components/LeftSidebar";
import WhoToFollow from "@/components/FollowItem";
import SignupModal from "@/components/SignupModal";

const api = axios.create({ baseURL: "http://localhost:3000/api" });

interface TapestryProfile {
  id: string;
  username: string;
  bio?: string;
  image?: string;
  website?: string;
  created_at?: number;
  followers?: number;
  following?: number;
}

interface TapestryPost {
  authorProfile: { id: string; username: string; image?: string };
  content: {
    id: string;
    text?: string;
    proofUrl?: string;
    created_at: number;
  };
  socialCounts: { likeCount: number; commentCount: number };
}

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [showSignup, setShowSignup] = useState(false);
  const [profile, setProfile] = useState<TapestryProfile | null>(null);
  const [posts, setPosts] = useState<TapestryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    bio: "",
    profileImage: "",
    website: "",
  });

  // Fetch profile
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/profile/${user.id}`);
        const raw = res.data.data;
        setProfile({
          ...raw.profile,
          bio: raw.profile?.bio ?? "",
          image: raw.profile?.image ?? "",
          website: raw.profile?.website ?? "",
          followers: raw.socialCounts?.followers ?? 0,
          following: raw.socialCounts?.following ?? 0,
        });
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  // Fetch user posts
  useEffect(() => {
    if (!user?.id) {
      setPostsLoading(false);
      return;
    }
    const load = async () => {
      setPostsLoading(true);
      try {
        const res = await api.get(`/posts/user/${user.id}`);
        setPosts(res.data.data ?? []);
      } catch {
        /* silent */
      } finally {
        setPostsLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const openEdit = () => {
    setDraft({
      bio: profile?.bio ?? "",
      profileImage: profile?.image ?? "",
      website: profile?.website ?? "",
    });
    setSaveError(null);
    setEditing(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setDraft({ ...draft, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setSaveError(null);
    try {
      await api.put("/profile/update", { id: user.id, ...draft });
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              bio: draft.bio,
              image: draft.profileImage,
              website: draft.website,
            }
          : prev,
      );
      setUser({
        ...user,
        bio: draft.bio,
        profileImage: draft.profileImage,
        website: draft.website,
      });
      setEditing(false);
    } catch {
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (profile?.username ?? user?.username ?? "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex w-screen min-h-screen bg-gray-50">
      <div className="mx-auto flex">
        {/* LEFT SIDEBAR */}
        <LeftSidebar />

        {/* CENTER COLUMN */}
        <main className="flex-1 w-[600px] border-x border-gray-200 bg-white min-h-screen">
          {/* Sticky header */}
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center gap-4">
            <Link
              to="/"
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="font-bold text-base leading-tight">
                {profile?.username ?? user?.username ?? "Profile"}
              </p>
              <p className="text-xs text-gray-500">{posts.length} posts</p>
            </div>
          </header>

          {/* Not logged in */}
          {!user && !loading && (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8 gap-4">
              <p className="text-gray-500 text-sm">
                Sign in to view your profile.
              </p>
              <button
                onClick={() => setShowSignup(true)}
                className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-900 transition"
              >
                Sign up / Sign in
              </button>
            </div>
          )}

          {/* Profile content */}
          {user && (
            <>
              {/* BANNER */}
              <div className="h-40 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
                <button
                  onClick={openEdit}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 hover:bg-black/80 text-white text-xs rounded-full backdrop-blur-sm border border-white/20 transition"
                >
                  <Pencil size={12} />
                  Edit profile
                </button>
              </div>

              {/* AVATAR ROW */}
              <div className="px-4 -mt-10 mb-1">
                <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                  {loading ? (
                    <div className="w-full h-full bg-gray-200 animate-pulse" />
                  ) : profile?.image ? (
                    <img
                      src={profile.image}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-500">
                      {initials}
                    </span>
                  )}
                </div>
              </div>

              {/* PROFILE INFO */}
              <div className="px-4 pb-3">
                {loading ? (
                  <div className="space-y-2 animate-pulse mt-2">
                    <div className="h-5 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-100 rounded w-20" />
                    <div className="h-3 bg-gray-100 rounded w-48 mt-3" />
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl font-bold leading-tight mt-1">
                      {profile?.username}
                    </h1>
                    <p className="text-gray-500 text-sm">@{profile?.id}</p>

                    {profile?.bio && (
                      <p className="mt-2 text-sm text-gray-800 leading-relaxed">
                        {profile.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {profile?.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                        >
                          <LinkIcon size={11} />
                          {profile.website.replace(/https?:\/\//, "")}
                        </a>
                      )}
                      {profile?.created_at && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar size={11} />
                          Joined{" "}
                          {new Date(profile.created_at).toLocaleDateString(
                            "en-US",
                            { month: "long", year: "numeric" },
                          )}
                        </span>
                      )}
                    </div>

                    {/* FOLLOW COUNTS */}
                    <div className="flex gap-5 mt-3">
                      <span className="text-sm hover:underline cursor-pointer">
                        <span className="font-bold">
                          {profile?.following ?? 0}
                        </span>
                        <span className="text-gray-500 ml-1">Following</span>
                      </span>
                      <span className="text-sm hover:underline cursor-pointer">
                        <span className="font-bold">
                          {profile?.followers ?? 0}
                        </span>
                        <span className="text-gray-500 ml-1">Followers</span>
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* TABS */}
              <div className="flex border-b border-gray-200">
                <div className="flex-1 py-3 text-sm font-semibold text-center relative">
                  Posts
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-black rounded-full" />
                </div>
              </div>

              {/* POSTS */}
              {postsLoading ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-50 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                  <Grid3X3 size={36} className="text-gray-200 mb-3" />
                  <p className="font-bold text-lg">No posts yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    When you post something, it'll show up here.
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.content.id}
                    className="px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">
                        {post.authorProfile.username}
                      </span>
                      <span className="text-gray-400 text-sm">
                        @{post.authorProfile.id}
                      </span>
                      <span className="text-gray-300 text-xs ml-auto">
                        {new Date(post.content.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {post.content.text ?? "—"}
                    </p>
                    {post.content.proofUrl && (
                      <a
                        href={post.content.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
                      >
                        <LinkIcon size={11} /> View Proof
                      </a>
                    )}
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-gray-400">
                        👍 {post.socialCounts.likeCount}
                      </span>
                      <span className="text-xs text-gray-400">
                        👎 {post.socialCounts.commentCount}
                      </span>
                    </div>
                  </div>
                ))
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

      {/* EDIT MODAL */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setEditing(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <button
                onClick={() => setEditing(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ArrowLeft size={16} />
              </button>
              <p className="font-bold text-sm">Edit profile</p>
              <button
                onClick={handleSubmit as any}
                disabled={saving}
                className="bg-black text-white text-sm px-4 py-1.5 rounded-full hover:bg-gray-900 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            {/* Banner + avatar preview */}
            <div className="h-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
            <div className="px-4 -mt-8 mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-gray-200 flex items-center justify-center">
                {draft.profileImage ? (
                  <img
                    src={draft.profileImage}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-gray-500">
                    {initials}
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-medium">Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  placeholder="Tell the world about yourself..."
                  value={draft.bio}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">
                  Profile Image URL
                </label>
                <input
                  name="profileImage"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={draft.profileImage}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">
                  Website
                </label>
                <input
                  name="website"
                  type="url"
                  placeholder="https://yoursite.com"
                  value={draft.website}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              {saveError && <p className="text-xs text-red-500">{saveError}</p>}
            </form>
          </div>
        </div>
      )}

      <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} />
    </div>
  );
};

export default Profile;
