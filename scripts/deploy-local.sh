#!/bin/bash

# Semilla Local Deployment Script
# This script deploys contracts to a local Anvil instance and creates test pools

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
RPC_URL="${RPC_URL:-http://localhost:8545}"
PRIVATE_KEY="${PRIVATE_KEY}"
CHAIN_ID=31337

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Semilla Local Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if Anvil is running
echo -e "\n${YELLOW}[1/5] Checking Anvil connection...${NC}"
if ! cast chain-id --rpc-url $RPC_URL &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to Anvil at $RPC_URL${NC}"
    echo -e "${YELLOW}Start Anvil with: anvil${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Connected to Anvil${NC}"

# Validate private key
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ PRIVATE_KEY environment variable not set${NC}"
    echo -e "${YELLOW}Export a private key: export PRIVATE_KEY=0x...${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Private key set${NC}"

# Get deployer address
DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY)
BALANCE=$(cast balance $DEPLOYER --rpc-url $RPC_URL)
echo -e "${BLUE}Deployer: $DEPLOYER${NC}"
echo -e "${BLUE}Balance: $BALANCE wei${NC}"

# Navigate to contracts directory
cd $CONTRACTS_DIR

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << EOF
PRIVATE_KEY=$PRIVATE_KEY
RPC_URL=$RPC_URL
EOF
    echo -e "${GREEN}✓ .env created${NC}"
fi

# Deploy contracts
echo -e "\n${YELLOW}[2/5] Deploying smart contracts...${NC}"
DEPLOY_OUTPUT=$(forge script script/Deploy.s.sol:Deploy \
    --rpc-url $RPC_URL \
    --broadcast \
    --private-key $PRIVATE_KEY 2>&1)

# Extract addresses from deployment output
POOL_REGISTRY=$(echo "$DEPLOY_OUTPUT" | grep "PoolRegistry deployed at:" | tail -1 | grep -oE '0x[a-fA-F0-9]{40}')
LENDING_FACTORY=$(echo "$DEPLOY_OUTPUT" | grep "LendingFactory deployed at:" | tail -1 | grep -oE '0x[a-fA-F0-9]{40}')
IDENTITY_VERIFIER=$(echo "$DEPLOY_OUTPUT" | grep "IdentityVerifier deployed at:" | tail -1 | grep -oE '0x[a-fA-F0-9]{40}')

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

# Whitelist ETH as supported asset
echo -e "\n${YELLOW}[3/5] Whitelisting ETH as supported asset...${NC}"
ASSET_ADDRESS="0x0000000000000000000000000000000000000000"
TX=$(cast send $LENDING_FACTORY "whitelistAsset(address)" $ASSET_ADDRESS \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY 2>&1 | grep -E "transactionHash|0x[a-fA-F0-9]{64}")
echo -e "${GREEN}✓ Asset whitelisted${NC}"

# Create test pool
echo -e "\n${YELLOW}[4/5] Creating test lending pool...${NC}"
POOL_NAME="Semilla Test Pool"
APR=8
RIF_COVERAGE=2000

POOL_TX=$(cast send $LENDING_FACTORY \
    "createPool(string,address,uint256,uint16)" \
    "$POOL_NAME" \
    $ASSET_ADDRESS \
    $APR \
    $RIF_COVERAGE \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY 2>&1)

echo -e "${GREEN}✓ Pool created:${NC}"
echo -e "  ${BLUE}Name: $POOL_NAME${NC}"
echo -e "  ${BLUE}APR: $APR%${NC}"
echo -e "  ${BLUE}RIF Coverage: $((RIF_COVERAGE / 100))%${NC}"

# Get created pool address
CREATED_POOLS=$(cast call $LENDING_FACTORY "getAllPools()" --rpc-url $RPC_URL)
echo -e "  ${BLUE}Pools: $CREATED_POOLS${NC}"

# Update frontend environment variables
echo -e "\n${YELLOW}[5/5] Updating frontend environment variables...${NC}"

ENV_FILE="$FRONTEND_DIR/.env.local"

# Create or update .env.local
cat > $ENV_FILE << EOF
# Smart Contract Addresses
VITE_POOL_REGISTRY_ADDRESS=$POOL_REGISTRY
VITE_LENDING_FACTORY_ADDRESS=$LENDING_FACTORY
VITE_IDENTITY_VERIFIER_ADDRESS=$IDENTITY_VERIFIER

# Network Configuration
VITE_RPC_URL=$RPC_URL
VITE_CHAIN_ID=$CHAIN_ID
EOF

echo -e "${GREEN}✓ Frontend .env.local updated${NC}"

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"

cat << EOF

${BLUE}Contract Addresses:${NC}
  PoolRegistry: $POOL_REGISTRY
  LendingFactory: $LENDING_FACTORY
  IdentityVerifier: $IDENTITY_VERIFIER
  MockUSDC: $MOCK_USDC
  MockUSX: $MOCK_USX

${BLUE}Network Info:${NC}
  RPC URL: $RPC_URL
  Chain ID: $CHAIN_ID
  Deployer: $DEPLOYER

${BLUE}Next Steps:${NC}
1. Start the frontend:
   cd $FRONTEND_DIR
   pnpm dev

2. Connect to MetaMask:
   - Add Localhost network (RPC: $RPC_URL, Chain ID: $CHAIN_ID)
   - Import a test account from Anvil

3. Visit http://localhost:5173 and test the application

${YELLOW}ℹ️  To create more pools, use:${NC}
   cast send $LENDING_FACTORY \\
     "createPool(string,address,uint256,uint16)" \\
     "Pool Name" "0x0000000000000000000000000000000000000000" 8 2000 \\
     --rpc-url $RPC_URL \\
     --private-key $PRIVATE_KEY

EOF
