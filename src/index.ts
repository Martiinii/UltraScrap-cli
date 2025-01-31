import { setLoginCookie } from './utils/login.js';
import { downloadSong } from './songs/downloadSong.js';
import { fetchSongTxt } from "./songs/fetchSongTxt.js";
import { getSongMetadata, Metadata } from './songs/getSongMetadata.js';  // Import the getSongMetadata function
import promptInit from 'prompt-sync'; 
import * as fs from 'fs'; 
import csv from 'csv-parser';
import * as dotenv from 'dotenv';

const prompt = promptInit();

import readline from 'readline';

function promptWithTimeout(question: string, timeoutMs: number, defaultValue: string): Promise<string> {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const timer = setTimeout(() => {
            rl.close();
            console.log(`\nNo answer given. Defaulting to option ${defaultValue}.`);
            resolve(defaultValue);
        }, timeoutMs);

        rl.question(question, (answer) => {
            clearTimeout(timer);
            rl.close();
            resolve(answer || defaultValue);
        });
    });
}



async function readCsvFile(filePath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const ids: string[] = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                ids.push(row['id']);
            })
            .on('end', () => {
                resolve(ids);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

async function fetchMetadataAndSaveToTxt(start: number, end: number, outputPath: string) {
    const headers = ["id", "ARTIST", "TITLE", "MP3", "CREATOR", "EDITION", "GENRE", "YEAR", "LANGUAGE", "BPM", "GAP", "VIDEO", "COVER"];
    const headersWritten = new Set<string>();

    for (let i = start; i <= end; i++) {
        try {
            console.log(`Fetching metadata for song ID: ${i}`);
            // Fetch raw song text (implement fetchSongTxt to retrieve raw song txt)
            const rawSongTxt = await fetchSongTxt(i);  // Replace with your actual implementation
            if (rawSongTxt !== '') {
                const metadata = getSongMetadata(rawSongTxt);  // Parse metadata

                // Add the id to the metadata and convert it to a string  Exclude 'song' and 'raw' fields 
                const { song, raw, ...relevantMetadata } = metadata;
                const metadataWithId = { id: i.toString(), ...relevantMetadata };
                // Write metadata to TXT file in CSV format
                const txtStream = fs.createWriteStream(outputPath, { flags: 'a' });
                
                // Write headers if not already written
                if (headersWritten.size === 0) {
                    const headers = Object.keys(metadataWithId);
                    txtStream.write(headers.join('§') + '\n');
                    headers.forEach(header => headersWritten.add(header));
                }

                // Map metadata to row with placeholders for missing values
                const row = headers.map(header => (metadataWithId[header as keyof typeof metadataWithId] ?? '')).join('§');
                txtStream.write(row + '\n');
                txtStream.end();
            } else
                console.log(`Song with id: ${i} not found`);
        } catch (error) {
            console.error(`Error fetching metadata for song ID: ${i}`, error);
        }
    }

    console.log(`Metadata for songs from ID ${start} to ${end} saved to ${outputPath}`);
}
function Err(e: unknown): Error {
    if (e instanceof Error) {
       return e;
    }
    throw new Error(`Unexpected Throw: ${typeof e}`);
 }
 
await setLoginCookie();

async function main() {
    const mode = await promptWithTimeout('Enter mode (1 for downloading songs, 2 for fetching metadata): ', 10000, '1');
    dotenv.config();

    const lastProcessedIdFile = process.env.LAST_PROCESSED_ID_FILE || 'defaultFilename.txt';
    const faultingIdFile = process.env.FAULTING_IDS_FILE || 'faultingId.txt';
    const songsToDownload = process.env.SONGS_TO_DOWNLOAD || 'FilesToRedownload.csv';
    const downloadedSongsMetadataFile = process.env.DOWNLOADED_SONGS_METADATA_FILE || 'DownloadedSongsMetatdataFile.csv';
    
    let lastProcessedId: string | null = null;

    if (fs.existsSync(lastProcessedIdFile)) {
        lastProcessedId = fs.readFileSync(lastProcessedIdFile, 'utf-8').trim();
    }
        
    if (mode === '1') {
        if (!fs.existsSync(songsToDownload)) {
            console.error('Error: have you set the SONGS_TO_DOWNLOAD in .env and the file exists? Sample file content: id,ARTIST,TITLE\n26443,Muse,Compliance\n');
            return;
        }
        let ids = null;    
        try {
            ids = await readCsvFile(songsToDownload);
        } catch (error: unknown) {
            const err = Err(error);
            if (err.message.includes('no such file')) {
                console.error('No ids found. Have you set the SONGS_TO_DOWNLOAD in .env and the file exists? Sample file content: id,ARTIST,TITLE\n26443,Muse,Compliance\n', err.message);
            } else {
                console.error('Error retrieving ids: ', err.message);
            }
            return null;
        }
        let startProcessing = false;
        
        for (const songId of ids) {
            if (!startProcessing && lastProcessedId && songId !== lastProcessedId) {
                continue; // Skip IDs until the last processed ID is found
            }
            
            startProcessing = true;
            if (songId == lastProcessedId) {
                fs.appendFileSync(faultingIdFile, songId + '\n', 'utf-8'); // Append the current song ID to the file

                continue; // Skip also the faulting ID
            }

            console.log(''); // Creates gap between downloaded songs. Do not use \n in prompt, it will cause visual glitches
            try {
                fs.writeFileSync(lastProcessedIdFile, songId, 'utf-8'); // Save the current song ID to the file
                await downloadSong(songId);
            } catch (error: unknown) {
                const err = Err(error);
                if (err.message.includes('ENOENT')) {
                    console.error('Specific error message for ENOENT:', err.message);
                } else {
                    console.error('Error during download:', err.message);
                }
                continue; // Continue to the next iteration
            }
        }
        if (startProcessing === false)
            console.error(`No new songs to download. Check if ids are present in ${songsToDownload} and last processed id ${lastProcessedId} is in this list.`);

    } else if (mode === '2') {
        await fetchMetadataAndSaveToTxt(1, 30000, downloadedSongsMetadataFile);
    } else {
        console.error('Invalid mode selected. Please enter 1 or 2.');
    }
}

main().catch(error => { console.error(`Unexpected error: ${error.message}`); });