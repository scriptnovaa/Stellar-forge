import { useState, useEffect } from 'react'
import { walletService } from '../services/wallet'

interface WalletState {
  address: string | null
  isConnected: boolean
  balance?: string
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    balance: undefined,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = async (address: string) => {
    try {
      const balance = await walletService.getBalance(address)
      setWallet(prev => ({ ...prev, balance }))
    } catch (err) {
      console.error('Failed to fetch balance:', err)
    }
  }

  const connect = async () => {
    setIsConnecting(true)
    setError(null)
    try {
      if (!walletService.isInstalled()) {
        throw new Error(
          'Freighter wallet is not installed. Please install it from https://www.freighter.app/'
        )
      }

      const address = await walletService.connect()
      setWallet({ address, isConnected: true, balance: undefined })

      // Fetch balance after connecting
      await fetchBalance(address)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
      setWallet({ address: null, isConnected: false, balance: undefined })
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    walletService.disconnect()
    setWallet({ address: null, isConnected: false, balance: undefined })
    setError(null)
  }

  useEffect(() => {
    // Check if already connected on mount
    const checkConnection = async () => {
      if (walletService.isInstalled()) {
        try {
          const address = await walletService.checkExistingConnection()
          if (address) {
            setWallet({ address, isConnected: true })
            await fetchBalance(address)
          }
        } catch (err) {
          console.error('Failed to check existing connection:', err)
        }
      }
    }

    checkConnection()
  }, [])

  return {
    wallet,
    connect,
    disconnect,
    isConnecting,
    error,
    isInstalled: walletService.isInstalled(),
  }
}
