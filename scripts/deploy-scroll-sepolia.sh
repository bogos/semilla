#!/bin/bash

# Semilla Deployment Script for Scroll Sepolia
# This script deploys contracts to Scroll Sepolia testnet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTRACTS_DIR="/home/bogo/semilla/contracts"
FRONTEND_DIR="/home/bogo/semilla/frontend"
RPC_URL="${RPC_URL:-https://sepolia-rpc.scroll.io/}"
PRIVATE_KEY="${PRIVATE_KEY}"
SCROLL_SEPOLIA_CHAIN_ID=534351

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Semilla Scroll Sepolia Deployment${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if private key is set
echo -e "\n${YELLOW}[1/6] Validating configuration...${NC}"
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ PRIVATE_KEY environment variable not set${NC}"
    echo -e "${YELLOW}Export your private key: export PRIVATE_KEY=0x...${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Private key set${NC}"

# Get deployer address
DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY)
echo -e "${BLUE}Deployer: $DEPLOYER${NC}"

# Check balance
echo -e "${YELLOW}Checking balance on Scroll Sepolia...${NC}"
BALANCE=$(cast balance $DEPLOYER --rpc-url $RPC_URL)
BALANCE_ETH=$(cast to-unit $BALANCE 18)
echo -e "${BLUE}Balance: $BALANCE_ETH ETH${NC}"

if [ -z "$BALANCE_ETH" ] || [ "$BALANCE_ETH" == "0" ]; then
    echo -e "${RED}⚠️  Warning: Low or zero balance${NC}"
    echo -e "${YELLOW}Get testnet ETH from: https://faucet.scroll.io/${NC}"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Navigate to contracts directory
cd $CONTRACTS_DIR

# Create or update .env
echo -e "\n${YELLOW}[2/6] Setting up environment...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << EOF
PRIVATE_KEY=$PRIVATE_KEY
SCROLL_RPC_URL=$RPC_URL
EOF
    echo -e "${GREEN}✓ .env created${NC}"
fi

# Deploy contracts
echo -e "\n${YELLOW}[3/6] Deploying smart contracts to Scroll Sepolia...${NC}"
echo -e "${BLUE}This may take 2-3 minutes...${NC}"

DEPLOY_OUTPUT=$(forge script script/Deploy.s.sol:Deploy \
    --rpc-url $RPC_URL \
    --broadcast \
    --private-key $PRIVATE_KEY 2>&1)

# Extract addresses
POOL_REGISTRY=$(echo "$DEPLOY_OUTPUT" | grep "PoolRegistry:" | grep -oE '0x[a-fA-F0-9]{40}')
LENDING_FACTORY=$(echo "$DEPLOY_OUTPUT" | grep "LendingFactory:" | grep -oE '0x[a-fA-F0-9]{40}')
IDENTITY_VERIFIER=$(echo "$DEPLOY_OUTPUT" | grep "IdentityVerifier:" | grep -oE '0x[a-fA-F0-9]{40}')
MOCK_USDC=$(echo "$DEPLOY_OUTPUT" | grep "MockUSDC:" | grep -oE '0x[a-fA-F0-9]{40}')
MOCK_USX=$(echo "$DEPLOY_OUTPUT" | grep "MockUSX:" | grep -oE '0x[a-fA-F0-9]{40}')

if [ -z "$POOL_REGISTRY" ] || [ -z "$LENDING_FACTORY" ] || [ -z "$IDENTITY_VERIFIER" ]; then
    echo -e "${RED}❌ Failed to extract contract addresses${NC}"
    echo -e "${YELLOW}Deployment output:${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo -e "${GREEN}✓ Contracts deployed:${NC}"
echo -e "  ${BLUE}PoolRegistry: $POOL_REGISTRY${NC}"
echo -e "  ${BLUE}LendingFactory: $LENDING_FACTORY${NC}"
echo -e "  ${BLUE}IdentityVerifier: $IDENTITY_VERIFIER${NC}"
echo -e "  ${BLUE}MockUSDC: $MOCK_USDC${NC}"
echo -e "  ${BLUE}MockUSX: $MOCK_USX${NC}"

# Create test pool (optional - wait for gas prices to be reasonable)
echo -e "\n${YELLOW}[4/6] Creating test pools...${NC}"

POOL_NAME="Semilla Scroll Pool"
APR=8
RIF_COVERAGE=2000
ETH_ADDRESS="0x0000000000000000000000000000000000000000"

echo -e "${BLUE}Creating ETH pool on Scroll Sepolia...${NC}"
POOL_TX=$(cast send $LENDING_FACTORY \
    "createPool(string,address,uint256,uint16,bool)" \
    "$POOL_NAME" \
    $ETH_ADDRESS \
    $APR \
    $RIF_COVERAGE \
    false \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY 2>&1)

