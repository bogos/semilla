import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function ConnectWallet() {
  return (
    <ConnectButton
      label="Conectar Wallet"
      accountStatus="avatar"
      showBalance={false}
    />
  )
}
