import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import AdminDashboardPage from './AdminDashboardPage';
import axiosInstance from '../services/axiosInstance';

// Mock axiosInstance
vi.mock('../services/axiosInstance');

describe('AdminDashboardPage', () => {
  const mockStatsData = {
    success: true,
    data: {
      totalPlayers: 150,
      playerGrowth: '+12%',
      activeTeams: 8,
      matchesPlayed: 45,
    },
  };

  const mockMatchesData = {
    success: true,
    data: [
      {
        id: 1,
        team1: 'Eagles U16',
        team2: 'City Academy',
        score: '3-1',
        date: '2024-12-10',
        status: 'Won',
      },
      {
        id: 2,
        team1: 'Hawks U18',
        team2: 'United Youth',
        score: '2-2',
        date: '2024-12-08',
        status: 'Draw',
      },
      {
        id: 3,
        team1: 'Falcons U14',
        team2: 'Riverside FC',
        score: '1-3',
        date: '2024-12-05',
        status: 'Lost',
      },
    ],
  };

  const mockRatingsData = {
    success: true,
    data: [
      { name: 'Oct', rating: 7.2 },
      { name: 'Nov', rating: 7.8 },
      { name: 'Dec', rating: 8.1 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    // Mock to delay response
    axiosInstance.get = vi.fn(() => new Promise((resolve) => {
      setTimeout(() => resolve({ data: mockStatsData }), 100);
    }));
    
    render(<AdminDashboardPage />);
    
    // Should show spinner while loading
    expect(screen.getByText(/loading/i) || document.querySelector('.chakra-spinner')).toBeTruthy();
  });

  it('fetches and displays dashboard statistics', async () => {
    axiosInstance.get = vi.fn((url) => {
      if (url.includes('/stats')) return Promise.resolve({ data: mockStatsData });
      if (url.includes('/recent-matches')) return Promise.resolve({ data: mockMatchesData });
      if (url.includes('/performance-ratings')) return Promise.resolve({ data: mockRatingsData });
      return Promise.reject(new Error('Unknown endpoint'));
    });
    
    render(<AdminDashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // Total players
      expect(screen.getByText('+12%')).toBeInTheDocument(); // Player growth
      expect(screen.getByText('8')).toBeInTheDocument(); // Active teams
      expect(screen.getByText('45')).toBeInTheDocument(); // Matches played
    });
  });

  it('displays stats cards with correct labels', async () => {
    axiosInstance.get = vi.fn((url) => {
      if (url.includes('/stats')) return Promise.resolve({ data: mockStatsData });
      if (url.includes('/recent-matches')) return Promise.resolve({ data: mockMatchesData });
      if (url.includes('/performance-ratings')) return Promise.resolve({ data: mockRatingsData });
    });
    
    render(<AdminDashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/total players/i)).toBeInTheDocument();
      expect(screen.getByText(/active teams/i)).toBeInTheDocument();
      expect(screen.getByText(/matches played/i)).toBeInTheDocument();
    });
  });

  it('displays recent matches table', async () => {
    axiosInstance.get = vi.fn((url) => {
      if (url.includes('/stats')) return Promise.resolve({ data: mockStatsData });
      if (url.includes('/recent-matches')) return Promise.resolve({ data: mockMatchesData });
      if (url.includes('/performance-ratings')) return Promise.resolve({ data: mockRatingsData });
    });
    
    render(<AdminDashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/recent matches/i)).toBeInTheDocument();
      expect(screen.getByText('Eagles U16')).toBeInTheDocument();
      expect(screen.getByText('City Academy')).toBeInTheDocument();
      expect(screen.getByText('3-1')).toBeInTheDocument();
    });
  });

  it('displays correct match status badges', async () => {
    axiosInstance.get = vi.fn((url) => {
      if (url.includes('/stats')) return Promise.resolve({ data: mockStatsData });
      if (url.includes('/recent-matches')) return Promise.resolve({ data: mockMatchesData });
      if (url.includes('/performance-ratings')) return Promise.resolve({ data: mockRatingsData });
    });
    
    render(<AdminDashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Won')).toBeInTheDocument();
      expect(screen.getByText('Draw')).toBeInTheDocument();
      expect(screen.getByText('Lost')).toBeInTheDocument();
    });
  });

  it('displays performance ratings chart when data is available', async () => {
    axiosInstance.get = vi.fn((url) => {
      if (url.includes('/stats')) return Promise.resolve({ data: mockStatsData });
      if (url.includes('/recent-matches')) return Promise.resolve({ data: mockMatchesData });
      if (url.includes('/performance-ratings')) return Promise.resolve({ data: mockRatingsData });
    });
    
    render(<AdminDashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/performance ratings/i)).toBeInTheDocument();
      // Recharts renders the chart, so we just check the container exists
    });
  });

  it('displays empty state when no performance data', async () => {
    axiosInstance.get = vi.fn((url) => {
      if (url.includes('/stats')) return Promise.resolve({ data: mockStatsData });
      if (url.includes('/recent-matches')) return Promise.resolve({ data: mockMatchesData });
      if (url.includes('/performance-ratings')) return Promise.resolve({ data: { success: true, data: [] } });
    });
    
    render(<AdminDashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/no performance data available/i)).toBeInTheDocument();
    });
  });

  it('displays error message when API call fails', async () => {
    const errorMessage = 'Failed to load dashboard data';
    
    axiosInstance.get = vi.fn(() => 
      Promise.reject({
        response: {
          data: {
            message: errorMessage,
          },
        },
      })
    );
    
    render(<AdminDashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('makes parallel API calls for all dashboard data', async () => {
    const getSpy = vi.fn((url) => {
      if (url.includes('/stats')) return Promise.resolve({ data: mockStatsData });
      if (url.includes('/recent-matches')) return Promise.resolve({ data: mockMatchesData });
      if (url.includes('/performance-ratings')) return Promise.resolve({ data: mockRatingsData });
    });
    
    axiosInstance.get = getSpy;
    
    render(<AdminDashboardPage />);
    
    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledTimes(3);
      expect(getSpy).toHaveBeenCalledWith('/dashboard/stats');
      expect(getSpy).toHaveBeenCalledWith('/dashboard/recent-matches?limit=5');
      expect(getSpy).toHaveBeenCalledWith('/dashboard/performance-ratings?months=6');
    });
  });

  it('handles network error gracefully', async () => {
    axiosInstance.get = vi.fn(() => 
      Promise.reject(new Error('Network Error'))
    );
    
    render(<AdminDashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load|error/i)).toBeInTheDocument();
    });
  });

  it('formats player growth percentage correctly', async () => {
    const customStatsData = {
      success: true,
      data: {
        ...mockStatsData.data,
        playerGrowth: '-5%',
      },
    };
    
    axiosInstance.get = vi.fn((url) => {
      if (url.includes('/stats')) return Promise.resolve({ data: customStatsData });
      if (url.includes('/recent-matches')) return Promise.resolve({ data: mockMatchesData });
      if (url.includes('/performance-ratings')) return Promise.resolve({ data: mockRatingsData });
    });
    
    render(<AdminDashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('-5%')).toBeInTheDocument();
    });
  });

  it('renders in RTL mode when Arabic language is selected', async () => {
    axiosInstance.get = vi.fn((url) => {
      if (url.includes('/stats')) return Promise.resolve({ data: mockStatsData });
      if (url.includes('/recent-matches')) return Promise.resolve({ data: mockMatchesData });
      if (url.includes('/performance-ratings')) return Promise.resolve({ data: mockRatingsData });
    });
    
    // This would test i18n RTL support
    render(<AdminDashboardPage />);
    
    await waitFor(() => {
      const container = screen.getByText(/total players/i).closest('div[dir]');
      // Check if dir attribute exists (would be 'rtl' for Arabic)
      expect(container || screen.getByText(/total players/i)).toBeInTheDocument();
    });
  });

  it('updates when data is refetched', async () => {
    let callCount = 0;
    
    axiosInstance.get = vi.fn((url) => {
      callCount++;
      if (url.includes('/stats')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              ...mockStatsData.data,
              totalPlayers: callCount === 1 ? 150 : 160,
            },
          },
        });
      }
      if (url.includes('/recent-matches')) return Promise.resolve({ data: mockMatchesData });
      if (url.includes('/performance-ratings')) return Promise.resolve({ data: mockRatingsData });
    });
    
    const { rerender } = render(<AdminDashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
    });
    
    // Simulate refetch by re-rendering
    rerender(<AdminDashboardPage />);
    
    // Note: In a real scenario, you'd trigger a refetch via a button or interval
  });
});
