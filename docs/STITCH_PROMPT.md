# Semilla - UI Design Prompt para Stitch (MVP Web + Bentobox)

## Descripción General
Semilla es un protocolo de microcrédit descentralizado en Scroll blockchain. Permite crear lending pools comunitarios, depositar fondos, solicitar préstamos y acceder a los mismos verificando identidad con ZK Proofs sin documentos formales.

**Scope MVP**: Web desktop/tablet. Light mode only. Desktop-first responsive. Bentobox layouts para organización visual.

## Paleta de Colores
- **Primary Green**: #2D5016 (Confianza, crecimiento)
- **Accent Gold**: #D4AF37 (Valor, oportunidad)
- **Neutral Beige**: #E8DCC4 (Accesibilidad)
- **Text Dark**: #1A1A1A
- **Background Light**: #F5F5F5
- **Border Light**: #CCCCCC

## Vistas Requeridas

### 1. **Landing / Home**
- Header con logo Semilla + "Connect Wallet" button (top right)
- Hero section:
  - Título: "Semilla: Microcrédit Descentralizado"
  - Subtítulo: "Crea pools, deposita, solicita préstamos sin documentos formales"
  - CTA button: "Comenzar"

- **Bentobox Layout - 3 Feature Cards** (Main content area):
  ```
  ┌─────────────────────────────────────────────────────────┐
  │ 🏦 Prestamistas     │  💰 Prestatarios │  🎯 Creadores  │
  │ "Gana 8-12% APY"   │  "Acceso sin docs"│ "Crea tu pool" │
  └─────────────────────────────────────────────────────────┘
  ```
  - Each card: icon, title, description, "Learn more" link
  
- Footer con: Docs link, GitHub link, Contact

### 2. **Pool Discovery / Browse Pools**
- **Bentobox Layout - 2 columns**:
  ```
  ┌──────────────┬────────────────────────────────────┐
  │   Filtros    │         Grid de Pools              │
  │   (Sidebar)  │  ┌─────┐ ┌─────┐ ┌─────┐         │
  │              │  │Pool1│ │Pool2│ │Pool3│         │
  │              │  └─────┘ └─────┘ └─────┘         │
  │              │  ┌─────┐ ┌─────┐ ┌─────┐         │
  │              │  │Pool4│ │Pool5│ │Pool6│         │
  │              │  └─────┘ └─────┘ └─────┘         │
  └──────────────┴────────────────────────────────────┘
  ```
- Filtros sidebar (left, 20% width):
  - Asset: USDC / USX / ETH (checkboxes)
  - APR range: Slider 1-20%
  - Min Liquidity: Slider
  - Sort by: Dropdown
  
- Grid de pools (80% width):
  - Cards bento responsive (3 columns desktop, 2 tablet)
  - Each card: Name | Asset badge | APR | Liquidity | Action button

- "Create Pool" button (top right)

### 3. **Pool Details**
- Header:
  - Pool name (large) | Asset badge | Status badge | APR (big)
  
- **Bentobox Layout - Stats Grid** (2x2):
  ```
  ┌──────────────┬──────────────┐
  │Total Liquidity│Total Borrowed│
  ├──────────────┼──────────────┤
  │Available Liq │ RIF Fund Bal  │
  └──────────────┴──────────────┘
  ```
  
- Tabs:
  - **Overview**: Description, Pool Owner, Created date, RIF %
  - **Lenders**: Table of recent deposits
  - **Borrowers**: Active loans table
  
- Action buttons (sticky right):
  - "Deposit" button
  - "Borrow" button

### 4. **Connect Wallet**
- Modal:
  - Title: "Conectar Wallet"
  - Buttons con logos: MetaMask | Rabby | WalletConnect
  - Network info: "Scroll Sepolia Testnet"

### 5. **Deposit Form**
- Panel:
  - "Pool": [display]
  - "Asset": [display]
  - "Amount": Input + Max button
  - Info: "You'll receive X LP tokens"
  - Estimated APY box
  - Button: "Deposit"

