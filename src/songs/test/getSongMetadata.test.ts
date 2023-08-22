import { convertMetadataToTxt, getSongClearRegex, getSongMetadataRegex, type Metadata } from '../getSongMetadata'
import { readFileSync } from 'node:fs'

describe('Song metadata regex', () => {
    const songTxt = readFileSync('src/songs/test/data/parsedSong.txt').toString();
    const clearSongFile = readFileSync('src/songs/test/data/clearSong.txt').toString();

    const metadataObject: Metadata = {
        ARTIST: 'Ryan Gosling',
        TITLE: `I'm Just Ken`,
        MP3: `Ryan Gosling - I'm Just Ken.mp3`,
        COVER: `Ryan Gosling - I'm Just Ken [CO].jpg`,
        BACKGROUND: `Ryan Gosling - I'm Just Ken [BG].jpg`,
        YEAR: '2023',
        LANGUAGE: 'English',
        BPM: '335.68',
        GAP: '8700',
        VIDEO: 'v=ru1LC9lW20Q,co=https://cdn2.albumoftheyear.org/750x/album/672312-barbie-the-album_1027.jpg',
    }

    test('Extract metadata from song txt into object', () => {
        expect(getSongMetadataRegex(songTxt)).toEqual(metadataObject);
    });

    test('Extract only song fron song txt', () => {
        expect(getSongClearRegex(songTxt)).toBe(clearSongFile);
    });

    test('Convert metadata object back to string', () => {
        const metadata = getSongMetadataRegex(songTxt);
        const clearSong = getSongClearRegex(songTxt);

        const converted = convertMetadataToTxt({ ...metadata, song: clearSong });
        expect(converted).toBe(songTxt);
    })
})
