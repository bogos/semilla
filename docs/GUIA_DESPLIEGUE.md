# Semilla Deployment Guide

This guide covers deploying the Semilla smart contracts locally and integrating them with the frontend.

## Prerequisites

- Node.js 18+ and npm/pnpm
- Foundry (for Solidity compilation and deployment)
- A local blockchain (Anvil, Hardhat, or similar)
- Private key for deployment

## Part 1: Local Blockchain Setup

### Start a Local Blockchain (Anvil)

```bash
# Install Foundry if not already installed
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Start Anvil on localhost:8545
anvil
```

This will output 10 test accounts with private keys. Save these for later use.

Example output:
```
Account #0: 0x1234...
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb476cac3eda7909711f8080c8171
```

## Part 2: Deploy Smart Contracts

### 1. Setup Environment Variables

Create `.env` file in the `/contracts` directory:

```bash
# Private key of deployer account (use one from Anvil)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb476cac3eda7909711f8080c8171

# RPC endpoint (local Anvil)
RPC_URL=http://localhost:8545
```

### 2. Deploy Contracts

```bash
cd /home/bogo/semilla/contracts

# Deploy all contracts using the Deploy script
forge script script/Deploy.s.sol:Deploy --rpc-url http://localhost:8545 --broadcast --private-key <YOUR_PRIVATE_KEY>
```

**Important**: The script will output the deployed contract addresses. Save these!

Example output:
```
=== Deploying Semilla Contracts ===
Deployer: 0x1234...

1. PoolRegistry deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
2. LendingFactory deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
3. PoolRegistry updated with factory address
4. IdentityVerifier deployed at: 0x9fE46736679d2D9a88020340A6BA7b3d4d6AB08a

=== Deployment Complete ===
```

## Part 3: Initialize Contracts

### 1. Whitelist Assets in LendingFactory

You need to whitelist an asset (token) before creating pools. For local testing, you can use ETH or deploy a mock ERC20 token.

**Option A: Use ETH (Recommended for Quick Testing)**

The LendingPool contract already accepts ETH via payable functions.

**Option B: Deploy Mock ERC20 Token** (Optional)

```solidity
// Use a tool like Remix or Hardhat to deploy a mock ERC20
// Then whitelist it in the factory
```

### 2. Create a Test Pool

