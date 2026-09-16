import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchPortfolio, request, readCache, writeCache } from './github';
afterEach(() => vi.unstubAllGlobals());
describe('GitHub service', () => {
  it('loads every repository page', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ login: 'test' })))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify(Array.from({ length: 100 }, (_, id) => ({ id }))),
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 101 }])));
    vi.stubGlobal('fetch', fetch);
    expect((await fetchPortfolio('test')).repos).toHaveLength(101);
    expect(fetch.mock.calls[2][0]).toContain('page=2');
  });
  it('explains missing users', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('', { status: 404 })),
    );
    await expect(request('/users/missing')).rejects.toThrow(
      'could not be found',
    );
  });
  it('reports rate limits and reset time', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('', {
          status: 403,
          headers: {
            'x-ratelimit-remaining': '0',
            'x-ratelimit-reset': '1800000000',
          },
        }),
      ),
    );
    await expect(request('/users/test')).rejects.toThrow('Try again after');
  });
  it('handles 429 without reset headers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('', { status: 429 })),
    );
    await expect(request('/users/test')).rejects.toThrow('request limit');
  });
  it('reports other HTTP failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('', { status: 503 })),
    );
    await expect(request('/users/test')).rejects.toThrow('HTTP 503');
  });
  it('keeps expired cache available for offline fallback and isolates usernames', () => {
    const entries = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => entries.get(key),
      setItem: (key: string, value: string) => entries.set(key, value),
    });
    const data = {
      profile: {
        login: 'test',
        name: null,
        bio: null,
        avatar_url: '',
        html_url: '',
        public_repos: 0,
        followers: 0,
        following: 0,
      },
      repos: [],
    };
    writeCache('test', data, -1);
    expect(readCache('test')?.data).toEqual(data);
    expect(readCache('test')!.expires).toBeLessThan(Date.now());
    expect(readCache('other')).toBeNull();
  });
  it('ignores broken or inaccessible cache', () => {
    vi.stubGlobal('localStorage', { getItem: () => '{broken' });
    expect(readCache('test')).toBeNull();
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw Error('blocked');
      },
    });
    expect(readCache('test')).toBeNull();
  });
});
