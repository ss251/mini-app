"use client";

import { useState, useEffect } from "react";
import { FarcasterUser } from "./FarcasterSearch";
import { formatUnits } from "viem";
import { TokenBalance } from "../api/tokens/route";

interface TokenBalancesProps {
  user: FarcasterUser;
}

export default function TokenBalances({ user }: TokenBalancesProps) {
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTokenBalances() {
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
        const response = await fetch(`/api/tokens?addresses=${ethAddresses.join(',')}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch token balances');
        }
        
        const data = await response.json();
        setTokens(data.tokens || []);
      } catch (error) {
        console.error('Error fetching token balances:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchTokenBalances();
  }, [user]);

  if (loading) {
    return <p className="text-[var(--app-foreground-muted)]">Loading token balances...</p>;
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 text-red-700 rounded-lg">
        Error: {error}
      </div>
    );
  }

  if (tokens.length === 0) {
    return <p className="text-[var(--app-foreground-muted)]">No token balances found for this user.</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-[var(--app-card-border)]">
        {tokens.map((token, index) => {
          // Format the token balance
          let formattedBalance = "Unknown";
          try {
            if (token.tokenBalance && token.decimals) {
              // Remove '0x' prefix and convert from hex to decimal
              const balanceValue = BigInt(token.tokenBalance);
              formattedBalance = formatUnits(balanceValue, token.decimals);
              
              // Truncate to 6 decimal places for display
              const parts = formattedBalance.split('.');
              if (parts.length > 1 && parts[1].length > 6) {
                formattedBalance = `${parts[0]}.${parts[1].substring(0, 6)}`;
              }
            }
          } catch (e) {
            console.error("Error formatting balance:", e);
          }

          return (
            <li key={index} className="py-3 flex items-center">
              <div className="flex-shrink-0 mr-3">
                {token.logo ? (
                  <img 
                    src={token.logo} 
                    alt={token.symbol || 'Token'} 
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--app-gray)] flex items-center justify-center">
                    <span className="text-[var(--app-foreground-muted)]">
                      {(token.symbol || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-[var(--app-foreground)]">
                  {token.name || 'Unknown Token'}
                  {token.symbol && <span className="ml-2 text-[var(--app-foreground-muted)]">{token.symbol}</span>}
                </div>
                <div className="text-sm text-[var(--app-foreground)]">
                  {formattedBalance} {token.symbol}
                </div>
                {token.addresses && token.addresses.length > 1 && (
                  <div className="text-xs text-[var(--app-foreground-muted)] mt-1">
                    Found in {token.addresses.length} addresses
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 