import fetch from 'node-fetch'
import { createWriteStream } from 'node:fs'

/**
 * Downloads and saves song cover in directory with proided filename
 * 
 * @param id Song id
 * @param dirPath Directory path
 * @param imgName Image filename
 */
export const downloadSongCover = async (id: string | number, dirPath: string, imgName: string) => {
    const res = await fetch(`https://usdb.animux.de/data/cover/${id}.jpg`)

    res.body?.pipe(createWriteStream(`${dirPath}/${imgName}`))
}