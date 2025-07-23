import { render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import FlagPractice from '../FlagPractice';

// Mock config value
jest.mock('../config', () => ({
  API_BASE_URL: 'http://mock.api',
}));

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

const mockFlag = {
  code: 'us',
  name: ['United States']
};

const mockAllFlags = [
  { code: 'us', name: ['United States'] },
  { code: 'fr', name: ['France'] },
  { code: 'de', name: ['Germany'] },
  { code: 'jp', name: ['Japan'] }
];

test('renders loading state initially', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => [],
  });

  await act(async () => {
    render(<FlagPractice />);
  });

  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
