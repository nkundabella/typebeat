import axios from 'axios';

export interface ExternalTrack {
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number; // in seconds
  audioUrl: string; // 30-second preview URL
  coverArt: string; // 400x400 album cover art
}

export interface LyricData {
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

const LRCLIB_USER_AGENT = 'Typebeat/1.0.0 (https://github.com/izzy/typebeat)';

/**
 * Search for songs on iTunes Search API
 */
export async function searchiTunes(query: string): Promise<ExternalTrack[]> {
  try {
    const response = await axios.get('https://itunes.apple.com/search', {
      params: {
        term: query,
        media: 'music',
        limit: 10
      }
    });

    if (!response.data || !response.data.results) {
      return [];
    }

    return response.data.results.map((item: any) => {
      // Get higher resolution cover art (default is 100x100bb, we replace with 400x400bb)
      let coverArt = item.artworkUrl100 || '';
      if (coverArt.includes('100x100bb')) {
        coverArt = coverArt.replace('100x100bb', '400x400bb');
      }

      return {
        title: item.trackName || '',
        artist: item.artistName || '',
        album: item.collectionName || '',
        genre: item.primaryGenreName || 'Unknown',
        duration: Math.round((item.trackTimeMillis || 0) / 1000), // convert ms to seconds
        audioUrl: item.previewUrl || '',
        coverArt
      };
    }).filter((track: ExternalTrack) => track.audioUrl !== ''); // only return tracks with real audio previews
  } catch (error) {
    console.error('Error searching iTunes:', error);
    return [];
  }
}

/**
 * Fetch lyrics from LRCLib for a specific track
 */
export async function fetchLyricsFromLRCLib(
  artist: string,
  title: string,
  album: string,
  duration: number
): Promise<LyricData> {
  const headers = { 'User-Agent': LRCLIB_USER_AGENT };

  // Step 1: Try exact match via /api/get
  try {
    console.log(`LRCLib: Attempting exact lookup for "${title}" by "${artist}" (${duration}s)...`);
    const response = await axios.get('https://lrclib.net/api/get', {
      params: {
        artist_name: artist,
        track_name: title,
        album_name: album,
        duration: duration
      },
      headers
    });

    if (response.data) {
      console.log('LRCLib: Exact lyric match found!');
      return {
        plainLyrics: response.data.plainLyrics || null,
        syncedLyrics: response.data.syncedLyrics || null
      };
    }
  } catch (error: any) {
    // 404 is a normal result indicating no exact match found
    if (error.response && error.response.status === 404) {
      console.log('LRCLib: No exact match found (404). Falling back to search API...');
    } else {
      console.error('LRCLib: Exact lookup error:', error.message);
    }
  }

  // Step 2: Try search fallback via /api/search
  try {
    const searchQuery = `${artist} ${title}`;
    console.log(`LRCLib: Attempting search fallback with query "${searchQuery}"...`);
    
    const searchResponse = await axios.get('https://lrclib.net/api/search', {
      params: { q: searchQuery },
      headers
    });

    if (searchResponse.data && searchResponse.data.length > 0) {
      // Find the best match: prefer records with plain or synced lyrics, close in duration
      const results = searchResponse.data;
      
      // Filter results that have lyrics
      const withLyrics = results.filter((r: any) => r.plainLyrics || r.syncedLyrics);
      const candidates = withLyrics.length > 0 ? withLyrics : results;

      // Find the one closest in duration
      let bestMatch = candidates[0];
      let minDiff = Math.abs(bestMatch.duration - duration);

      for (let i = 1; i < candidates.length; i++) {
        const diff = Math.abs(candidates[i].duration - duration);
        if (diff < minDiff) {
          minDiff = diff;
          bestMatch = candidates[i];
        }
      }

      // If duration difference is reasonably small (e.g. less than 20 seconds), accept it
      if (minDiff < 20) {
        console.log(`LRCLib: Best search match found! (Duration diff: ${minDiff}s)`);
        return {
          plainLyrics: bestMatch.plainLyrics || null,
          syncedLyrics: bestMatch.syncedLyrics || null
        };
      } else {
        console.log(`LRCLib: Search results were too different in duration (diff: ${minDiff}s).`);
      }
    }
  } catch (error: any) {
    console.error('LRCLib: Search fallback error:', error.message);
  }

  console.log('LRCLib: No lyrics could be retrieved.');
  return {
    plainLyrics: null,
    syncedLyrics: null
  };
}
