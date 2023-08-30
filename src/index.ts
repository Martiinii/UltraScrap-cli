import { fetchSongPage } from './songs/list/fetchSongs.js';
import { setLoginCookie } from './utils/login.js';
import promptInit from 'prompt-sync';
export const prompt = promptInit({ sigint: true })


await setLoginCookie();
