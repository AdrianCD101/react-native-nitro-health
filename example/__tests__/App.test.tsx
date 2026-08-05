import { render, screen, waitFor } from '@testing-library/react-native'

jest.mock('react-native-nitro-health', () => ({
  NitroHealth: {
    getAvailability: jest.fn(() => ({ status: 'available' as const })),
    getCapabilities: jest.fn(() =>
      Promise.resolve({
        status: 'available' as const,
        backgroundChanges: {
          mode: 'polling' as const,
          scheduling: 'app-owned' as const,
          backgroundRead: 'not-granted' as const,
        },
        historyRead: 'not-granted' as const,
      })
    ),
  },
}))

import App from '../App'

describe('App', () => {
  it('renders availability and capability-driven polling guidance', async () => {
    render(<App />)

    expect(screen.getByText('Health service ready')).toBeTruthy()
    await waitFor(() => {
      expect(screen.getByText(/polling; history not-granted/i)).toBeTruthy()
    })
    expect(screen.getByText(/scheduling: app-owned/i)).toBeTruthy()
  })
})
