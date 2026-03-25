import { useState } from 'react'
import { Input, Button, ConfirmModal } from './UI'
import { isValidIPFSUri } from '../utils/validation'
import { useToast } from '../context/ToastContext'

const ESTIMATED_FEE = '0.01' // XLM

interface Props {
  tokenAddress?: string
  onSubmit: (tokenAddress: string, metadataUri: string) => Promise<void>
}

export const SetMetadataForm: React.FC<Props> = ({ tokenAddress: initialAddress = '', onSubmit }) => {
  const [tokenAddress, setTokenAddress] = useState(initialAddress)
  const [metadataUri, setMetadataUri] = useState('')
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidIPFSUri(metadataUri)) {
      addToast(t('setMetadata.invalidUri'), 'error')
      return
    }
    setPending(true)
  }

  const handleConfirm = async () => {
    setPending(false)
    setLoading(true)
    try {
      await onSubmit(tokenAddress, metadataUri)
      addToast(t('setMetadata.success'), 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : t('setMetadata.success'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Token Address"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="G..."
          required
        />
        <Input
          label="Metadata URI"
          value={metadataUri}
          onChange={(e) => setMetadataUri(e.target.value)}
          placeholder="ipfs://Qm..."
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Set Metadata'}
        </Button>
      </form>

      <ConfirmModal
        isOpen={pending}
        title="Confirm Set Metadata"
        description="Review the metadata update before submitting on-chain."
        details={[
          { label: 'Token Address', value: tokenAddress },
          { label: 'Metadata URI', value: metadataUri },
          { label: 'Estimated Fee', value: `${ESTIMATED_FEE} XLM` },
        ]}
        onConfirm={handleConfirm}
        onCancel={() => setPending(false)}
        confirmLabel="Set Metadata"
      />
    </>
  )
}
