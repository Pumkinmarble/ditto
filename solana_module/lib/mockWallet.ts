/**
 * Mock Wallet Adapter for Testing
 * Simulates a Solana wallet without requiring browser extension
 */

import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import {
  BaseMessageSignerWalletAdapter,
  WalletReadyState,
  WalletNotConnectedError,
} from '@solana/wallet-adapter-base';

export class MockWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = 'Mock Wallet (Dev Only)' as const;
  url = 'https://example.com';
  icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzlBNDVGRiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSI+TVc8L3RleHQ+PC9zdmc+';

  private _publicKey: PublicKey | null = null;
  private _connecting = false;
  private _connected = false;

  get publicKey() {
    return this._publicKey;
  }

  get connecting() {
    return this._connecting;
  }

  get connected() {
    return this._connected;
  }

  get readyState() {
    return WalletReadyState.Installed;
  }

  async connect(): Promise<void> {
    try {
      if (this._connected || this._connecting) return;

      this._connecting = true;

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate a mock public key
      // Using a deterministic key for consistency in testing
      const mockKeyBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        mockKeyBytes[i] = i * 8 % 256;
      }
      this._publicKey = new PublicKey(mockKeyBytes);

      this._connected = true;
      this.emit('connect', this._publicKey);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this._publicKey) {
      this._publicKey = null;
      this._connected = false;
      this.emit('disconnect');
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> {
    if (!this._connected || !this._publicKey) {
      throw new WalletNotConnectedError();
    }

    // Simulate signing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // In a real wallet, this would actually sign the transaction
    // For mock purposes, we just return the transaction as-is
    // The transaction will be "signed" but with invalid signatures
    console.log('🎭 Mock Wallet: Simulated transaction signing');

    return transaction;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]> {
    if (!this._connected || !this._publicKey) {
      throw new WalletNotConnectedError();
    }

    // Simulate signing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(`🎭 Mock Wallet: Simulated signing ${transactions.length} transactions`);

    return transactions;
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this._connected || !this._publicKey) {
      throw new WalletNotConnectedError();
    }

    // Simulate signing delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Return a mock signature (64 bytes)
    const mockSignature = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
      mockSignature[i] = i % 256;
    }

    console.log('🎭 Mock Wallet: Simulated message signing');

    return mockSignature;
  }
}
