import fetch from 'node-fetch'

/**
 * Fetches youtube link from database
 * 
 * @param id Song id
 * @returns Youtube link or null
 */
export const getSongYoutubeLink = async (id: string | number) => {
    const response = await fetch(`https://usdb.animux.de/index.php?link=detail&id=${id}`);
    const details = await response.text();

    const youtubeLinkRegex = /<iframe.*?src\s?=\s?["'](.*?)["']/
    const match = details.match(youtubeLinkRegex);

    return match ? match[1] : null;
}