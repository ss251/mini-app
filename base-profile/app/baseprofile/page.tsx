"use client";

import { useState } from "react";
import { FarcasterUser } from "../components/FarcasterSearch";
import FarcasterSearch from "../components/FarcasterSearch";
import FarcasterProfile from "../components/FarcasterProfile";
import BasenamesDisplay from "../components/BasenamesDisplay";
import TokenBalances from "../components/TokenBalances";
import ExpensiveNFT from "../components/ExpensiveNFT";
import NFTGallery from "../components/NFTGallery";
import { Card } from "../components/DemoComponents";
import Link from "next/link";

export default function BaseProfilePage() {
  const [selectedUser, setSelectedUser] = useState<FarcasterUser | null>(null);

  const handleSelectUser = (user: FarcasterUser) => {
    setSelectedUser(user);
  };

  const handleReset = () => {
    setSelectedUser(null);
  };

  return (
    <div className="container mx-auto p-4 space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[var(--app-foreground)]">
          Base Profile
        </h1>
        
        <Link 
          href="/compare" 
          className="py-2 px-4 bg-[var(--app-accent-light)] text-[var(--app-accent)] hover:bg-[var(--app-accent)] hover:text-white transition-colors rounded-lg text-sm"
        >
          Compare Profiles
        </Link>
      </div>

      <Card title={selectedUser ? "Farcaster User Profile" : "Search Farcaster User"}>
        {!selectedUser ? (
          <FarcasterSearch onSelectUser={handleSelectUser} />
        ) : (
          <FarcasterProfile user={selectedUser} onReset={handleReset} />
        )}
      </Card>

      {selectedUser && (
        <>
          <Card title="Base Mainnet - Top 5 Token Holdings">
            <TokenBalances user={selectedUser} />
          </Card>

          <Card title="Basenames Owned">
            <BasenamesDisplay user={selectedUser} />
          </Card>

          <Card title="Most Expensive NFT">
            <ExpensiveNFT user={selectedUser} />
          </Card>

          <Card title="NFT Gallery">
            <NFTGallery user={selectedUser} />
          </Card>
        </>
      )}
    </div>
  );
} 