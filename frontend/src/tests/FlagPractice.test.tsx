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

describe('FlagPractice Component', () => {
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
            json: async () => [mockFlag],
        });

        render(<FlagPractice />);

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

    test('renders an appropriate flag after loading', async () => {
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

    test('displays flag and input when in typed mode', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [mockFlag],
        });

        render(<FlagPractice />);

        await waitFor(() =>
            expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('us'))
        );

        expect(screen.getByPlaceholderText(/answer/i)).toBeInTheDocument();
    });

    test('accepts correct typed guess', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [mockFlag],
        });

        render(<FlagPractice />);

        await waitFor(() => screen.getByPlaceholderText(/answer/i));

        fireEvent.change(screen.getByPlaceholderText(/answer/i), {
            target: { value: 'United States' }
        });
        fireEvent.click(screen.getByText(/submit/i));

        await waitFor(() =>
            expect(screen.getByText(/was correct/i)).toBeInTheDocument()
        );
    });

    test('shows incorrect feedback when guess is wrong', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [mockFlag],
        });

        render(<FlagPractice />);

        await waitFor(() => screen.getByPlaceholderText(/answer/i));

        fireEvent.change(screen.getByPlaceholderText(/answer/i), {
            target: { value: 'Canada' },
        });
        fireEvent.click(screen.getByText(/submit/i));

        await waitFor(() =>
            expect(screen.getByText(/the correct answer was/i)).toBeInTheDocument()
        );
    });

    test('advances to next flag after correct guess', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockAllFlags,
        });

        render(<FlagPractice />);

        await waitFor(() => screen.getByRole('img'));

        fireEvent.change(screen.getByPlaceholderText(/answer/i), {
            target: { value: mockAllFlags[0].name[0] },
        });
        fireEvent.click(screen.getByText(/submit/i));

        await waitFor(() => {
            const src = screen.getByRole('img').getAttribute('src') || '';
            expect(src.includes(mockAllFlags[1].code)).toBe(true);
        });
    });

    test('changes flag when category is changed', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockAllFlags,
        });

        render(<FlagPractice />);

        fireEvent.change(screen.getByRole('combobox', { name: /select category/i }), {
            target: { value: 'territories' },
        });

        await waitFor(() =>
            expect(screen.getByRole('img')).toBeInTheDocument()
        );
    });

    test('skips to the next flag when give up button is clicked', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockAllFlags,
        });

        render(<FlagPractice />);
        await waitFor(() => screen.getByRole('img'));

        const prevSrc = screen.getByRole('img').getAttribute('src') || '';

        fireEvent.click(screen.getByText(/give up/i));

        await waitFor(() => {
            expect(screen.getByText(/the correct answer was/i)).toBeInTheDocument()
            const newSrc = screen.getByRole('img').getAttribute('src') || '';
            expect(newSrc).not.toEqual(prevSrc);
        });
    });

    test('handles fetch failure gracefully', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        render(<FlagPractice />);

        await waitFor(() =>
            expect(screen.getByText(/network response was not ok/i)).toBeInTheDocument()
        );
    });
})