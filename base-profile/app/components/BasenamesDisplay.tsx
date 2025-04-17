"use client";

import { useState, useEffect } from "react";
import { FarcasterUser } from "./FarcasterSearch";

interface BasenamesResult {
  address: string;
  basename: string | null;
  error?: string;
}

interface BasenamesDisplayProps {
  user: FarcasterUser;
}

export default function BasenamesDisplay({ user }: BasenamesDisplayProps) {
  const [basenames, setBasenames] = useState<BasenamesResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBasenames() {
      setLoading(true);
      setError(null);

      try {
        // Get all ETH addresses from the user
        const ethAddresses = user.verified_addresses?.eth_addresses || [user.custody_address];
        
        if (ethAddresses.length === 0) {
          setLoading(false);
          return;
        }

        // Call our API endpoint with the comma-separated addresses
        const response = await fetch(`/api/basenames?addresses=${ethAddresses.join(',')}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch basenames');
        }
        
        const data = await response.json();
        setBasenames(data.results || []);
      } catch (error) {
        console.error('Error fetching basenames:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchBasenames();
  }, [user]);

  if (loading) {
    return <p className="text-[var(--app-foreground-muted)]">Loading basenames...</p>;
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 text-red-700 rounded-lg">
        Error: {error}
      </div>
    );
  }

  // Filter out results with no basenames
  const validBasenames = basenames.filter(item => item.basename !== null);

  if (validBasenames.length === 0) {
    return <p className="text-[var(--app-foreground-muted)]">No basenames found for this user.</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {validBasenames.map((item, index) => (
          <li key={index} className="flex flex-col">
            <div className="p-2 rounded-lg bg-[var(--app-card-bg)] border border-[var(--app-card-border)]">
              <div className="font-medium text-[var(--app-foreground)]">
                {item.basename}
              </div>
              <div className="text-xs text-[var(--app-foreground-muted)] mt-1 break-all">
                Address: {item.address}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 