Using `cast` (Foundry's CLI tool):

```bash
# Set variables
FACTORY_ADDRESS="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"  # Your deployed factory
ASSET_ADDRESS="0x0000000000000000000000000000000000000000"   # Zero address for ETH
DEPLOYER_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb476cac3eda7909711f8080c8171"

# Whitelist ETH (zero address) as supported asset
cast send $FACTORY_ADDRESS "whitelistAsset(address)" $ASSET_ADDRESS \
  --rpc-url http://localhost:8545 \
  --private-key $DEPLOYER_KEY

# Create a pool
# Parameters: name, asset, apr (in %), rifCoverageBp (basis points, e.g., 2000 = 20%)
cast send $FACTORY_ADDRESS "createPool(string,address,uint256,uint16)" \
  "Test Pool" \
  $ASSET_ADDRESS \
  8 \
  2000 \
  --rpc-url http://localhost:8545 \
  --private-key $DEPLOYER_KEY
```

**Or use a script** (easier):

Create `scripts/setup-contracts.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const factoryAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const factory = await hre.ethers.getContractAt("LendingFactory", factoryAddress);
  
  // Whitelist ETH (zero address)
  const tx1 = await factory.whitelistAsset("0x0000000000000000000000000000000000000000");
  console.log("Asset whitelisted:", tx1.hash);
  
  // Create pool
  const tx2 = await factory.createPool("Semilla Test Pool", "0x0000000000000000000000000000000000000000", 8, 2000);
  console.log("Pool created:", tx2.hash);
  
  const receipt = await tx2.wait();
  console.log("Pool creation receipt:", receipt);
}

main().catch(console.error);
```

## Part 4: Frontend Integration

### 1. Update Environment Variables

Create `.env.local` in the `/frontend` directory:

```env
# Contract addresses (from deployment output)
VITE_POOL_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_LENDING_FACTORY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_IDENTITY_VERIFIER_ADDRESS=0x9fE46736679d2D9a88020340A6BA7b3d4d6AB08a

# Local blockchain RPC
VITE_RPC_URL=http://localhost:8545
```

### 2. Update wagmi Configuration

The frontend uses wagmi for Web3 interactions. Verify `src/config/wagmi.ts` is configured for localhost:

```typescript
// Should include localhost/Anvil chain configuration
const chains = [
  {
    id: 31337, // Anvil chain ID
    name: 'Localhost',
    network: 'localhost',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: 'http://localhost:8545' },
  },
];
```

### 3. Start Frontend Development Server

```bash
cd /home/bogo/semilla/frontend

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

The frontend will be available at `http://localhost:5173` (or similar).

## Part 5: Test Integration

### 1. Connect Wallet

- Open the frontend
- Click "Connect Wallet"
- Import an Anvil test account into MetaMask:
  - Go to Account Settings → Import Account
  - Paste private key from Anvil output
  - Network: Add custom network
    - Name: Localhost
    - RPC: http://localhost:8545
    - Chain ID: 31337
    - Currency: ETH

### 2. Test Pool Interactions

1. **Browse Pools**: Navigate to `/browse-pools` - should show your created pool
2. **Deposit**: Click on a pool and deposit ETH
3. **Dashboard**: View deposits on `/dashboard`
4. **Verify Identity**: Try the identity verification feature

## Troubleshooting

### Contract Addresses Show as 0x0000...

- Check environment variables are properly set
- Verify `.env.local` is in the correct directory
- Restart the dev server after updating `.env.local`

### Wallet Connection Issues

- Ensure MetaMask is set to the correct network (Localhost, Chain ID 31337)
- Clear MetaMask cache if experiencing issues
- Check RPC URL in MetaMask settings

### Transaction Failures

- Ensure test account has sufficient ETH balance (Anvil gives 1000 ETH to each test account)
- Check contract is properly initialized
- Verify asset is whitelisted before creating pools

### Frontend Shows Mocked Data Instead of Contract Data

- Check hooks in `src/hooks/usePoolData.ts` are properly connected
- Verify contract ABIs match deployed contract functions
- Check browser console for errors

## Environment Variables Reference

### Frontend (.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_POOL_REGISTRY_ADDRESS` | PoolRegistry contract address | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| `VITE_LENDING_FACTORY_ADDRESS` | LendingFactory contract address | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
| `VITE_IDENTITY_VERIFIER_ADDRESS` | IdentityVerifier contract address | `0x9fE46736679d2D9a88020340A6BA7b3d4d6AB08a` |
| `VITE_RPC_URL` | JSON-RPC endpoint | `http://localhost:8545` |

### Contracts (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PRIVATE_KEY` | Deployer private key | `0xac0974...` |
| `RPC_URL` | JSON-RPC endpoint | `http://localhost:8545` |

## Next Steps

1. **Add More Pools**: Use the factory to create additional pools with different APRs
2. **Integrate Real Tokens**: Deploy mock ERC20 tokens and use them in pools
3. **Deploy to Testnet**: Update RPC URLs to use Scroll Sepolia or similar
4. **Add Frontend Features**: Implement loan application, dashboard analytics, etc.
5. **Add Tests**: Create test suites for contracts and frontend

## Useful Commands

```bash
# Get account info
cast account-address <PRIVATE_KEY>

# Check account balance
cast balance <ADDRESS> --rpc-url http://localhost:8545

# Call view functions
cast call <CONTRACT> "functionName()" --rpc-url http://localhost:8545

# Send transactions
cast send <CONTRACT> "functionName(params)" --rpc-url http://localhost:8545 --private-key <KEY>

# Decode function call
cast --decode-calldata <CALLDATA>

# Monitor Anvil logs
# Check the terminal where you ran `anvil`
```

## Security Notes

⚠️ **This guide uses test accounts and localhost deployment for development only.**

For production:
- Never commit private keys to version control
- Use hardware wallets for mainnet deployments
- Implement proper access controls and security audits
- Use testnet (Scroll Sepolia) before mainnet

