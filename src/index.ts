import { downloadSong } from './songs/invidual/downloadSong.js';
import { fetchSongPage } from './songs/list/fetchSongs.js';
import { getLoginCookie, setLoginCookie } from './utils/login.js';
import promptInit from 'prompt-sync';
export const prompt = promptInit({ sigint: true })

await setLoginCookie();

const page = await fetchSongPage(1);

console.log(page)