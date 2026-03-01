/** @format */
import { useEffect, useState } from "react";
import { ArrowLeft, OctagonAlert } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import useAuthStore from "@/hooks/useAuthStore";
import LeftSidebar from "@/components/LeftSidebar";
import WhoToFollow from "@/components/FollowItem";
import SignupModal from "@/components/SignupModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";

const Settings = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    setIsDeleting(true);
    try {
      await api.delete("/profile/delete", {
        data: { profileId: user.id, walletAddress: user.walletAddress },
      });
    } catch {
      alert("Something went wrong, could not delete the profile")
    } finally {
      setIsDeleting(false);
    }
    logout();
    window.location.href = "/";
  };

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
              <p className="font-bold text-base leading-tight">Settings</p>
            </div>
          </header>

          {/* Not logged in */}
          {!user && (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8 gap-4">
              <p className="text-gray-500 text-sm">
                Sign in to check view the settings.
              </p>
              <button
                onClick={() => setShowSignup(true)}
                className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-900 transition"
              >
                Sign up / Sign in
              </button>
            </div>
          )}

          {/* Settings content */}
          {user && (
            <Card className="border-red-200 p-6 mx-5 my-5">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <OctagonAlert
                    color="#ea0404"
                    className="h-5 w-5 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Delete Account</h3>
                    <p className="text-sm mb-4">
                      We're sad to let you go! Once you delete your account,
                      there's no going back. Please be certain before
                      proceeding.
                    </p>
                    <ul className="text-sm space-y-1 ml-4 list-disc mb-4">
                      <li>
                        All your data will be permanently deleted, though you
                        can create a new account later.
                      </li>
                      <li>This action cannot be undone</li>
                      <li>You won't be able to access your account or data</li>
                    </ul>
                  </div>
                </div>

                {/* Delete Button with Confirmation Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex-shrink-0 text-xs px-3 py-1 rounded-full border border-black hover:bg-red-600 hover:text-white text-black hover:border-red-700 transition disabled:opacity-40">
                      Delete My Account
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Your account and all
                        associated data will be permanently deleted from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4 px-4 bg-red-50 rounded-md border border-red-200">
                      <p className="text-sm text-red-900">
                        <strong>Warning:</strong> This will immediately delete
                        all your data including your profile, settings, and any
                        saved information.
                      </p>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <AlertDialogCancel className="flex-shrink-0  w-16 py-1 px-4 font-medium text-xs rounded-full border border-black text-black hover:bg-black hover:text-white transition">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="flex-shrink-0 w-16 py-1 px-4 font-medium text-xs rounded-full border border-black text-black hover:bg-red-600 hover:text-white hover:border-red-500 transition"
                      >
                        {isDeleting ? "Deleting..." : "Confirm"}
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
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

export default Settings;
