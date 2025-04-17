"use client";

import { useState } from "react";
import { FarcasterUser } from "../components/FarcasterSearch";
import FarcasterSearch from "../components/FarcasterSearch";
import ProfileComparison from "../components/ProfileComparison";
import { Card } from "../components/DemoComponents";
import Link from "next/link";

export default function ComparePage() {
  const [user1, setUser1] = useState<FarcasterUser | null>(null);
  const [user2, setUser2] = useState<FarcasterUser | null>(null);
  const [comparing, setComparing] = useState(false);

  const handleSelectUser1 = (user: FarcasterUser) => {
    setUser1(user);
  };

  const handleSelectUser2 = (user: FarcasterUser) => {
    setUser2(user);
  };

  const handleReset = () => {
    setUser1(null);
    setUser2(null);
    setComparing(false);
  };

  const handleCompare = () => {
    if (user1 && user2) {
      setComparing(true);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--app-foreground)] mb-4">
          Compare Farcaster Profiles
        </h1>
        <Link 
          href="/baseprofile" 
          className="text-[var(--app-accent)] text-sm hover:underline"
        >
          ← Back to profiles
        </Link>
      </div>

      {comparing && user1 && user2 ? (
        <div className="space-y-6">
          <Card title="NFT Collection Comparison">
            <ProfileComparison user1={user1} user2={user2} />
          </Card>
          
          <div className="flex justify-center">
            <button 
              onClick={handleReset}
              className="py-2 px-4 bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] text-[var(--app-foreground)] rounded-lg"
            >
              Compare Different Profiles
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="First Profile">
            {!user1 ? (
              <FarcasterSearch onSelectUser={handleSelectUser1} />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    {user1.pfp_url ? (
                      <img 
                        src={user1.pfp_url} 
                        alt={user1.display_name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--app-gray)]">
                        <span className="text-[var(--app-foreground-muted)] text-lg font-medium">
                          {user1.display_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--app-foreground)]">{user1.display_name}</p>
                    <p className="text-sm text-[var(--app-foreground-muted)]">@{user1.username}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setUser1(null)}
                  className="text-[var(--app-accent)] text-sm hover:underline"
                >
                  Change user
                </button>
              </div>
            )}
          </Card>
          
          <Card title="Second Profile">
            {!user2 ? (
              <FarcasterSearch onSelectUser={handleSelectUser2} />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    {user2.pfp_url ? (
                      <img 
                        src={user2.pfp_url} 
                        alt={user2.display_name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--app-gray)]">
                        <span className="text-[var(--app-foreground-muted)] text-lg font-medium">
                          {user2.display_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--app-foreground)]">{user2.display_name}</p>
                    <p className="text-sm text-[var(--app-foreground-muted)]">@{user2.username}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setUser2(null)}
                  className="text-[var(--app-accent)] text-sm hover:underline"
                >
                  Change user
                </button>
              </div>
            )}
          </Card>
          
          {user1 && user2 && (
            <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
              <button 
                onClick={handleCompare}
                className="py-2 px-6 bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white rounded-lg"
              >
                Compare NFT Collections
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 