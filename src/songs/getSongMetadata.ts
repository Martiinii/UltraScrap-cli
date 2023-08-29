
export type Metadata = {
    ARTIST: string,
    TITLE: string,
    MP3: string,
    COVER: string,
    BACKGROUND: string,
    YEAR: string,
    LANGUAGE: string,
    BPM: string,
    GAP: string,
    VIDEO: string,
    song?: string
}
/**
 * Function to parse raw song txt file into object that contains metadata.
 * It changes VIDEO, COVER and MP3 values into simple variables:
 * VIDEO: video.mp4
 * COVER: cover.jpg
 * MP3: audio.mp3
 * 
 * @param song Raw song txt file
 * @returns Song metadata
 */
export const getSongMetadata = (song: string) => {
    const metadata = getSongMetadataRegex(song)
    const cleanSong = getSongClearRegex(song)

    metadata.VIDEO = 'video.mp4';
    metadata.COVER = 'cover.jpg';
    metadata.MP3 = 'audio.mp3';

    return {
        ...metadata,
        song: cleanSong,
        raw: convertMetadataToTxt({ ...metadata, song: cleanSong })
    }
}

/**
 * Extracts metadata from song txt
 * 
 * @param raw Raw song txt
 * @returns Metadata object
 */
export const getSongMetadataRegex = (raw: string) => {
    const metadataRegex = /#(.*?):(.*)/g
    const metadata: Metadata = {} as never;

    const data = raw.matchAll(metadataRegex);

    for (const match of data) {
        metadata[match[1] as keyof Metadata] = match[2];
    }
    
    return metadata
}

/**
 * Extract only song lyrics from song txt
 * 
 * @param raw Raw song txt
 * @returns Song lyrics
 */
export const getSongClearRegex = (raw: string) => {
    const songRegex = /^#.*$/gm;
    return raw.replace(songRegex, '').trim();
}

/**
 * Converts Metadata object back to string
 * 
 * @param metadata Metadata object
 * @returns TXT file as string
 */
export const convertMetadataToTxt = (metadata: Metadata) => {
    const { song, ...md } = metadata;

    const mdList = Object.entries(md);

    const headers = mdList.map(kv => `#${kv[0]}:${kv[1]}`).join('\n');

    return `${headers}\n${song}`
}