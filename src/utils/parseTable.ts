
export type SongType = {
    id: number,
    artist: string,
    title: string,
    language: string,
    views: number
};

/**
 * Parse table from page of songs intto list of objects
 * 
 * @param table HTML table
 * @returns List of songs as objects
 */
export const parseTable = (table: string): SongType[] => {
    const tableRegex = /<td onclick="show_detail\(\d+\)">(?:<a href="\?link=detail&id=(\d+)">)?(.*?)<\/td>/gm

    const regexMatches = Array.from(table.matchAll(tableRegex));

    const chunks: RegExpMatchArray[][] = [];

    const chunkSize = 7; // Split matches into chunks of 7 (table is made of 7 columns)
    for (let i = 0; i < regexMatches.length; i += chunkSize) {
        const x = regexMatches.slice(i, i + chunkSize)
        chunks.push(x);
    }

    return chunks.map(c => {
        return {
            id: parseInt(c[1][1]),
            artist: c[0][2],
            title: c[1][2],
            language: c[4][2].toLowerCase(),
            views: parseInt(c[6][2])
        }
    })
}