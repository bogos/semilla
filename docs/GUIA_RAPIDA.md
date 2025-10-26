# Semilla Quick Start

Get the Semilla project running locally in 5 minutes.

## Prerequisites

- **Foundry**: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
- **Node.js 18+** and **pnpm**: `npm install -g pnpm`
- **MetaMask**: Browser extension

## 1. Start Local Blockchain (Terminal 1)

```bash
anvil
```

You'll see 10 test accounts. **Save the first private key** for the deployment script.

Example output:
```
Private Keys
==================
(0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb476cac3eda7909711f8080c8171
```

## 2. Deploy Contracts (Terminal 2)

```bash
# Navigate to project
cd /home/bogo/semilla

# Export private key from Anvil output
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb476cac3eda7909711f8080c8171

# Run deployment script (auto-deploys and creates test pool)
./scripts/deploy-local.sh
```

The script will:
- ✓ Deploy PoolRegistry
- ✓ Deploy LendingFactory  
- ✓ Deploy IdentityVerifier
- ✓ Whitelist ETH as supported asset
- ✓ Create a test pool
- ✓ Update frontend `.env.local`

**Save the printed addresses** (especially VITE_POOL_REGISTRY_ADDRESS and VITE_LENDING_FACTORY_ADDRESS).

## 3. Start Frontend (Terminal 3)

```bash
cd /home/bogo/semilla/frontend

# Install dependencies (first time only)
pnpm install

# Start dev server
pnpm dev
```

Frontend will be at **http://localhost:5173**

## 4. Setup MetaMask

1. **Add Network**:
   - Open MetaMask settings → Networks → Add Network
   - Name: `Localhost`
   - RPC: `http://localhost:8545`
   - Chain ID: `31337`
   - Symbol: `ETH`

2. **Import Test Account**:
   - MetaMask → Account → Import Account
   - Paste private key from Anvil (the one you used in step 2)
   - Name: `Test Account` (or any name)

3. **Connect**:
   - Go to http://localhost:5173
   - Click "Connect Wallet"
   - Select the imported account

## 5. Test the App

✓ **Browse Pools**: Navigate to `/browse-pools` - you should see the created test pool
✓ **Deposit**: Click on a pool → "Deposit" button
✓ **Dashboard**: Check `/dashboard` to see your deposits
✓ **Verify Identity**: Try the identity verification feature

## Common Issues

### "Cannot connect to Anvil"
- Ensure Anvil is running in terminal 1
- Check RPC URL is correct: `http://localhost:8545`

### "Transaction failed" / "Gas estimation failed"
- Ensure MetaMask is on **Localhost chain (31337)**
- Your test account has plenty of ETH (Anvil gives 1000 ETH)

### ".env.local not loading"
- Restart the dev server after running `deploy-local.sh`
- Check that `.env.local` exists in `/frontend` directory

### "Cannot find module 'viem'"
- Run `pnpm install` in the frontend directory

## Create More Pools

After deployment, create additional pools with:

```bash
export PRIVATE_KEY=0x...
export FACTORY_ADDRESS=0x...  # From deployment output

cast send $FACTORY_ADDRESS \
  "createPool(string,address,uint256,uint16)" \
  "My Pool Name" \
  "0x0000000000000000000000000000000000000000" \
  8 \
  2000 \
  --rpc-url http://localhost:8545 \
  --private-key $PRIVATE_KEY
```

## Next Steps

- Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed information
- Check contract source in `/contracts/src/`
- Explore frontend code in `/frontend/src/`

## Terminal Commands Reference

```bash
# Check block number
cast block-number --rpc-url http://localhost:8545

# Get balance
cast balance 0x... --rpc-url http://localhost:8545

# Call function
cast call 0x... "function()" --rpc-url http://localhost:8545

# Send transaction  
cast send 0x... "function(args)" --rpc-url http://localhost:8545 --private-key 0x...
```

## Need Help?

- Check browser console for frontend errors (`F12`)
- Check Anvil terminal for transaction details
- Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) troubleshooting section
