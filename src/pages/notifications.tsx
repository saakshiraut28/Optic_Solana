/** @format */
import { useEffect, useState } from "react";
import {
  Bell,
  UserPlus,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from "lucide-react";
import api from "@/lib/api";
import useAuthStore from "@/hooks/useAuthStore";
import LeftSidebar from "@/components/LeftSidebar";
import WhoToFollow from "@/components/FollowItem";
import SignupModal from "@/components/SignupModal";

interface Notification {
  id: string;
  type: "agree" | "disagree" | "reply" | "follow";
  message: string;
  metadata?: {
    contentId?: string;
    actorProfileId?: string;
    commentId?: string;
  };
  created_at: number;
  read?: boolean;
}

const NotificationIcon = ({ type }: { type: Notification["type"] }) => {
  const config = {
    agree: {
      icon: <ThumbsUp size={16} />,
      bg: "bg-green-100",
      text: "text-green-600",
    },
    disagree: {
      icon: <ThumbsDown size={16} />,
      bg: "bg-red-100",
      text: "text-red-600",
    },
    reply: {
      icon: <MessageSquare size={16} />,
      bg: "bg-blue-100",
      text: "text-blue-600",
    },
    follow: {
      icon: <UserPlus size={16} />,
      bg: "bg-purple-100",
      text: "text-purple-600",
    },
  }[type] ?? {
    icon: <Bell size={16} />,
    bg: "bg-gray-100",
    text: "text-gray-600",
  };

  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg} ${config.text}`}
    >
      {config.icon}
    </div>
  );
};

const Notifications = () => {
  const user = useAuthStore((state) => state.user);

  const [showSignup, setShowSignup] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | Notification["type"]
  >("all");

  useEffect(() => {
    if (!user?.walletAddress) {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/notifications", {
          params: { walletAddress: user.walletAddress, page: 1, pageSize: 50 },
        });
        setNotifications(res.data.data?.notifications ?? res.data.data ?? []);
      } catch {
        setError("No notifications yet.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.walletAddress]);

  const filtered =
    activeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  const filters: { label: string; value: "all" | Notification["type"] }[] = [
    { label: "All", value: "all" },
    { label: "Agrees", value: "agree" },
    { label: "Disagrees", value: "disagree" },
    { label: "Replies", value: "reply" },
    { label: "Follows", value: "follow" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <LeftSidebar />

      <div className="flex flex-1 min-w-0 justify-center">
        <main className="flex-1 min-w-0 max-w-2xl border-x border-gray-200 bg-white min-h-screen">
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
            <p className="font-bold text-xl">Notifications</p>
          </header>

          {!user && (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8 gap-4">
              <Bell size={40} className="text-gray-200" />
              <p className="font-bold text-lg">Stay in the loop</p>
              <p className="text-gray-400 text-sm">
                Sign in to see who agreed, disagreed, or followed you.
              </p>
              <button
                onClick={() => setShowSignup(true)}
                className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-900 transition"
              >
                Sign up / Sign in
              </button>
            </div>
          )}

          {user && (
            <>
              <div className="flex gap-1 px-4 py-2 border-b border-gray-100 overflow-x-auto scrollbar-hide">
                {filters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setActiveFilter(f.value)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition ${
                      activeFilter === f.value
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {loading && (
                <div className="space-y-4 p-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-2 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="p-6 text-center text-sm text-red-400">
                  {error}
                </div>
              )}

              {!loading && !error && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                  <Bell size={40} className="text-gray-200 mb-3" />
                  <p className="font-bold text-lg">No notifications yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {activeFilter === "all"
                      ? "When someone agrees, disagrees, replies, or follows you, it'll show up here."
                      : `No ${activeFilter} notifications yet.`}
                  </p>
                </div>
              )}

              <div className="pb-16 md:pb-0">
                {!loading &&
                  !error &&
                  filtered.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition ${
                        !notif.read ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <NotificationIcon type={notif.type} />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-snug">
                          {notif.message}
                        </p>
                        {notif.metadata?.actorProfileId && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            @{notif.metadata.actorProfileId}
                          </p>
                        )}
                        <p className="text-xs text-gray-300 mt-1">
                          {new Date(notif.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>

                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}
        </main>

        <aside className="hidden lg:block w-80 flex-shrink-0 p-6 space-y-4">
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

export default Notifications;
