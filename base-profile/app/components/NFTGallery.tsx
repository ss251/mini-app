"use client";

import { useState, useEffect } from "react";
import { FarcasterUser } from "./FarcasterSearch";
import { NFT } from "../api/nft/route";
import { Card } from "./DemoComponents";

interface NFTGalleryProps {
  user: FarcasterUser;
}

export default function NFTGallery({ user }: NFTGalleryProps) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [totalNfts, setTotalNfts] = useState(0);

  useEffect(() => {
    async function fetchNFTs() {
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
        const response = await fetch(`/api/nft?addresses=${ethAddresses.join(',')}&limit=12`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch NFTs');
        }
        
        const data = await response.json();
        setNfts(data.nfts || []);
        setTotalNfts(data.total || 0);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchNFTs();
  }, [user]);

  // Function to handle clicking on an NFT
  const handleSelectNft = (nft: NFT) => {
    setSelectedNft(nft === selectedNft ? null : nft);
  };

  // Find the best image to display for an NFT
  const getNftImageUrl = (nft: NFT) => {
    return nft.media?.[0]?.gateway || 
      nft.rawMetadata?.image || 
      nft.metadata?.image || 
      "";
  };

  // Get NFT name
  const getNftName = (nft: NFT) => {
    return nft.title || 
      nft.rawMetadata?.name || 
      nft.metadata?.name || 
      `${nft.contract.name || "NFT"} #${nft.tokenId}`;
  };

  if (loading) {
    return <p className="text-[var(--app-foreground-muted)]">Loading NFT collection...</p>;
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 text-red-700 rounded-lg">
        Error: {error}
      </div>
    );
  }

  if (nfts.length === 0) {
    return <p className="text-[var(--app-foreground-muted)]">No NFTs found on Base mainnet for this user.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-[var(--app-foreground)]">
          NFT Collection ({totalNfts} total)
        </h3>
      </div>

      {selectedNft ? (
        <div className="space-y-4">
          <button 
            onClick={() => setSelectedNft(null)}
            className="text-[var(--app-accent)] text-sm hover:underline"
          >
            ← Back to gallery
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
                  {selectedNft.estimatedValue !== undefined && (
                    <div>
                      <span className="text-[var(--app-foreground-muted)]">Est. Value: </span>
                      <span className="font-medium">{selectedNft.estimatedValue.toFixed(2)} ETH</span>
                    </div>
                  )}
                </div>
                
                {selectedNft.rawMetadata?.attributes && selectedNft.rawMetadata.attributes.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-[var(--app-foreground)] font-medium mb-2">Attributes</h5>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {selectedNft.rawMetadata.attributes.map((attr, index) => (
                        <div 
                          key={index} 
                          className="bg-[var(--app-accent-light)] p-2 rounded-md text-xs"
                        >
                          <span className="block text-[var(--app-foreground-muted)]">{attr.trait_type}</span>
                          <span className="font-medium">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {nfts.map((nft, index) => (
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
  );
} 