### 6. **Withdraw Form**
- Panel similar a Deposit:
  - "Your Deposit": $XXXX
  - "Amount to Withdraw": Input + slider (0-100%)
  - Warning box (if needed)
  - Button: "Withdraw"

### 7. **Loan Application (Multi-step Bentobox)**

**Vertical Bentobox Layout** (stacked cards):
```
┌─────────────────────────────────┐
│ Step 1: Identity Verification   │
│ [Status] [ZK Button]            │
└─────────────────────────────────┘
          ↓
┌─────────────────────────────────┐
│ Step 2: Loan Details            │
│ [Pool] [Amount] [Duration]      │
│ [Purpose] [Summary Box]         │
└─────────────────────────────────┘
          ↓
┌─────────────────────────────────┐
│ Step 3: Review & Submit         │
│ [Read-only Summary]             │
│ [Submit Button]                 │
└─────────────────────────────────┘
```

**Step 1: Identity Verification**
- Card with:
  - Title: "Paso 1: Verificar Identidad"
  - Status badge: [⏳ Not verified] → [✅ Verified]
  - Button: "Generar ZK Proof"
  - Info text

**Step 2: Loan Details**
- Card with:
  - Title: "Paso 2: Detalles del Préstamo"
  - Pool selector
  - Amount input
  - Duration: Radio buttons
  - Purpose: Dropdown
  - Summary box: Interest + Total

**Step 3: Review & Submit**
- Card with:
  - Title: "Paso 3: Revisar y Enviar"
  - Summary (read-only)
  - Timeline message
  - Submit button

### 8. **My Loans (Borrower Dashboard)**
- Title: "Mis Préstamos"

- **Bentobox - Stats Section** (3 columns):
  ```
  ┌─────────────┬──────────────┬──────────────┐
  │ Total Borrow │ Total Paid   │ On-time Rate │
  │   $XXXX     │   $XXXX      │     95%      │
  └─────────────┴──────────────┴──────────────┘
  ```

- **Bentobox - Loans Grid** (1 column, full-width cards):
  ```
  ┌─────────────────────────────────────────┐
  │ Pool: [Name] | Due: $XXX | [Repay Btn]  │
  ├─────────────────────────────────────────┤
  │ Pool: [Name] | Due: $XXX | [Repay Btn]  │
  ├─────────────────────────────────────────┤
  │ Pool: [Name] | Due: $XXX | [Repay Btn]  │
  └─────────────────────────────────────────┘
  ```

### 9. **Repay Loan Form**
- Panel:
  - Loan selector
  - Amount Due display
  - Input field
  - Button: "Pay Full Amount"

### 10. **My Portfolio (Lender Dashboard)**
- Title: "Mi Portafolio"

- **Bentobox - Summary Cards** (2x2):
  ```
  ┌──────────────┬──────────────┐
  │Total Deposited│Total Interest │
  │   $XXXX      │   $XXXX       │
  ├──────────────┼──────────────┤
  │Estimated APY │  Active Pools │
  │   X.X%       │      X        │
  └──────────────┴──────────────┘
  ```

- **Bentobox - Portfolio Table** (1 column, full-width):
  ```
  ┌──────────────────────────────────────────────┐
  │ Pool1 | $1000 | +$80 | $1080 | 8% | [View]  │
  ├──────────────────────────────────────────────┤
  │ Pool2 | $500  | +$30 | $530  | 6% | [View]  │
  ├──────────────────────────────────────────────┤
  │ Pool3 | $250  | +$15 | $265  | 6% | [View]  │
  └──────────────────────────────────────────────┘
  ```

### 11. **Create Pool (Pool Owner)**

