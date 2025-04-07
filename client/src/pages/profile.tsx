import React, { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import MobileNav from "@/components/layout/mobile-nav";
import PostCard from "@/components/home/post-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useOrbis } from "@/lib/orbis";
import { useAuthStore } from "@/lib/store";
import { formatAddress } from "@/lib/utils";
import { AppPost } from "@shared/types";
import {
  useUserPoints,
  useUserDonationPoints,
  useUserRank,
} from "@/lib/points";
import { Award, Trophy, Gift, Medal, User } from "lucide-react";

export default function Profile() {
  const [, params] = useRoute<{ id: string }>("/user/:id");
  const userId = params?.id || "";
  const { getUserPosts, getProfile } = useOrbis();
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();
  const { points: userPoints, loading: pointsLoading } = useUserPoints(userId);
  const { points: donationPoints, loading: donationLoading } = useUserDonationPoints(userId);
  const { rank: userRank, loading: rankLoading } = useUserRank(userId);

  const [posts, setPosts] = useState<AppPost[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (currentUser && userId) {
      setIsOwnProfile(currentUser.id === userId);
    }
  }, [currentUser, userId]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const profileData = await getProfile(userId);
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error loading profile",
          description: "Failed to load complete profile data.",
          variant: "destructive",
        });
        setProfile({
          did: userId,
          details: {
            profile: {
              username: undefined,
              description: undefined,
              pfp: undefined
            }
          }
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId, getProfile, toast]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const fetchedPosts = await getUserPosts(userId);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [userId, getUserPosts]);

  const displayName = profile?.details?.profile?.username || formatAddress(userId);

  return (
    <>
      <main className="container mx-auto px-2 md:px-4 py-4 pb-16 md:pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md overflow-hidden border border-reddit-light-border dark:border-reddit-dark-border">
            {/* Profile Header with Gradient Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 relative">
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-reddit-light-brighter dark:from-reddit-dark-brighter to-transparent"></div>
            </div>

            {/* Main Profile Content */}
            <div className="px-6 pb-6 relative">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start gap-4 -mt-12 mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-reddit-light-brighter dark:border-reddit-dark-brighter bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                  {profile?.details?.profile?.pfp ? (
                    <img
                      src={profile.details.profile.pfp}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="w-full flex flex-col items-center md:items-start">
                  <div className="flex flex-col md:flex-row w-full items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                      <h1 className="text-3xl font-bold mb-1">
                        {profile?.details?.profile?.username || formatAddress(userId.split(':').pop() || '')}
                      </h1>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <span className="text-sm">@{userId.split(':').pop()?.slice(-8)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isOwnProfile ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline">Edit Profile</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Profile</DialogTitle>
                              <DialogDescription>
                                Make changes to your profile here
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={async (e) => {
                              e.preventDefault();
                              const form = e.target as HTMLFormElement;
                              const username = (form.elements.namedItem('username') as HTMLInputElement).value;
                              const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

                              if (username && orbis) {
                                try {
                                  const res = await orbis.updateProfile({
                                    username,
                                    description,
                                    pfp: profile?.details?.profile?.pfp
                                  });

                                  if (res.status === 200) {
                                    toast({
                                      title: "Profile updated",
                                      description: "Your profile has been updated successfully"
                                    });
                                    const updatedProfile = await getProfile(userId);
                                    setProfile(updatedProfile);
                                    form.reset();
                                  }
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to update profile",
                                    variant: "destructive"
                                  });
                                }
                              }
                            }}>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="username">Username</Label>
                                  <Input
                                    id="username"
                                    name="username"
                                    defaultValue={profile?.details?.profile?.username}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="description">Description</Label>
                                  <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={profile?.details?.profile?.description}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit">Save Changes</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button variant="default" onClick={async () => {
                          if (!orbis || !currentUser) {
                            toast({
                              title: "Not connected",
                              description: "Please connect your wallet to follow users",
                              variant: "destructive",
                            });
                            return;
                          }
                          try {
                            const isFollowing = await orbis.getIsFollowing(currentUser.id, userId);
                            const res = await orbis.setFollow(userId, !isFollowing);

                            if (res.status === 200) {
                              toast({
                                title: "Success",
                                description: isFollowing ? "Unfollowed user" : "Now following user"
                              });
                              const updatedProfile = await getProfile(userId);
                              setProfile(updatedProfile);
                            }
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to update follow status",
                              variant: "destructive"
                            });
                          }
                        }}>
                          Follow
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="flex justify-center md:justify-start gap-8 mt-6 border-t border-b border-gray-200 dark:border-gray-700 py-4">
                    <div className="text-center">
                      <p className="text-xl font-semibold">{posts.length}</p>
                      <p className="text-sm text-gray-500">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold">{profile?.count_followers || 0}</p>
                      <p className="text-sm text-gray-500">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold">{profile?.count_following || 0}</p>
                      <p className="text-sm text-gray-500">Following</p>
                    </div>
                    {!rankLoading && userRank > 0 && (
                      <div className="text-center">
                        <p className="text-xl font-semibold text-purple-600">#{userRank}</p>
                        <p className="text-sm text-gray-500">Rank</p>
                      </div>
                    )}
                  </div>

                  {profile?.details?.profile?.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
                      {profile.details.profile.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Content Tabs */}
              <Tabs defaultValue="posts" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full border-b border-gray-200 dark:border-gray-700">
                  <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
                  <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
                  <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="pt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, index) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse"
                        >
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        {isOwnProfile ? "You haven't created any posts yet." : "This user hasn't created any posts yet."}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="comments" className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      {isOwnProfile ? "Your comments will appear here." : "This user's comments will appear here."}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="about" className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Bio</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {profile?.details?.profile?.description || "No bio provided."}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Stats</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Posts</p>
                          <p className="text-xl font-semibold">{posts.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Points</p>
                          <p className="text-xl font-semibold text-green-600">{userPoints || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
                          <p className="text-xl font-semibold">{profile?.count_followers || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Following</p>
                          <p className="text-xl font-semibold">{profile?.count_following || 0}</p>
                        </div>
                      </div>
                    </div>

                    {!rankLoading && userRank > 0 && (
                      <>
                        <Separator />
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
                          <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
                            <Medal className="h-5 w-5" />
                            Leaderboard Rank
                          </h3>
                          <p className="text-3xl font-bold">#{userRank}</p>
                          <p className="mt-2 text-white/80">
                            {userRank === 1 ? "Top of the leaderboard!" :
                             userRank <= 10 ? "Top 10 contributor!" :
                             userRank <= 100 ? "Top 100 contributor!" :
                             "Keep contributing to climb the ranks!"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  );
}