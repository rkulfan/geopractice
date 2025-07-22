import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

beforeAll(() => {
  global.fetch = jest.fn(() => Promise.resolve(new Response()));
});

afterAll(() => {
  (global.fetch as jest.Mock).mockRestore();
});