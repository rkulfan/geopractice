import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Transliteration from '../Transliteration';

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

const mockPlayer = {
  native: 'Игрок',
  latin: 'Igrok',
};

describe('Transliteration Component', () => {
  test('renders player name after fetch', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayer,
    });

    render(<Transliteration />);
    expect(await screen.findByText(/Игрок/)).toBeInTheDocument();
  });

  test('handles user input and submits correct transliteration', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPlayer,
    });

    render(<Transliteration />);
    await screen.findByText(/Игрок/);

    fireEvent.change(screen.getByPlaceholderText(/transliteration/i), {
      target: { value: 'Igrok' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() =>
      expect(screen.getByText(/was correct/i)).toBeInTheDocument()
    );
  });

  test('handles incorrect transliteration', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPlayer,
    });

    render(<Transliteration />);
    await screen.findByText(/Игрок/);

    fireEvent.change(screen.getByPlaceholderText(/transliteration/i), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() =>
      expect(screen.getByText(/is incorrect/i)).toBeInTheDocument()
    );
  });

  test('handles give up button', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPlayer,
    });

    render(<Transliteration />);
    await screen.findByText(/Игрок/);

    fireEvent.click(screen.getByRole('button', { name: /give up/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/the correct answer was/i)
      ).toBeInTheDocument()
    );
  });

  test('displays error message on fetch failure', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

    render(<Transliteration />);
    await waitFor(() =>
      expect(screen.getByText(/error: fetch failed/i)).toBeInTheDocument()
    );
  });
})