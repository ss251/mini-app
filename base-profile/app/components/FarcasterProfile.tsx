"use client";

import { Button } from "./DemoComponents";
import { FarcasterUser } from "./FarcasterSearch";

interface FarcasterProfileProps {
  user: FarcasterUser | null;
  onReset: () => void;
}

export default function FarcasterProfile({ user, onReset }: FarcasterProfileProps) {
  if (!user) return null;

  const ethAddresses = user.verified_addresses?.eth_addresses || [user.custody_address];
  const primaryAddress = user.verified_addresses?.primary?.eth_address || user.custody_address;
  
  // Parse verified social accounts
  const verifiedAccounts = user.verified_accounts || [];
  const twitterAccount = verifiedAccounts.find(account => account.platform === 'x');

  return (
    <div className="space-y-5">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {user.pfp_url ? (
            <img 
              src={user.pfp_url} 
              alt={user.display_name || user.username} 
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[var(--app-gray)] flex items-center justify-center">
              <span className="text-xl text-[var(--app-foreground-muted)]">
                {(user.display_name || user.username || '?').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-medium text-[var(--app-foreground)]">
            {user.display_name}
          </h2>
          <p className="text-[var(--app-foreground-muted)]">@{user.username}</p>
          
          <div className="flex space-x-4 mt-2">
            <div className="text-sm">
              <span className="font-medium">{user.following_count || 0}</span>
              <span className="text-[var(--app-foreground-muted)] ml-1">Following</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">{user.follower_count || 0}</span>
              <span className="text-[var(--app-foreground-muted)] ml-1">Followers</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">{user.fid}</span>
              <span className="text-[var(--app-foreground-muted)] ml-1">FID</span>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onReset}
        >
          Change User
        </Button>
      </div>

      {user.profile?.bio?.text && (
        <div className="text-sm text-[var(--app-foreground)]">
          {user.profile.bio.text}
        </div>
      )}

      {verifiedAccounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {twitterAccount && (
            <a 
              href={`https://twitter.com/${twitterAccount.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--app-accent-light)] text-[var(--app-accent)] text-xs hover:bg-[var(--app-accent)] hover:text-white transition-colors"
            >
              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              @{twitterAccount.username}
            </a>
          )}
          
          {verifiedAccounts && verifiedAccounts
            .filter(account => account.platform !== 'x')
            .map((account, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--app-gray)] text-[var(--app-foreground-muted)] text-xs"
              >
                {account.platform}: @{account.username}
              </span>
            ))
          }
        </div>
      )}

      <div className="pt-4 border-t border-[var(--app-card-border)]">
        <h3 className="text-sm font-medium text-[var(--app-foreground)] mb-3">
          Ethereum Addresses
        </h3>
        <div className="space-y-2">
          {ethAddresses.map((address) => (
            <div 
              key={address} 
              className={`p-2 rounded-lg text-sm break-all ${
                address === primaryAddress 
                  ? 'bg-[var(--app-accent-light)] border border-[var(--app-accent)]' 
                  : 'bg-[var(--app-card-bg)] border border-[var(--app-card-border)]'
              }`}
            >
              {address}
              {address === primaryAddress && (
                <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded-full bg-[var(--app-accent)] text-white">
                  Primary
                </span>
              )}
              
              <div className="flex space-x-2 mt-1 text-xs">
                <a 
                  href={`https://basescan.org/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--app-accent)] hover:underline"
                >
                  View on Basescan
                </a>
                <a 
                  href={`https://etherscan.io/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--app-accent)] hover:underline"
                >
                  View on Etherscan
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {user.power_badge && (
        <div className="flex items-center p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <span className="mr-2">⚡</span>
          <span className="text-sm font-medium">Power User</span>
        </div>
      )}
    </div>
  );
} 