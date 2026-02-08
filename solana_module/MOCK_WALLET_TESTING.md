# Mock Wallet Testing Guide

The Mock Wallet allows you to test Solana blockchain integration without installing a browser wallet extension.

## How to Test with Mock Wallet

### 1. **Go to Your App**
```
http://localhost:3000/home
```

### 2. **Click "Blockchain" Button**
- You'll see a popup with wallet connection options

### 3. **Select "Mock Wallet (Dev Only)"**
- Click the "Select Wallet" button
- Choose **"Mock Wallet (Dev Only)"** from the list
- It will have a purple "MW" icon

### 4. **Connect the Mock Wallet**
- Click "Connect"
- The wallet will connect in ~500ms (simulated)
- You'll see a mock wallet address displayed

### 5. **Commit to Blockchain**
- The commit button should now be enabled
- Click **"Lock Your Twin Forever on Blockchain"**
- Wait ~1.5 seconds (simulated processing)
- You'll see a success message with a mock transaction ID

### 6. **Verify Mock Mode**
- Success message will show: **🎭 Mock commitment successful!**
- Warning: "This is a simulated transaction (Mock Wallet mode)"
- Mock transaction ID format: `MOCK_TX_xxxxxxxxxxxxx`
- No actual blockchain transaction occurs

## Mock Wallet Features

✅ **Simulates Real Wallet Behavior:**
- Connection flow with delays
- Transaction signing with delays
- Message signing support
- Disconnect functionality

✅ **Deterministic Mock Address:**
- Always uses the same mock public key for consistency
- Address: `11111111111111111111111111111112` (deterministic)

✅ **Console Logging:**
- All mock wallet actions are logged to console with 🎭 emoji
- Check browser DevTools Console to see:
  - `🎭 Mock Wallet: Simulated transaction signing`
  - `🎭 Mock Wallet Mode: Simulating blockchain commitment`
  - `🎭 Mock Transaction Signature: ...`

## Differences from Real Wallet

| Feature | Mock Wallet | Real Wallet (Phantom) |
|---------|------------|----------------------|
| Installation | None needed | Browser extension required |
| Blockchain | Simulated only | Real Solana Devnet/Mainnet |
| Transaction | Mock signature | Actual on-chain transaction |
| Cost | Free | ~0.000005 SOL (~$0.0005) |
| Explorer Link | Not available | View on Solana Explorer |
| Balance | Not shown | Shows actual SOL balance |

## When to Use Each

### Use Mock Wallet When:
- ✅ Testing wallet connection UI
- ✅ Testing component behavior
- ✅ Developing without internet
- ✅ Quick iteration during development
- ✅ Demonstrating to non-technical users

### Use Real Wallet When:
- ✅ Testing actual blockchain transactions
- ✅ Verifying on-chain commitment
- ✅ Testing with real SOL
- ✅ End-to-end integration testing
- ✅ Production deployment

## Switching to Real Wallet

To test with a real wallet later:

1. Install Phantom from https://phantom.app/
2. Switch to Devnet in Phantom settings
3. Get free SOL from https://faucet.solana.com/
4. Select "Phantom" instead of "Mock Wallet" when connecting
5. Approve the real transaction

## Troubleshooting

**Mock wallet doesn't appear in list?**
- Refresh the page
- Check console for errors
- Verify WalletProvider includes MockWalletAdapter

**Commit button stays disabled?**
- Make sure mock wallet is connected
- Check if `publicKey` is set (look in DevTools)
- Verify twinData has personalityAnswers and diaryEntries

**No success message after commit?**
- Open browser console (F12)
- Look for error messages
- Check if commitment logic completed

## Code Location

- **Mock Wallet Adapter:** `solana_module/lib/mockWallet.ts`
- **Wallet Provider:** `solana_module/components/WalletProvider.tsx`
- **Commit Component:** `solana_module/components/BlockchainCommit.tsx`

## For Production

**Important:** The Mock Wallet should NOT be included in production builds!

To remove it for production:
1. Remove `new MockWalletAdapter()` from `WalletProvider.tsx`
2. Or conditionally include it only in development:

```typescript
const wallets = useMemo(
  () => [
    ...(process.env.NODE_ENV === 'development' ? [new MockWalletAdapter()] : []),
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ],
  []
);
```
