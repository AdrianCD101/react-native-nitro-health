import React from 'react'
import { render, screen } from '@testing-library/react-native'

const mockNitroHealth = {
  isAvailable: jest.fn(),
}

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => mockNitroHealth),
  },
}))

const App = require('../App').default

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows Available when health APIs are available', () => {
    mockNitroHealth.isAvailable.mockReturnValue(true)

    render(<App />)

    expect(screen.getByText('Available')).toBeTruthy()
  })

  it('shows Unavailable when health APIs are unavailable', () => {
    mockNitroHealth.isAvailable.mockReturnValue(false)

    render(<App />)

    expect(screen.getByText('Unavailable')).toBeTruthy()
  })
})
