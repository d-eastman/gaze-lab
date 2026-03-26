import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SignalIndicator } from '@/components/SignalIndicator'

describe('SignalIndicator', () => {
  it('renders label and value', () => {
    render(<SignalIndicator label="Test" value={0.75} />)
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('0.75')).toBeInTheDocument()
  })

  it('renders with custom max', () => {
    render(<SignalIndicator label="Custom" value={50} max={100} />)
    expect(screen.getByText('50.00')).toBeInTheDocument()
  })
})
