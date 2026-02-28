/** @format */
import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Profile {
  id: string;
  username: string;
  image?: string;
  bio?: string;
}

interface WhoToFollowProps {
  currentProfileId: string | null;
  onAuthRequired: () => void;
}

export default function WhoToFollow({
  currentProfileId,
  onAuthRequired,
}: WhoToFollowProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  // @ts-ignore
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/profile");
        const allProfiles: Profile[] = (data.data?.profiles ?? []).map(
          (p: any) => ({
            id: p.profile.id,
            username: p.profile.username,
            image: p.profile.image || undefined,
            bio: p.profile.bio || undefined,
          }),
        );

        // Filter out the current user
        const candidates = allProfiles.filter((p) => p.id !== currentProfileId);

        if (!currentProfileId) {
          // Logged out — show a random handful
          setProfiles(shuffle(candidates).slice(0, 5));
          return;
        }

        // Logged in — check follow state for each candidate in parallel
        const followStates = await Promise.all(
          candidates.map((p) =>
            api
              .get("/follow/state", {
                params: { followerId: currentProfileId, targetId: p.id },
              })
              .then((res) => ({
                id: p.id,
                isFollowing: res.data.data?.isFollowing ?? false,
              }))
              .catch(() => ({ id: p.id, isFollowing: false })),
          ),
        );

        const alreadyFollowing = new Set(
          followStates.filter((s) => s.isFollowing).map((s) => s.id),
        );
        setFollowingIds(alreadyFollowing);
        setProfiles(
          shuffle(candidates.filter((p) => !alreadyFollowing.has(p.id))).slice(
            0,
            5,
          ),
        );
      } catch {
        // silent — widget is non-critical
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentProfileId]);

  const handleFollow = async (targetId: string) => {
    if (!currentProfileId) return onAuthRequired();
    if (pendingIds.has(targetId)) return;

    setPendingIds((prev) => new Set(prev).add(targetId));
    try {
      await api.post("/follow", {
        followerId: currentProfileId,
        targetId,
      });
      // Optimistically remove from the list
      setProfiles((prev) => prev.filter((p) => p.id !== targetId));
      setFollowingIds((prev) => new Set(prev).add(targetId));
    } catch {
      // silent — could add toast here
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };

  if (!loading && profiles.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">
        Who to Follow
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-2 bg-gray-100 rounded w-1/3" />
              </div>
              <div className="h-7 w-16 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => (
            <div key={profile.id} className="flex items-center gap-3">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.username}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500 flex-shrink-0">
                  {profile.username?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">
                  {profile.username}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  @{profile.id}
                </div>
              </div>

              <button
                onClick={() => handleFollow(profile.id)}
                disabled={pendingIds.has(profile.id)}
                className="flex-shrink-0 text-xs px-3 py-1 rounded-full border border-gray-300 hover:bg-black hover:text-white text-black hover:border-black transition disabled:opacity-40"
              >
                {pendingIds.has(profile.id) ? "..." : "Follow"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── helpers ───────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
