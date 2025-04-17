import { NextResponse } from 'next/server';

export interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
  name?: string;
  symbol?: string;
  logo?: string;
  decimals?: number;
  error?: string;
  address?: string; // Track which address this token belongs to
  addresses?: string[]; // List of addresses that own this token
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const addresses = searchParams.get('addresses');
  
  if (!addresses) {
    return NextResponse.json({ error: 'Missing addresses parameter' }, { status: 400 });
  }

  const addressList = addresses.split(',');
  if (addressList.length === 0) {
    return NextResponse.json({ error: 'No valid addresses provided' }, { status: 400 });
  }

  const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
  
  if (!ALCHEMY_API_KEY) {
    return NextResponse.json({ error: 'Alchemy API key not configured' }, { status: 500 });
  }

  try {
    // Base mainnet is currently supported by Alchemy
    const network = 'base-mainnet';
    const url = `https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    
    // Fetch token balances for each address
    const allTokensPromises = addressList.map(async (address) => {
      try {
        // Get token balances using Alchemy API
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            method: 'alchemy_getTokenBalances',
            params: [address]
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch token balances for ${address}`);
        }

        const data = await response.json();
        const tokenBalances = data.result.tokenBalances || [];

        // Get token metadata for non-zero balances
        const nonZeroBalances = tokenBalances
          .filter((token: { tokenBalance: string }) => token.tokenBalance !== '0x0')
          .map((token: { contractAddress: string; tokenBalance: string }) => ({
            ...token,
            address, // Add the address this token belongs to
          }));

        return nonZeroBalances;
      } catch (error) {
        console.error(`Error fetching token balances for ${address}:`, error);
        return [];
      }
    });

    // Wait for all token balance requests to complete
    const allTokensArrays = await Promise.all(allTokensPromises);
    
    // Flatten and get unique tokens by contract address
    // If a user owns the same token in multiple addresses, we'll combine the balances
    const allTokens = allTokensArrays.flat();
    
    // Group tokens by contract address
    const tokensByContract: Record<string, TokenBalance[]> = {};
    
    allTokens.forEach((token: TokenBalance) => {
      if (!tokensByContract[token.contractAddress]) {
        tokensByContract[token.contractAddress] = [];
      }
      tokensByContract[token.contractAddress].push(token);
    });
    
    // Get metadata for each unique token and combine balances
    const uniqueTokensPromises = Object.entries(tokensByContract).map(async ([contractAddress, tokens]) => {
      try {
        // Get metadata for this token
        const metadataResponse = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            method: 'alchemy_getTokenMetadata',
            params: [contractAddress]
          })
        });
        
        if (!metadataResponse.ok) {
          throw new Error('Failed to fetch token metadata');
        }
        
        const metadataData = await metadataResponse.json();
        const metadata = metadataData.result;
        
        // Take the first token as base and add all balances from other addresses
        const baseToken = tokens[0];
        
        // Only include top 5 tokens by balance
        return {
          ...baseToken,
          name: metadata.name,
          symbol: metadata.symbol,
          logo: metadata.logo,
          decimals: metadata.decimals,
          addresses: tokens.map(t => t.address)
        };
      } catch (error) {
        console.error(`Error fetching token metadata for ${contractAddress}:`, error);
        return {
          contractAddress,
          tokenBalance: tokens[0].tokenBalance,
          error: 'Failed to fetch token metadata',
          addresses: tokens.map(t => t.address)
        };
      }
    });
    
    let enrichedTokens = await Promise.all(uniqueTokensPromises);
    
    // Sort by token balance (from highest to lowest) and take top 5
    enrichedTokens = enrichedTokens
      .sort((a, b) => {
        const balanceA = BigInt(a.tokenBalance || '0x0');
        const balanceB = BigInt(b.tokenBalance || '0x0');
        return balanceB > balanceA ? 1 : -1;
      })
      .slice(0, 5);
    
    return NextResponse.json({ tokens: enrichedTokens });
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return NextResponse.json({ error: 'Failed to fetch token balances' }, { status: 500 });
  }
} 