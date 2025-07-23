import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

test('renders flag after loading', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [
            mockFlag
        ],
    });

    await act(async () => {
        render(<FlagPractice />);
    });

    await waitFor(() =>
        expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('us'))
    );
});

test('shows loading while waiting for fetch', async () => {
    let resolve: any;
    const promise = new Promise(res => (resolve = res));

    (fetch as jest.Mock).mockReturnValueOnce(promise);

    render(<FlagPractice />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await act(async () => {
        resolve({
            ok: true,
            json: async () => mockAllFlags,
        });
    });

    await waitFor(() =>
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );
});

test('renders correct flag after loading', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAllFlags,
    });

    await act(async () => {
        render(<FlagPractice />);
    });

    const codes = mockAllFlags.map(flag => flag.code);
    await waitFor(() => {
        const src = screen.getByRole('img').getAttribute('src') || '';
        const matched = codes.some(code => src.includes(code));
        if (!matched) {
            throw new Error(`Expected img src to include one of: [${codes.join(', ')}], but got: ${src}`);
        }
        expect(codes.some(code => src.includes(code))).toBe(true);
    });
});