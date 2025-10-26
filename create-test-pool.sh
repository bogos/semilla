#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Creating Test Pool ===${NC}"

cd contracts

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found in contracts directory${NC}"
    echo "Please create .env with PRIVATE_KEY"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}Error: PRIVATE_KEY not set in .env${NC}"
    exit 1
fi

# Check if VITE_LENDING_FACTORY_ADDRESS is set
if [ -z "$VITE_LENDING_FACTORY_ADDRESS" ]; then
    echo -e "${RED}Error: VITE_LENDING_FACTORY_ADDRESS not set in .env${NC}"
    echo "First deploy the contracts using: forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast"
    exit 1
fi

# Run the forge script
echo -e "${YELLOW}Running CreateTestPool script...${NC}"
forge script script/CreateTestPool.s.sol --rpc-url http://localhost:8545 --broadcast

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Pool created successfully!${NC}"
    echo -e "${YELLOW}Check the output above for the pool address${NC}"
else
    echo -e "${RED}✗ Failed to create pool${NC}"
    exit 1
fi
