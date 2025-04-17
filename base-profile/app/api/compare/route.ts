import { NextResponse } from 'next/server';
import { NFT } from '../nft/route';

interface ComparisonResult {
  user1NFTs: NFT[];
  user2NFTs: NFT[];
  commonNFTs: NFT[];
  user1Total: number;
  user2Total: number;
  commonTotal: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const addresses1 = searchParams.get('addresses1');
  const addresses2 = searchParams.get('addresses2');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  
  if (!addresses1 || !addresses2) {
    return NextResponse.json({ error: 'Missing addresses1 or addresses2 parameter' }, { status: 400 });
  }

  const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
  
  if (!ALCHEMY_API_KEY) {
    return NextResponse.json({ error: 'Alchemy API key not configured' }, { status: 500 });
  }

  try {
    // Base mainnet is currently supported by Alchemy
    const network = 'base-mainnet';

    // Fetch NFTs for both users
    const user1NFTs = await fetchAllNFTs(network, ALCHEMY_API_KEY, addresses1.split(','));
    const user2NFTs = await fetchAllNFTs(network, ALCHEMY_API_KEY, addresses2.split(','));

    // Find common NFTs (same contract address and tokenId)
    const commonNFTs = findCommonNFTs(user1NFTs, user2NFTs);
    
    // Limit the results
    const limitedUser1NFTs = user1NFTs.slice(0, limit);
    const limitedUser2NFTs = user2NFTs.slice(0, limit);
    const limitedCommonNFTs = commonNFTs.slice(0, limit);
    
    const result: ComparisonResult = {
      user1NFTs: limitedUser1NFTs,
      user2NFTs: limitedUser2NFTs,
      commonNFTs: limitedCommonNFTs,
      user1Total: user1NFTs.length,
      user2Total: user2NFTs.length,
      commonTotal: commonNFTs.length
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error comparing NFTs:', error);
    return NextResponse.json({ error: 'Failed to compare NFTs' }, { status: 500 });
  }
}

async function fetchAllNFTs(network: string, apiKey: string, addresses: string[]): Promise<NFT[]> {
  // Fetch NFTs for each address
  const nftPromises = addresses.map(async (address) => {
    try {
      const url = `https://${network}.g.alchemy.com/v2/${apiKey}/getNFTs/?owner=${address}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch NFTs for ${address}`);
      }

      const data = await response.json();
      const nfts = data.ownedNfts || [];
      
      // Add the owner address to each NFT
      return nfts.map((nft: NFT) => ({
        ...nft,
        address
      }));
    } catch (error) {
      console.error(`Error fetching NFTs for ${address}:`, error);
      return [];
    }
  });
  
  const allNftsArrays = await Promise.all(nftPromises);
  const allNfts = allNftsArrays.flat();
  
  // Enrich NFTs with estimated value
  const enrichedNfts = allNfts.map((nft: NFT) => {
    try {
      // For demonstration, create a mock estimated value
      const contractHash = nft.contract.address.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const tokenIdValue = parseInt(nft.tokenId, 16) || parseInt(nft.tokenId) || 0;
      const estimatedValue = (contractHash * tokenIdValue) % 10000 / 100; // Value between 0 and 100 ETH
      
      return {
        ...nft,
        estimatedValue
      };
    } catch (error) {
      console.error(`Error enriching NFT ${nft.contract.address}/${nft.tokenId}:`, error);
      return nft;
    }
  });

  // Sort by estimated value (highest first)
  enrichedNfts.sort((a, b) => 
    ((b.estimatedValue || 0) - (a.estimatedValue || 0))
  );
  
  return enrichedNfts;
}

function findCommonNFTs(nfts1: NFT[], nfts2: NFT[]): NFT[] {
  // Create a map of contract address + tokenId to identify unique NFTs
  const nft1Map = new Map<string, NFT>();
  
  nfts1.forEach(nft => {
    const key = `${nft.contract.address.toLowerCase()}-${nft.tokenId}`;
    nft1Map.set(key, nft);
  });
  
  // Find common NFTs
  const commonNFTs: NFT[] = [];
  
  nfts2.forEach(nft => {
    const key = `${nft.contract.address.toLowerCase()}-${nft.tokenId}`;
    if (nft1Map.has(key)) {
      commonNFTs.push(nft);
    }
  });
  
  return commonNFTs;
} 