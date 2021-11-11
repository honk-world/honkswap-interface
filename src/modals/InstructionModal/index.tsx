import React from 'react'
import Modal from '../../components/Modal'

interface Props {
  isOpen: boolean
  onDismiss: () => void
  instruction: React.ReactNode
}

export default function InstructionModal(props: Props) {
  const { instruction, isOpen, onDismiss } = props

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      {instruction}
    </Modal>
  )
}
