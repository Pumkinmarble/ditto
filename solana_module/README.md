# Solana Integration Module

This module handles blockchain integration for the Echo AI Digital Twin project.

## Structure

```
solana_module/
├── lib/
│   └── solana.ts          # Solana client, wallet helpers, transaction functions
├── components/
│   └── WalletConnect.tsx  # Wallet connection UI component
└── app/
    └── api/
        └── blockchain/
            └── commit/
                └── route.ts  # API route for committing twin to blockchain
```

## Responsibilities

### lib/solana.ts
- Solana connection setup
- Wallet interaction helpers
- Transaction creation and signing
- Blockchain commitment logic

### components/WalletConnect.tsx
- Wallet adapter integration
- Connect/disconnect UI
- Wallet status display
- Transaction confirmation UI

### app/api/blockchain/commit/route.ts
- POST endpoint for blockchain commitment
- Creates transaction with AI twin metadata
- Returns transaction hash
- Updates user record in Supabase

## Dependencies

```bash
npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/wallet-adapter-react-ui
```

## Environment Variables

```env
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
```

## Priority

**OPTIONAL** - Build only if 2+ hours remain after core features (personality quiz, diary, AI chat, voice cloning) are complete.

## Integration Points

- Updates `users.wallet_address` and `users.solana_tx_hash` in Supabase after commitment
- Works with existing auth system (Auth0)
- Optional feature for "lock forever" value proposition
