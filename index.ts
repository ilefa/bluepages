import axios from 'axios';
import cheerio from 'cheerio';
import tableparser from 'cheerio-tableparser';

axios.defaults.baseURL = 'https://phonebook.uconn.edu';
axios.defaults.headers['User-Agent'] = 'Mozilla/5.0 (X11; Linux x86_64; rv:90.0) Gecko/20100101 Firefox/90.0'

export interface BluepagesRecord {
    name: string;
    netId: string;
    title: string;
    department?: string;
    status: string;
    building?: string;
    mailBox?: string;
    email: string;
    phone?: string;
}

/**
 * Attempts to query a provided parameter from the
 * UConn Phonebook website, and return all
 * relevant information about that person.
 * 
 * Information about students (and student workers)
 * is not available to the public, so if you need to obtain
 * this information, please obtain a CAS Ticket from the
 * [UConn SSO page](https://login.uconn.edu/cas), and supply
 * it in the ``ticket`` parameter.
 * 
 * @param query the queried parameter (name, netID, email, etc.)
 * @param ticket an optional ticket token obtained from CAS
 */
export const lookup = async (query: string, ticket?: string): Promise<BluepagesRecord> => {
    let $ = await makeRequest(query, ticket);
    tableparser($);

    let data: string[][] = ($('.results') as any).parsetable();
    if (!data || !data[0])
        return null;

    let clean = data
        .map(row => row
            .filter(cell => !!cell.trim()
                 && cell !== '&nbsp;'))
        .filter(row => row.length > 0);

    let rawName = clean[0][0].split(', ');
    let name = rawName[1] + ' ' + rawName[0];
    let payload: BluepagesRecord = {
        name,
        netId: getAttribute('netId', clean),
        title: getAttribute('title', clean),
        department: getAttribute('department', clean),
        status: getAttribute('status', clean),
        building: getAttribute('building', clean),
        mailBox: getAttribute('mailBox', clean, 'UBox'),
        email: getAttribute('email', clean, 'E-mail',
            payload => cheerio.load(payload)('a').text()),
        phone: getAttribute('phone', clean)
    };

    return payload;
}

const makeRequest = async (query: string, ticket?: string): Promise<cheerio.Root> => {
    let basicText = query.replace(/\s/, '+').toLowerCase();
    let status = ticket ? 'any' : 'nonstudent';
    let params = `?basictext=${basicText}&status=${status}`;
    return await axios
        .post(`/lresults.php${params}`, {},
            !ticket
                ? {}
                : {
                    headers: {
                        'Set-Cookie': `PHPSESSID=${ticket}; Path=/; Domain=.phonebook.uconn.edu; Expires=Sat, 30 Jul 2022 22:41:34 GMT;`,
                        'Cookie': `PHPSESSID=${ticket}`
                    }
                    
                })
        .then(res => res.data)
        .then(html => cheerio.load(html))
        .catch(_ => null);
}

const getAttribute = (attribute: keyof BluepagesRecord, data: string[][], override?: string, processPayload?: (payload: string) => string) => {
    let parsed = data[0]
        .slice(1)
        .map((cell, i) => ({ $: cheerio.load(cell), i }))
        .find(({ $ }) => $('div').text().toLowerCase() === (override
            ? override.toLowerCase()
            : attribute.toLowerCase()));

    if (!parsed)
        return null;

    let payload = data[1][parsed.i];
    if (processPayload)
        payload = processPayload(payload);

    return payload;
}