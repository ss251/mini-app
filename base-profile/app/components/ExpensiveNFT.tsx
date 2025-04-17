"use client";

import { useState, useEffect } from "react";
import { FarcasterUser } from "./FarcasterSearch";
import { NFT } from "../api/nft/route";

interface ExpensiveNFTProps {
  user: FarcasterUser;
}

export default function ExpensiveNFT({ user }: ExpensiveNFTProps) {
  const [nft, setNft] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMostExpensiveNFT() {
      setLoading(true);
      setError(null);

      try {
        // Get all ETH addresses from the user
        const ethAddresses: string[] = [];
        
        // Add verified addresses if available
        if (user.verified_addresses?.eth_addresses && user.verified_addresses.eth_addresses.length > 0) {
          ethAddresses.push(...user.verified_addresses.eth_addresses);
        }
        
        // Add custody address if not already included
        if (!ethAddresses.includes(user.custody_address)) {
          ethAddresses.push(user.custody_address);
        }
        
        if (ethAddresses.length === 0) {
          setLoading(false);
          setError("No Ethereum addresses found for this user");
          return;
        }

        // Call our API endpoint with all addresses
        const response = await fetch(`/api/nft?addresses=${ethAddresses.join(',')}&limit=1`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch NFT data');
        }
        
        const data = await response.json();
        setNft(data.mostExpensiveNft || null);
      } catch (error) {
        console.error('Error fetching NFT:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchMostExpensiveNFT();
  }, [user]);

  if (loading) {
    return <p className="text-[var(--app-foreground-muted)]">Loading NFT data...</p>;
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 text-red-700 rounded-lg">
        Error: {error}
      </div>
    );
  }

  if (!nft) {
    return <p className="text-[var(--app-foreground-muted)]">No NFTs found for this user.</p>;
  }

  // Find the best image to display
  const imageUrl = 
    nft.media?.[0]?.gateway || 
    nft.rawMetadata?.image || 
    nft.metadata?.image || 
    "";

  // Get NFT name
  const name = 
    nft.title || 
    nft.rawMetadata?.name || 
    nft.metadata?.name || 
    `${nft.contract.name || "NFT"} #${nft.tokenId}`;

  // Get NFT description
  const description = 
    nft.description || 
    nft.rawMetadata?.description || 
    nft.metadata?.description || 
    "";

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden bg-[var(--app-card-bg)] border border-[var(--app-card-border)]">
        {imageUrl ? (
          <div className="aspect-square w-full overflow-hidden flex items-center justify-center bg-black">
            <img 
              src={imageUrl} 
              alt={name} 
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="aspect-square w-full flex items-center justify-center bg-[var(--app-gray)]">
            <span className="text-[var(--app-foreground-muted)]">No Image Available</span>
          </div>
        )}
        
        <div className="p-4">
          <h3 className="text-lg font-medium text-[var(--app-foreground)]">{name}</h3>
          
          <div className="mt-2 text-[var(--app-foreground-muted)] text-sm">
            {description && (
              <p className="mb-2 line-clamp-3">{description}</p>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <div>
                {nft.contract.name && (
                  <p className="text-xs">
                    Collection: {nft.contract.name}
                  </p>
                )}
                <p className="text-xs">
                  Token ID: {nft.tokenId}
                </p>
                {nft.address && (
                  <p className="text-xs">
                    Owned by: {nft.address.substring(0, 6)}...{nft.address.substring(nft.address.length - 4)}
                  </p>
                )}
              </div>
              
              {nft.estimatedValue !== undefined && (
                <div className="bg-[var(--app-accent-light)] text-[var(--app-accent)] px-3 py-1 rounded-full font-medium">
                  ~{nft.estimatedValue.toFixed(2)} ETH
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 