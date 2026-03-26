import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExperimentShell } from '@/components/ExperimentShell'

describe('ExperimentShell', () => {
  it('renders title and description', () => {
    render(
      <ExperimentShell title="Test Experiment" description="A test description">
        <div data-testid="child">Content</div>
      </ExperimentShell>
    )

    expect(screen.getByText('Test Experiment')).toBeInTheDocument()
    expect(screen.getByText('A test description')).toBeInTheDocument()
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
