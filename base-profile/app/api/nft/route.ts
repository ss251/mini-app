import { NextResponse } from 'next/server';

export interface NFT {
  contract: {
    address: string;
    name?: string;
    symbol?: string;
  };
  tokenId: string;
  tokenType: string;
  title?: string;
  description?: string;
  timeLastUpdated: string;
  rawMetadata?: {
    name?: string;
    description?: string;
    image?: string;
    animation_url?: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  media?: Array<{
    gateway: string;
    thumbnail?: string;
    raw?: string;
    format?: string;
    bytes?: number;
  }>;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    animation_url?: string;
  };
  floorPrice?: {
    value: number;
    currency: string;
  };
  estimatedValue?: number;
  address?: string; // Which address owns this NFT
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const addresses = searchParams.get('addresses');
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  
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
    
    // Fetch NFTs for each address
    const nftPromises = addressList.map(async (address) => {
      try {
        const url = `https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}/getNFTs/?owner=${address}`;
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
    
    if (allNfts.length === 0) {
      return NextResponse.json({ 
        nfts: [], 
        mostExpensiveNft: null, 
        message: 'No NFTs found for these addresses' 
      });
    }

    // Enrich NFTs with estimated value
    const enrichedNfts = allNfts.map((nft: NFT) => {
      try {
        // For demonstration, create a mock estimated value
        // In a real app, you'd integrate with a price oracle or marketplace API
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
    
    const mostExpensiveNft = enrichedNfts.length > 0 ? enrichedNfts[0] : null;
    
    // Limit the number of NFTs returned
    const limitedNfts = enrichedNfts.slice(0, limit);
    
    return NextResponse.json({ 
      nfts: limitedNfts,
      mostExpensiveNft,
      total: enrichedNfts.length
    });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 });
  }
} 