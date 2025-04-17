"use client";

import { useState, useEffect } from "react";
import { FarcasterUser } from "./FarcasterSearch";
import { NFT } from "../api/nft/route";
import { Card } from "./DemoComponents";

interface ProfileComparisonProps {
  user1: FarcasterUser;
  user2: FarcasterUser;
}

interface ComparisonResult {
  user1NFTs: NFT[];
  user2NFTs: NFT[];
  commonNFTs: NFT[];
  user1Total: number;
  user2Total: number;
  commonTotal: number;
}

export default function ProfileComparison({ user1, user2 }: ProfileComparisonProps) {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);

  useEffect(() => {
    async function compareProfiles() {
      setLoading(true);
      setError(null);

      try {
        // Get ETH addresses for both users
        const user1Addresses: string[] = [];
        const user2Addresses: string[] = [];
        
        // For user1
        if (user1.verified_addresses?.eth_addresses && user1.verified_addresses.eth_addresses.length > 0) {
          user1Addresses.push(...user1.verified_addresses.eth_addresses);
        }
        if (!user1Addresses.includes(user1.custody_address)) {
          user1Addresses.push(user1.custody_address);
        }
        
        // For user2
        if (user2.verified_addresses?.eth_addresses && user2.verified_addresses.eth_addresses.length > 0) {
          user2Addresses.push(...user2.verified_addresses.eth_addresses);
        }
        if (!user2Addresses.includes(user2.custody_address)) {
          user2Addresses.push(user2.custody_address);
        }
        
        if (user1Addresses.length === 0 || user2Addresses.length === 0) {
          setLoading(false);
          setError("One or both users have no Ethereum addresses");
          return;
        }

        // Call our API endpoint to compare NFTs
        const response = await fetch(
          `/api/compare?addresses1=${user1Addresses.join(',')}&addresses2=${user2Addresses.join(',')}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to compare profiles');
        }
        
        const data = await response.json();
        setComparison(data);
      } catch (error) {
        console.error('Error comparing profiles:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    compareProfiles();
  }, [user1, user2]);

  // Function to handle clicking on an NFT
  const handleSelectNft = (nft: NFT) => {
    setSelectedNft(nft === selectedNft ? null : nft);
  };

  // Helper functions to handle NFT display
  const getNftImageUrl = (nft: NFT) => {
    return nft.media?.[0]?.gateway || 
      nft.rawMetadata?.image || 
      nft.metadata?.image || 
      "";
  };

  const getNftName = (nft: NFT) => {
    return nft.title || 
      nft.rawMetadata?.name || 
      nft.metadata?.name || 
      `${nft.contract.name || "NFT"} #${nft.tokenId}`;
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-[var(--app-foreground-muted)]">Comparing profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 text-red-700 rounded-lg">
        Error: {error}
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="py-8 text-center">
        <p className="text-[var(--app-foreground-muted)]">No comparison data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--app-card-bg)]">
            {user1.pfp_url ? (
              <img src={user1.pfp_url} alt={user1.display_name} className="w-full h-full object-cover" />
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
        
        <div className="flex flex-col items-center">
          <div className="py-1 px-4 bg-[var(--app-accent-light)] text-[var(--app-accent)] rounded-full text-sm font-medium">
            {comparison.commonTotal} NFTs in common
          </div>
          <div className="text-xs text-[var(--app-foreground-muted)] mt-1">
            {user1.display_name} owns {comparison.user1Total} NFTs • {user2.display_name} owns {comparison.user2Total} NFTs
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--app-card-bg)]">
            {user2.pfp_url ? (
              <img src={user2.pfp_url} alt={user2.display_name} className="w-full h-full object-cover" />
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
      </div>

      {comparison.commonNFTs.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[var(--app-foreground)]">
            Common NFTs
          </h3>
          
          {selectedNft ? (
            <div className="space-y-4">
              <button 
                onClick={() => setSelectedNft(null)}
                className="text-[var(--app-accent)] text-sm hover:underline"
              >
                ← Back to common NFTs
              </button>
              
              <Card>
                <div className="space-y-4">
                  <div className="aspect-square w-full overflow-hidden flex items-center justify-center bg-black">
                    {getNftImageUrl(selectedNft) ? (
                      <img 
                        src={getNftImageUrl(selectedNft)} 
                        alt={getNftName(selectedNft)} 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="aspect-square w-full flex items-center justify-center bg-[var(--app-gray)]">
                        <span className="text-[var(--app-foreground-muted)]">No Image Available</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-medium text-[var(--app-foreground)]">
                      {getNftName(selectedNft)}
                    </h4>
                    
                    <p className="text-[var(--app-foreground-muted)] mt-2">
                      {selectedNft.rawMetadata?.description || selectedNft.description || "No description available"}
                    </p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--app-foreground-muted)]">Contract: </span>
                        <span className="font-medium">{selectedNft.contract.name || "Unknown"}</span>
                      </div>
                      <div>
                        <span className="text-[var(--app-foreground-muted)]">Token ID: </span>
                        <span className="font-medium">{selectedNft.tokenId}</span>
                      </div>
                      <div>
                        <span className="text-[var(--app-foreground-muted)]">Token Type: </span>
                        <span className="font-medium">{selectedNft.tokenType}</span>
                      </div>
                      
                      <div className="col-span-2 mt-2 py-2 border-t border-[var(--app-card-border)]">
                        <span className="text-[var(--app-foreground-muted)]">Owned by both: </span>
                        <span className="font-medium text-[var(--app-accent)]">{user1.display_name} and {user2.display_name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {comparison.commonNFTs.map((nft, index) => (
                <div 
                  key={index} 
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleSelectNft(nft)}
                >
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-[var(--app-card-bg)] border border-[var(--app-card-border)]">
                    {getNftImageUrl(nft) ? (
                      <img 
                        src={getNftImageUrl(nft)} 
                        alt={getNftName(nft)} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--app-gray)]">
                        <span className="text-[var(--app-foreground-muted)] text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-[var(--app-foreground)] truncate">
                      {getNftName(nft)}
                    </p>
                    <p className="text-xs text-[var(--app-foreground-muted)]">
                      {nft.contract.name || "Unknown Collection"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center border border-dashed border-[var(--app-card-border)] rounded-lg">
          <p className="text-[var(--app-foreground-muted)]">
            These users don&apos;t have any NFTs in common
          </p>
        </div>
      )}
    </div>
  );
} 