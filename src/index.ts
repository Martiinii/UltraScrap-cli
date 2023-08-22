import { setLoginCookie } from './utils/login.js';
import { downloadSong } from './songs/downloadSong.js';
import promptInit from 'prompt-sync';

await setLoginCookie();
export const prompt = promptInit({ sigint: true })

while (true) {
    console.log(''); // Creates gap between downloaded songs. Do not use \n in prompt, it will cause visual glitches
    const songId = prompt('Input song id: ');

    await downloadSong(songId);
}
