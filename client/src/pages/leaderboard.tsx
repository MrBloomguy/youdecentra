import React from 'react';
import { useAuthStore } from '@/lib/store';

export default function Leaderboard() {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-6 border border-reddit-light-border dark:border-reddit-dark-border">
        <h1 className="text-2xl font-bold mb-4">User Leaderboard</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">Track the most active and highest-scoring users across the platform.</p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="text-left py-3 px-4 font-semibold">Rank</th>
                <th className="text-left py-3 px-4 font-semibold">User</th>
                <th className="text-left py-3 px-4 font-semibold">Points</th>
                <th className="text-left py-3 px-4 font-semibold">Posts</th>
                <th className="text-left py-3 px-4 font-semibold">Comments</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4 font-medium">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 mr-3 flex items-center justify-center text-white font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>User {index + 1}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{10000 - index * 500}</td>
                  <td className="py-3 px-4">{50 - index * 3}</td>
                  <td className="py-3 px-4">{120 - index * 8}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">How to Earn Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <div className="text-xl font-bold mb-2">🖋️ Create Content</div>
              <p className="text-sm">
                +10 points for new posts<br />
                +2 points for comments
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <div className="text-xl font-bold mb-2">👍 Engagement</div>
              <p className="text-sm">
                +1 point for each upvote received<br />
                +5 points when your content is shared
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <div className="text-xl font-bold mb-2">🏆 Community</div>
              <p className="text-sm">
                +50 points for creating a community<br />
                +20 points for becoming a moderator
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}