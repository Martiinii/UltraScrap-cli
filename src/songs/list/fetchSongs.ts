import { getLoginCookie } from "../../utils/login.js";
import { SongType, parseTable } from "../../utils/parseTable.js";

/**
 * Fetch one page of songs from database.
 * 
 * @param page Page number
 * @returns Songs page as object
 */
export const fetchSongPage = async (page: number) => {
    const result = await (await fetch(generateNPageLink(page), {
        method: "POST",
        headers: {
            'cookie': getLoginCookie()
        }
    })).text();

    const tableString = getTableRegex(result);
    const songsCounts = getSongsCountsRegex(result);


    const parsedObj = parseTable(tableString);

    return {
        data: parsedObj,
        currentPage: page,
        totalPages: songsCounts.totalPages,
        totalSongs: songsCounts.totalSongs,
        songsInPage: parsedObj.length
    }
}




export const fetchAllSongs = async () => {
    const concurrentLimit = 5;

    const songs: SongType[] = [];

    const firstPage = await fetchSongPage(1);
    songs.push(...firstPage.data);

    // Todo: run thorugh every page in concurrent promises limited by variable, add them to list (or run some function, possibly callback)
}



/**
 * Retrieve table of songs from page
 * 
 * @param page HTML page
 * @returns HTML table with songs as string
 */
const getTableRegex = (page: string) => {
    const regex = /<\/?br>[\r\n]*(<table.*?>[\s\S]*?<\/table>)/;
    return page.match(regex)![0];
}
/**
 * Retrieve count of pages and songs from page
 * 
 * @param page HTML page
 * @returns Total count of pages and songs
 */
const getSongsCountsRegex = (page: string) => {
    const regex = /There are\s*(\d+)\s+results on\s+(\d+)/
    const matched = page.match(regex)!;
    return {
        totalSongs: parseInt(matched[1]),
        totalPages: parseInt(matched[2])
    }
}

/**
 * Generate url for given page number
 * 
 * @param page Page number, starts from 1
 * @returns Page URL
 */
const generateNPageLink = (page: number) => {
    const limit = 3;
    return `https://usdb.animux.de/?link=list&=&limit=${limit}&start=${(page - 1) * limit}`;
}