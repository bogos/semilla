# 🚀 Deployment Guide

Guía completa para desplegar Semilla en desarrollo (Anvil) o producción (Scroll Sepolia).

## 📋 Tabla de Contenidos

1. [Local Deployment (Anvil)](#local-deployment-anvil) - Para desarrollo
2. [Scroll Sepolia Deployment](#scroll-sepolia-deployment) - Para testnet
3. [Troubleshooting](#troubleshooting)

---

## Local Deployment (Anvil)

### Prerequisites
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Node.js 18+ y pnpm
npm install -g pnpm
```

### Step 1: Start Anvil (Terminal 1)
```bash
anvil
```

Guarda el output con las private keys.

### Step 2: Deploy Contracts (Terminal 2)
```bash
cd /home/bogo/semilla
export PRIVATE_KEY=0x...  # Primera key de Anvil
./scripts/deploy-local.sh
```

**El script:**
- ✅ Verifica conexión a Anvil
- ✅ Deploya PoolRegistry, LendingFactory, IdentityVerifier
- ✅ Deploya MockUSDC y MockUSX
- ✅ Whitelist de activos
- ✅ Crea 2 pools de prueba
- ✅ Genera `frontend/.env.local`

### Step 3: Start Frontend (Terminal 3)
```bash
cd /home/bogo/semilla/frontend
pnpm install  # Primera vez
pnpm dev
```

Accede a: http://localhost:5173

### Step 4: Setup MetaMask
1. Add Localhost network:
   - RPC: `http://localhost:8545`
   - Chain ID: `31337`
   - Symbol: `ETH`

2. Import account from Anvil private key
3. Connect in the app

### ✅ Test Flow
1. Browse `/pools` → Deberías ver 2 pools
2. Deposit → 1 ETH
3. Request Loan → 0.5 ETH por 30 días
4. Repay loan → Confirmando en MetaMask
5. Withdraw interest → Retira ganancias

---

## Scroll Sepolia Deployment

### Prerequisites
```bash
# RPC endpoint
https://sepolia-rpc.scroll.io/

# Get testnet ETH
https://faucet.scroll.io/
```

### Step 1: Get Testnet ETH
1. Ve a https://faucet.scroll.io/
2. Conecta tu wallet
3. Recibe ~0.5 ETH

### Step 2: Export Private Key
```bash
export PRIVATE_KEY=0x...  # Tu private key de desarrollo
```

⚠️ **IMPORTANTE**: Usa cuenta de desarrollo, nunca de producción.

### Step 3: Deploy to Scroll Sepolia
```bash
cd /home/bogo/semilla
./scripts/deploy-scroll-sepolia.sh
```

**El script:**
- ✅ Valida private key y balance
- ✅ Deploya a Scroll Sepolia
- ✅ Crea pool de prueba
- ✅ Genera `deployment-scroll-sepolia.json`
- ✅ Actualiza `frontend/.env.local`

**Tiempo:** 2-3 minutos

### Step 4: Verify on Blockscout
1. Ve a: https://sepolia-blockscout.scroll.io/
2. Busca las direcciones de contratos
3. Verifica que están desplegados

### Step 5: Setup Frontend
```bash
cd /home/bogo/semilla/frontend
pnpm build  # Para producción
# O
pnpm dev    # Para desarrollo
```

### Step 6: Add Scroll Sepolia to MetaMask
1. Add Network:
   - Network: `Scroll Sepolia`
   - RPC: `https://sepolia-rpc.scroll.io/`
   - Chain ID: `534351`
   - Symbol: `ETH`
   - Explorer: `https://sepolia-blockscout.scroll.io/`

2. Switch to Scroll Sepolia network
3. Connect in the app

---

## Deployment Comparison

| Feature | Local (Anvil) | Scroll Sepolia |
|---------|---------------|----------------|
| **Speed** | Instant | 2-3 min |
| **Cost** | Free (mock) | Free (testnet) |
| **Reset** | Restart anvil | Only production |
| **Use Case** | Development | Testing & Demo |
| **Chain ID** | 31337 | 534351 |
| **Explorer** | - | Blockscout |

---

## Network Details

### Local (Anvil)
- Chain ID: 31337
- RPC: http://localhost:8545
- Block time: ~2 seconds
- Gas price: 1 gwei (configurable)

### Scroll Sepolia
- Chain ID: 534351
- RPC: https://sepolia-rpc.scroll.io/
- Explorer: https://sepolia-blockscout.scroll.io/
- Faucet: https://faucet.scroll.io/
- Block time: ~10-15 seconds

---

## Manual Deployment (Advanced)

Si prefieres más control, puedes ejecutar Foundry directamente:

### Local
```bash
cd contracts
forge script script/Deploy.s.sol:Deploy \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0x...
```

### Scroll Sepolia
```bash
cd contracts
forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://sepolia-rpc.scroll.io/ \
  --broadcast \
  --private-key 0x...
```