- **Bentobox Layout - 2 columns**:
  ```
  ┌────────────────────┬────────────────────┐
  │   Form (60%)       │   Preview (40%)    │
  │ [Name Input]       │ Pool Name:         │
  │ [Asset Dropdown]   │ Asset: USDC        │
  │ [APR Slider]       │ APR: 8%            │
  │ [RIF Slider]       │ RIF Coverage: 20%  │
  │ [Description]      │                    │
  │ [Create Button]    │                    │
  └────────────────────┴────────────────────┘
  ```

- Left panel (60%):
  - Pool Name: Input
  - Asset: Dropdown
  - APR: Slider (display %)
  - RIF Coverage: Slider (display %)
  - Description: Textarea

- Right panel (40%, sticky):
  - "Pool Preview" card
  - Shows all the entered values
  - Updates in real-time

- Button: "Crear Pool" (at bottom)

### 12. **Pool Management (Owner Only)**
- Section: "Mis Pools"

- **Bentobox - Pool Cards**:
  ```
  ┌─────────────────────────────────────┐
  │ Pool Name                           │
  │ ├─ Liquidity: $XXXX                │
  │ ├─ Borrowed: $XXXX                 │
  │ └─ Lenders/Borrowers: X / X        │
  │ [Edit] [Pause] [View Jury]         │
  └─────────────────────────────────────┘
  ```

### 13. **User Menu (Top Right)**
- If wallet connected:
  - Display: "0x1234...5678" (truncated)
  - Dropdown menu:
    - My Portfolio
    - My Loans
    - My Pools
    - Settings
    - Disconnect

### 14. **Notifications/Alerts**
- Toast notifications (top right):
  - Success: "✅ Transaction confirmed"
  - Error: "❌ Transaction failed"

### 15. **Settings Page**
- Language: English / Español
- Network: "Connected to Scroll Sepolia"
- Disconnect button

---

## Bentobox Layout Guidelines

- **Ratios commonly used**:
  - 2 columns: 60% / 40% (Form + Preview)
  - 2 columns: 20% / 80% (Sidebar + Content)
  - 2x2 grid: Equal (Stats)
  - 3 columns: Equal (Feature cards)

- **Responsive**:
  - Desktop (1200px+): Full bentobox
  - Tablet (1024px): 2 columns → stack to 1
  - Mobile (future): Single column (not for MVP)

- **Spacing**: 24px gutters between bento boxes
- **Cards**: 16px padding, 8px border-radius, light shadow

---

## Flujos Principales

### Flujo Lender
1. Home → "Comenzar"
2. Browse Pools (bento grid)
3. Click pool card → Pool Details (bento stats)
4. Click "Deposit"
5. My Portfolio (bento dashboard)

### Flujo Borrower
1. Home → "Comenzar"
2. Browse Pools
3. Click "Borrow"
4. Multi-step form (bento vertical)
5. My Loans (bento list)

### Flujo Pool Owner
1. Home → "Create Pool"
2. Form + Preview (bento 2-col)
3. My Pools (bento cards)

---

## Notas de Implementación

- **Framework**: Vite + React + TypeScript + Tailwind CSS (para bentobox fácil)
- **Grid system**: Tailwind `grid-cols-*` para bentobox
- **Responsive**: Use Tailwind breakpoints (md:, lg:, xl:)
- **Loading**: Skeleton loaders en lugar de content
- **Accessibility**: WCAG 2.1 AA compliance
- **MVP Simplifications**:
  - ZK Proof simulado (just toggle verified state)
  - Jury approval automático
  - No gráficos complejos

---

## Componentes Reutilizables
- BentoBox wrapper (grid container)
- Card / Panel
- Input field
- Button
- Badge
- Slider
- Dropdown
- Table row
- Toast notification
- Header / Navigation
- User menu dropdown

---

## Color Usage
- Primary: #2D5016 (buttons, headers)
- Accent: #D4AF37 (highlights, badges)
- Background: #E8DCC4 (card backgrounds)
- Text: #1A1A1A (body text)
- Light: #F5F5F5 (page background)
- Border: #CCCCCC
- Success: #28a745
- Error: #dc3545
- Warning: #ffc107
