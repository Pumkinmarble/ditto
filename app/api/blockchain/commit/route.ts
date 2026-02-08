/**
 * Blockchain Commitment API Route
 * Commits AI digital twin metadata to Solana blockchain
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCommitmentTransaction, getExplorerUrl, type TwinCommitmentData } from '@/solana_module/lib/solana';
import { requireAuth } from '@/lib/auth';
import crypto from 'crypto';

/**
 * POST /api/blockchain/commit
 * Creates a commitment transaction for the AI digital twin
 */
export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth();

    // Parse request body
    const body = await req.json();
    const {
      walletAddress,
      personalityAnswers,
      diaryEntries,
      voiceData,
    } = body;

    // Validate wallet address
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Validate required data
    if (!personalityAnswers || !diaryEntries) {
      return NextResponse.json(
        { error: 'Missing required twin data (personality or diary)' },
        { status: 400 }
      );
    }

    // Create hashes of the twin data
    const personalityHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(personalityAnswers))
      .digest('hex');

    const diaryHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(diaryEntries))
      .digest('hex');

    const voiceHash = voiceData
      ? crypto.createHash('sha256').update(JSON.stringify(voiceData)).digest('hex')
      : undefined;

    // Prepare commitment data
    const twinData: TwinCommitmentData = {
      userId: session.user.sub,
      email: session.user.email || 'unknown',
      personalityHash,
      diaryHash,
      voiceHash,
      timestamp: Date.now(),
    };

    // Create the commitment transaction
    const transaction = await createCommitmentTransaction(walletAddress, twinData);

    // Serialize transaction for client-side signing
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    // Return transaction data to client
    // Client will sign and submit the transaction
    return NextResponse.json({
      success: true,
      transaction: serializedTransaction.toString('base64'),
      commitment: {
        userId: twinData.userId,
        email: twinData.email,
        personalityHash: twinData.personalityHash,
        diaryHash: twinData.diaryHash,
        voiceHash: twinData.voiceHash,
        timestamp: twinData.timestamp,
      },
      message: 'Transaction created. Please sign with your wallet.',
    });
  } catch (error) {
    console.error('Error creating commitment transaction:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create commitment transaction' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blockchain/commit?signature=xxx
 * Verifies a transaction and returns commitment details
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const signature = searchParams.get('signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing transaction signature' },
        { status: 400 }
      );
    }

    // Get explorer URL
    const explorerUrl = getExplorerUrl(signature, 'devnet');

    return NextResponse.json({
      success: true,
      signature,
      explorerUrl,
      message: 'View your commitment on Solana Explorer',
    });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return NextResponse.json(
      { error: 'Failed to verify transaction' },
      { status: 500 }
    );
  }
}
