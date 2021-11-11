import * as React from 'react'

export default function useInstructionModal() {
  const [isInstructionModalOpen, setInstructionModalOpen] = React.useState(false)

  const onInstructionModalDismiss = React.useCallback(() => {
    setInstructionModalOpen(false)
  }, [])

  return { isInstructionModalOpen, setInstructionModalOpen, onInstructionModalDismiss }
}