echo -e "${GREEN}✓ Pool created${NC}"

# Update frontend environment
echo -e "\n${YELLOW}[5/6] Updating frontend configuration...${NC}"

ENV_FILE="$FRONTEND_DIR/.env.local"

cat > $ENV_FILE << EOF
# Scroll Sepolia Deployment
# Generated on $(date)

# Smart Contract Addresses
VITE_POOL_REGISTRY_ADDRESS=$POOL_REGISTRY
VITE_LENDING_FACTORY_ADDRESS=$LENDING_FACTORY
VITE_IDENTITY_VERIFIER_ADDRESS=$IDENTITY_VERIFIER
VITE_MOCK_USDC_ADDRESS=$MOCK_USDC
VITE_MOCK_USX_ADDRESS=$MOCK_USX

# Network Configuration
VITE_RPC_URL=$RPC_URL
VITE_CHAIN_ID=$SCROLL_SEPOLIA_CHAIN_ID
VITE_NETWORK_NAME=Scroll Sepolia

# Deployment Info
VITE_DEPLOYER=$DEPLOYER
VITE_DEPLOYMENT_DATE=$(date)
EOF

echo -e "${GREEN}✓ Frontend .env.local updated${NC}"

# Generate deployment summary
echo -e "\n${YELLOW}[6/6] Generating deployment summary...${NC}"

SUMMARY_FILE="./deployment-scroll-sepolia.json"

cat > $SUMMARY_FILE << EOF
{
  "network": "Scroll Sepolia",
  "chainId": $SCROLL_SEPOLIA_CHAIN_ID,
  "rpcUrl": "$RPC_URL",
  "deployer": "$DEPLOYER",
  "deploymentDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "contracts": {
    "poolRegistry": "$POOL_REGISTRY",
    "lendingFactory": "$LENDING_FACTORY",
    "identityVerifier": "$IDENTITY_VERIFIER",
    "mockUSDC": "$MOCK_USDC",
    "mockUSX": "$MOCK_USX"
  },
  "explorerUrl": "https://sepolia-blockscout.scroll.io/",
  "blockscoutLinks": {
    "poolRegistry": "https://sepolia-blockscout.scroll.io/address/$POOL_REGISTRY",
    "lendingFactory": "https://sepolia-blockscout.scroll.io/address/$LENDING_FACTORY",
    "identityVerifier": "https://sepolia-blockscout.scroll.io/address/$IDENTITY_VERIFIER",
    "mockUSDC": "https://sepolia-blockscout.scroll.io/address/$MOCK_USDC",
    "mockUSX": "https://sepolia-blockscout.scroll.io/address/$MOCK_USX"
  }
}
EOF

echo -e "${GREEN}✓ Deployment summary saved${NC}"

# Final summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Scroll Sepolia Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"

cat << EOF

${BLUE}Contract Addresses:${NC}
  PoolRegistry: $POOL_REGISTRY
  LendingFactory: $LENDING_FACTORY
  IdentityVerifier: $IDENTITY_VERIFIER
  MockUSDC: $MOCK_USDC
  MockUSX: $MOCK_USX

${BLUE}Network Info:${NC}
  Network: Scroll Sepolia
  Chain ID: $SCROLL_SEPOLIA_CHAIN_ID
  RPC URL: $RPC_URL
  Deployer: $DEPLOYER
  Explorer: https://sepolia-blockscout.scroll.io/

${BLUE}Frontend Configuration:${NC}
  Updated: $ENV_FILE
  Summary: $SUMMARY_FILE

${BLUE}Next Steps:${NC}
1. Verify contracts on Blockscout:
   https://sepolia-blockscout.scroll.io/

2. Set up your frontend wallet connection:
   - Add Scroll Sepolia to MetaMask
   - RPC: $RPC_URL
   - Chain ID: $SCROLL_SEPOLIA_CHAIN_ID
   - Symbol: ETH
   - Block Explorer: https://sepolia-blockscout.scroll.io/

3. Build and deploy frontend:
   cd $FRONTEND_DIR
   pnpm build

4. Deploy frontend to hosting service

5. Update pool URLs in frontend for production

${YELLOW}⚠️  Important:${NC}
- Save the $SUMMARY_FILE file for reference
- These addresses are deployed to Scroll Sepolia testnet
- This is NOT production ready yet
- Test thoroughly before mainnet deployment

${YELLOW}ℹ️  Get Scroll Sepolia ETH:${NC}
   https://faucet.scroll.io/

${YELLOW}ℹ️  To create more pools:${NC}
   cast send $LENDING_FACTORY \\
     "createPool(string,address,uint256,uint16,bool)" \\
     "Pool Name" "0x0000000000000000000000000000000000000000" 8 2000 false \\
     --rpc-url $RPC_URL \\
     --private-key $PRIVATE_KEY

EOF
