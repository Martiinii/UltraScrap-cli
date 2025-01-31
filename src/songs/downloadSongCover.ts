import fetch from 'node-fetch';
import { createWriteStream } from 'node:fs';

/**
 * Transform function to ensure thrown errors are instances of Error
 * 
 * @param e The error to check
 * @returns An Error instance
 */
function Err(e: unknown): Error {
    if (e instanceof Error) {
        return e;
    }
    throw new Error(`Unexpected Throw: ${typeof e}`);
}
function isErrWithCode(e: unknown): e is Error & { code: string } {
    return e instanceof Error && 'code' in e;
}

/**
 * Downloads and saves song cover in directory with provided filename
 * 
 * @param id Song id
 * @param dirPath Directory path
 * @param imgName Image filename
 */
export const downloadSongCover = async (id: string | number, dirPath: string, imgName: string) => {
    try {
        console.log(`https://usdb.animux.de/data/cover/${id}.jpg`);
        const res = await fetch(`https://usdb.animux.de/data/cover/${id}.jpg`);

        if (!res.ok) {
            throw new Error(`Failed to fetch image: ${res.statusText}`);
        }

        res.body?.pipe(createWriteStream(`${dirPath}/${imgName}`));
    } catch (error: unknown) {
        const err = Err(error);
        if (err.message.includes('ENOENT')) {
            console.error('Specific error message for ENOENT:', err.message);
        } else {
            console.error('Error during download:', err.message);
        }
    }
}
