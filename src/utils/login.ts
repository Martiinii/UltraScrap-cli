import 'dotenv/config'

const loginUrl = "https://usdb.animux.de/index.php?link=login"
const username = process.env.ANIMUX_USERNAME!;
const password = process.env.ANIMUX_PASSWORD!;

const loginFormBody = new FormData();
loginFormBody.set("user", username);
loginFormBody.set("pass", password);
loginFormBody.set("login", "Login");


let loginCookie = '';

/**
 * Set login cookie in variable
 */
export const setLoginCookie = async () => {

    const loginFetch = await fetch(loginUrl, {
        method: 'POST',
        body: loginFormBody
    });

    loginCookie = loginFetch.headers.get('set-cookie')?.split(';')[0]!;
}

/**
 * Get login cookie
 * @returns Login cookie
 */
export const getLoginCookie = () => loginCookie;