import { NextResponse } from 'next/server';
import { getName } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const addresses = searchParams.get('addresses');
  
  if (!addresses) {
    return NextResponse.json({ error: 'Missing addresses parameter' }, { status: 400 });
  }

  try {
    // Parse the comma-separated addresses
    const addressList = addresses.split(',');
    
    // Fetch basenames for each address
    const basenamesPromises = addressList.map(async (address) => {
      try {
        // Ensure address is a proper hex string
        const formattedAddress = address.startsWith('0x') ? address as `0x${string}` : `0x${address}` as `0x${string}`;
        const basename = await getName({ address: formattedAddress, chain: base });
        return { address: formattedAddress, basename };
      } catch (error) {
        console.error(`Error fetching basename for ${address}:`, error);
        return { address, basename: null, error: 'Failed to fetch basename' };
      }
    });
    
    const results = await Promise.all(basenamesPromises);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching basenames:', error);
    return NextResponse.json({ error: 'Failed to fetch basenames' }, { status: 500 });
  }
} 