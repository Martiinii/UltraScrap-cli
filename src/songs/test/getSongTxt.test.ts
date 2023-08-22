import { getSongTxtRegex } from "../getSongTxt.js";
import { readFileSync } from 'node:fs'

test('Extract song lyrics from HTML file', () => {
    const songHTML = readFileSync('src/songs/test/data/rawSong.html').toString();
    const parsedSongTXT = readFileSync('src/songs/test/data/parsedSong.txt').toString();

    expect(getSongTxtRegex(songHTML)).toBe(parsedSongTXT);
})