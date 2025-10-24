# Deployment Guide

## Prerequisites

1. Foundry installed: https://book.getfoundry.sh/getting-started/installation
2. Private key with Scroll Sepolia testnet ETH
3. RPC endpoint (or use default)

## Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your values:
```env
SCROLL_RPC_URL=https://sepolia-rpc.scroll.io/
PRIVATE_KEY=your_private_key_here
```

## Deploy to Scroll Sepolia

```bash
forge script contracts/script/Deploy.s.sol:Deploy \
  --rpc-url $SCROLL_RPC_URL \
  --broadcast \
  --verify
```

### Without verification:
```bash
forge script contracts/script/Deploy.s.sol:Deploy \
  --rpc-url $SCROLL_RPC_URL \
  --broadcast
```

## Verify Deployment

After deployment, you'll see addresses in the output:
```
LendingPool deployed at: 0x...
IdentityVerifier deployed at: 0x...
```

Save these addresses to use in the frontend.

## Testnet Faucets

- Scroll Sepolia: https://faucet.scroll.io/

## Network Details

- Chain ID: 534351 (Scroll Sepolia)
- RPC: https://sepolia-rpc.scroll.io/
- Explorer: https://sepolia-blockscout.scroll.io/
