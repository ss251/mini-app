"use client";

import { useState } from "react";
import { Button } from "./DemoComponents";

export interface VerifiedAccount {
  platform: string;
  username: string;
}

export interface MentionedProfile {
  fid?: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  custody_address?: string;
}

export type FarcasterUser = {
  fid: number;
  username: string;
  display_name: string;
  custody_address: string;
  pfp_url: string;
  verified_addresses?: {
    eth_addresses: string[];
    sol_addresses: string[];
    primary: {
      eth_address?: string;
      sol_address?: string;
    };
  };
  follower_count?: number;
  following_count?: number;
  verified_accounts?: VerifiedAccount[];
  power_badge?: boolean;
  profile?: {
    bio?: {
      text?: string;
      mentioned_profiles?: MentionedProfile[];
    };
    location?: {
      description?: string;
      placeId?: string;
    };
  };
};

export default function FarcasterSearch({ onSelectUser }: { onSelectUser: (user: FarcasterUser) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<FarcasterUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/neynar/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user data');
      }
      
      const data = await response.json();
      setResults(data.result?.users || []);
    } catch (error) {
      console.error('Error searching for Farcaster users:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by Farcaster username..."
          className="flex-1 px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
        />
        <Button
          variant="primary"
          size="md"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--app-foreground-muted)]">Results</h3>
          <ul className="space-y-2">
            {results.map((user) => (
              <li 
                key={user.fid}
                className="flex items-center p-3 border border-[var(--app-card-border)] rounded-lg bg-[var(--app-card-bg)] hover:bg-[var(--app-accent-light)] cursor-pointer transition-colors"
                onClick={() => onSelectUser(user)}
              >
                <div className="flex-shrink-0 mr-3">
                  {user.pfp_url ? (
                    <img 
                      src={user.pfp_url} 
                      alt={user.display_name || user.username} 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--app-gray)] flex items-center justify-center">
                      <span className="text-[var(--app-foreground-muted)]">
                        {(user.display_name || user.username || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-[var(--app-foreground)]">
                    {user.display_name}
                    <span className="ml-1 text-[var(--app-foreground-muted)]">@{user.username}</span>
                  </div>
                  <div className="text-xs text-[var(--app-foreground-muted)]">
                    FID: {user.fid}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 