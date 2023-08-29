import { getLoginCookie } from "../../utils/login.js";

// POST requests made with this form data skip 25 of waiting time
const txtBody = new FormData();
txtBody.set('wd', "1")

/**
 * Fetches original song txt from database
 * 
 * @param id Song id
 * @returns Song txt as string
 */
export const fetchSongTxt = async (id: string | number) => {
    const txt = await fetch(`https://usdb.animux.de/index.php?link=gettxt&id=${id}`, {
        method: "POST",
        headers: {
            'cookie': getLoginCookie()
        },
        body: txtBody
    });
    const response = await txt.text();

    return getSongTxtRegex(response);
}
/**
 * Extracts song from HTML site with regex
 * 
 * @param raw HTML file as string
 * @returns Song txt file as string
 */
export const getSongTxtRegex = (raw: string) => {
    const txtRegex = /<textarea.*>((.|\n|\r)*?)</
    return raw.match(txtRegex)![1];
}