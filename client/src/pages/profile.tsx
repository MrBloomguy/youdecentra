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
import { Award, Trophy, Gift, Medal } from "lucide-react";

export default function Profile() {
  const [, params] = useRoute<{ id: string }>("/user/:id");
  const userId = params?.id || "";
  const { getUserPosts, getProfile } = useOrbis();
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();
  const { points: userPoints, loading: pointsLoading } = useUserPoints(userId);
  const { points: donationPoints, loading: donationLoading } =
    useUserDonationPoints(userId);
  const { rank: userRank, loading: rankLoading } = useUserRank(userId);

  const [posts, setPosts] = useState<AppPost[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Determine if this is the current user's profile
  useEffect(() => {
    if (currentUser && userId) {
      setIsOwnProfile(currentUser.id === userId);
    }
  }, [currentUser, userId]);

  // Fetch profile information
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
        // Set minimal profile data
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

  // Fetch user posts
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

  // Profile username display
  const displayName =
    profile?.details?.profile?.username || formatAddress(userId);

  return (
    <>
      <main className="container mx-auto px-2 md:px-4 py-4 pb-16 md:pb-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md overflow-hidden border border-reddit-light-border dark:border-reddit-dark-border mb-4">
            {/* Profile Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500"></div>

            {/* Profile Info */}
            <div className="p-4 relative">
              {/* Profile Avatar */}
              <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-full absolute -top-10 border-4 border-reddit-light-brighter dark:border-reddit-dark-brighter flex items-center justify-center overflow-hidden">
                {profile?.details?.profile?.pfp ? (
                  <img
                    src={profile.details.profile.pfp}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="ri-user-3-line text-3xl text-gray-500 dark:text-gray-400"></i>
                )}
              </div>

              <div className="ml-24">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">
                      {profile?.details?.profile?.username || 
                       formatAddress(userId.startsWith('0x') ? userId : userId.split(':').pop() || '')}
                    </h1>
                    {!pointsLoading && userPoints > 0 && (
                      <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1 text-white">
                        <Trophy className="h-3 w-3" />
                        <span>{userPoints} Points</span>
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 md:mt-0">
                    {!rankLoading && userRank > 0 && (
                      <Badge className="bg-purple-600 hover:bg-purple-700 flex items-center gap-1 text-white">
                        <Medal className="h-3 w-3" />
                        <span>#{userRank}</span>
                      </Badge>
                    )}

                    {!donationLoading && (
                      <Badge className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1 text-white">
                        <Gift className="h-3 w-3" />
                        <span>{donationPoints || 0}</span>
                      </Badge>
                    )}
                  </div>
                </div>
                {!profile?.details?.profile?.username && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatAddress(userId)}
                  </p>
                )}

                {profile?.details?.profile?.description && (
                  <p className="text-sm mt-2">
                    {profile.details.profile.description}
                  </p>
                )}

                <div className="flex mt-4">
                  {isOwnProfile ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="text-sm">
                          Edit Profile
                        </Button>
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
                                // Refresh profile data
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
                    <Button className="bg-reddit-blue hover:bg-blue-600 text-white text-sm">
                      Follow
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs for Posts, Comments, About */}
          <Tabs
            defaultValue="posts"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md border border-reddit-light-border dark:border-reddit-dark-border p-2 mb-4">
              <TabsList className="grid grid-cols-3 mb-0">
                <TabsTrigger value="posts" className="text-sm">
                  Posts
                </TabsTrigger>
                <TabsTrigger value="comments" className="text-sm">
                  Comments
                </TabsTrigger>
                <TabsTrigger value="about" className="text-sm">
                  About
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="posts" className="mt-0">
              {isLoading ? (
                // Skeleton loaders for posts
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="post-card bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden p-4 mb-4"
                    >
                      <div className="animate-pulse flex">
                        <div className="w-10 md:w-12 bg-gray-200 dark:bg-gray-700 h-24"></div>
                        <div className="flex-grow ml-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-6 text-center border border-reddit-light-border dark:border-reddit-dark-border">
                  <p className="text-lg font-semibold mb-2">No posts yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isOwnProfile
                      ? "You haven't created any posts yet."
                      : "This user hasn't created any posts yet."}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="mt-0">
              <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-6 text-center border border-reddit-light-border dark:border-reddit-dark-border">
                <p className="text-lg font-semibold mb-2">Comments</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isOwnProfile
                    ? "Your comments will be displayed here."
                    : "This user's comments will be displayed here."}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-6 border border-reddit-light-border dark:border-reddit-dark-border">
                <h3 className="text-lg font-semibold mb-4">
                  About {displayName}
                </h3>

                {profile ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Bio</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {profile.details?.profile?.description ||
                          "No bio provided."}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium mb-1">Wallet</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                        {formatAddress(userId)}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium">Posts</p>
                        <p className="text-lg font-semibold">{posts.length}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Comments</p>
                        <p className="text-lg font-semibold">0</p>
                      </div>

                      {!pointsLoading && (
                        <div>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Award className="h-3 w-3" /> Total Points
                          </p>
                          <p className="text-lg font-semibold text-green-600">
                            {userPoints}
                          </p>
                        </div>
                      )}

                      {!donationLoading && (
                        <div>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Gift className="h-3 w-3" /> Donation Points
                          </p>
                          <p className="text-lg font-semibold text-blue-600">
                            {donationPoints}
                          </p>
                        </div>
                      )}
                    </div>

                    {!rankLoading && userRank > 0 && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md text-white">
                        <p className="text-sm font-medium flex items-center gap-1 mb-1">
                          <Medal className="h-4 w-4" /> Leaderboard Rank
                        </p>
                        <div className="flex items-center">
                          <p className="text-2xl font-bold">#{userRank}</p>
                          <p className="ml-2 text-sm opacity-80">
                            {userRank === 1
                              ? "You're at the top!"
                              : userRank <= 10
                                ? "Top 10 contributor!"
                                : userRank <= 100
                                  ? "Top 100 contributor!"
                                  : "Keep it up!"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <Separator />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <MobileNav />
    </>
  );
}
