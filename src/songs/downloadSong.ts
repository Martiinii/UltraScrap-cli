import fs from 'fs';
import { YtdlCore, toPipeableStream } from '@ybd-project/ytdl-core';
import { Transform, pipeline } from 'stream';
import { promisify } from 'util';
import videoFormat from "@ybd-project/ytdl-core"
import { downloadSongCover } from "./downloadSongCover.js";
import { getSongMetadata } from "./getSongMetadata.js";
import { fetchSongTxt } from "./fetchSongTxt.js";
import { createWriteStream, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { fetchSongYouTubeLink } from "./fetchSongYouTubeLink.js";
import { fetch, setGlobalDispatcher, Agent } from 'undici';
import readline from 'readline';

const pipelineAsync = promisify(pipeline);

// Configure global dispatcher with increased timeout settings
setGlobalDispatcher(new Agent({
    connect: { timeout: 30000 }, // Increase the timeout to 20 seconds
}));

// Define the expected client types and log display types
type YTDL_ClientTypes = 'web' | 'mweb' | 'tv' | 'ios';
type YTDL_LogDisplayTypes = 'debug' | 'info' | 'success' | 'warning' | 'error';

// Define the YtdlCore options interface matching YTDL_Constructor
interface YtdlCoreOptions {
    logDisplay: YTDL_LogDisplayTypes[] | "none";
    clients: YTDL_ClientTypes[];
    fetcher?: (url: URL | RequestInfo, options?: RequestInit) => Promise<Response>;
    noUpdate?: boolean;
    disableInitialSetup?: boolean;
}

// Initialize YtdlCore with detailed logging options
const ytdlOptions: YtdlCoreOptions = {
    logDisplay: ["error"],//["debug", "info", "success", "warning", "error"],
    clients: ["web", "mweb", "tv", "ios"]
};

const ytdl = new YtdlCore(ytdlOptions);



interface YTDL_DownloadOptions {
    itag: number;
    mimeType: string;
    bitrate: number;
    audioQuality?: string;
    audioSampleRate?: string;
    audioChannels?: number;
    quality?: string;
    approxDurationMs?: string;
    // Add other necessary properties if needed
}
/**
 * Convert embedded YouTube URL to standard YouTube URL.
 * 
 * @param embedUrl The embedded YouTube URL
 * @returns The standard YouTube URL
 */
const convertEmbedToStandardUrl = (embedUrl: string): string => {
    const videoId = embedUrl.split('/').pop();
    return `https://www.youtube.com/watch?v=${videoId}`;
};

function sanitizeFileName(fileName: string): string { 
    return fileName.replace(/[\u003C\u003E:\u0022/\\|?*]/g, '_'); 
}
/**
 * Download asynchronously song from the database
 * Might prompt for YouTube video link if it is not found
 * 
 * @param id Id of the song
 */
export const downloadSong = async (id: string | number) => {
    try {
        console.log(`Fetching song with id: ${id}`);
        const txtData = await fetchSongTxt(id);
        if (txtData !== "") 
        {
            const metadata = getSongMetadata(txtData);

        
            const sanitizedArtist = sanitizeFileName(metadata.ARTIST);
            const sanitizedTitle = sanitizeFileName(metadata.TITLE);
            const baseSongsPath = process.env.BASE_SONGS_PATH || 'C:/Programs/UltraScrap/songs/';
            const dirPath = `${baseSongsPath}${sanitizedArtist} - ${sanitizedTitle}`;

            mkdirSync(dirPath, { recursive: true });
            console.log(`Created directory ${dirPath}`);

            // Write metadata to usdb.animux.de.txt
            const metadataContent = `ID: ${id}\nMetadata: ${JSON.stringify(metadata, null, 2)}`;
            writeFileSync(`${dirPath}/usdb.animux.de.txt`, metadataContent, { encoding: 'utf-8' });
            console.log('Created usdb.animux.de.txt');

            // Check and create song.txt if not present
            const songTxtPath = `${dirPath}/song.txt`;
            if (!existsSync(songTxtPath)) {
                writeFileSync(songTxtPath, metadata.raw, { encoding: 'utf-8' });
                console.log('Saved lyrics in song.txt');
            } else {
                console.log('song.txt already exists');
            }

            // Check and download cover.jpg if not present
            const coverPath = `${dirPath}/cover.jpg`;
            if (!existsSync(coverPath)) {
                await downloadSongCover(id, dirPath, metadata.COVER);
                console.log('Downloaded cover image');
            } else {
                console.log('cover.jpg already exists');
            }

            let youtubeLink = await fetchSongYouTubeLink(id);
            if (!youtubeLink) {
                console.warn('YouTube link not found');
                youtubeLink = prompt('Enter YouTube link manually: ');
            } 

            // Convert embed URL to standard URL if necessary
            const videoUrl = youtubeLink && youtubeLink.includes('embed') ? convertEmbedToStandardUrl(youtubeLink) : youtubeLink;
            console.log(`YouTube link found: ${videoUrl}`);
            if (videoUrl) {
                try {
                    // Check and download audio.mp3 if not present
                    const audioPath = `${dirPath}/audio.mp3`;
                    if (!existsSync(audioPath)) {
                        console.log('YtdlCore Configuration:', ytdlOptions);
                        const info = await ytdl.getBasicInfo(videoUrl, { quality: 'highestaudio' }); 
                        // Map the formats to the expected type 
                        const allFormats: YTDL_DownloadOptions[] = info.formats as YTDL_DownloadOptions[];
                        //const audioFormats = YtdlCore.filterFormats(allFormats, 'audioonly');
                        const audioFormats = allFormats.filter(format => format.mimeType.includes('audio/')); 
                    // if (audioFormats.length === 0) { 
                        //   throw new Error('No audio-only formats available'); 
                    // }
                    const success = await promiseDownload(videoUrl, dirPath, 'audio.mp3', 'Downloaded audio file', {
                            filter: 'audioonly',
                            quality: 'highestaudio',
                        });
                        console.log(`Download finished with status: ${success}`);
                    } else {
                        console.log('audio.mp3 already exists');
                    }
                } catch (error: any) {
                    console.error(`Error downloading audio.mp3: ${error.message}`);
                }

                try {
                    // Check and download video.mp4 if not present
                    const videoPath = `${dirPath}/video.mp4`;
                    if (!existsSync(videoPath)) {
                        await promiseDownload(videoUrl, dirPath, 'video.mp4', 'Downloaded video file', {
                            filter: 'videoonly',
                        });
                    } else {
                        console.log('video.mp4 already exists');
                    }
                } catch (error: any) {
                    console.error(`Error downloading video.mp4: ${error.message}`);
                }
            } else {
                console.error('No YouTube link provided.');
            }

            console.log('Finished');
        } else {
            console.error(`Song with id: ${id} not found`);
        }

    } catch (error) {
        console.error('Error during download:', error);
    }
};



/**
 * Download both video and audio from link and save them in directory with provided names
 * 
 * @param link Link to video
 * @param dirPath Directory path
 * @param audioFilename Filename of the audio
 * @param videoFilename Filename of the video
 */
const rawDownload = async (link: string, dirPath: string, audioFilename: string, videoFilename: string) => {
    console.log('Starting to download video and audio');
    try {
        console.log(`Starting download for audio file: ${audioFilename}`);
        await promiseDownload(link, dirPath, audioFilename, 'Downloaded audio file  2222', {
            filter: 'audioonly',
            quality: 'highestaudio',
        });

        console.log(`Starting download for video file: ${videoFilename}`);
        await promiseDownload(link, dirPath, videoFilename, 'Downloaded video file', {
            filter: 'videoonly',
        });

        console.log('Finished downloading video and audio');
    } catch (error) {
        console.error('Error during raw download:', error);
    }
};

async function fetchVideoInfo(videoUrl: string) {
    try {
        const info = await ytdl.getBasicInfo(videoUrl);
        //console.log('Available formats:', info.formats.map(format => format.qualityLabel).filter(label => label));
    } catch (error) {
        console.error('Error fetching video info:', error);
    }
}

/**
 * Calculate approximate content length from metadata
 * 
 * @param bitrate Bitrate in bits per second
 * @param approxDurationMs Duration in milliseconds
 * @returns Approximate content length in bytes
 */
function calculateApproxContentLength(bitrate: number, approxDurationMs: number): number {
    const durationSeconds = approxDurationMs / 1000; // Convert milliseconds to seconds
    const contentLengthBits = bitrate * durationSeconds; // Calculate content length in bits
    const contentLengthBytes = Math.floor(contentLengthBits / 8); // Convert bits to bytes
    return contentLengthBytes;
}

/**
 * YTDL download/write stream wrapped in promise
 * 
 * @param link Link to YouTube video
 * @param dirPath Directory path
 * @param filename Filename to save
 * @param endString String to display after download is complete
 * @param options YTDL download options
 * @returns True if successful, false if there was an error
 */
const promiseDownload = async (link: string, dirPath: string, filename: string, endString: string, options?: any): Promise<boolean> => {
    try {
        console.log(`Initiating download for ${dirPath}/${filename}`);
        // Fetch video information first
        const info = await ytdl.getBasicInfo(link);
        let totalSize = 0;

        if (info.formats && info.formats.length > 0)
        {
            if ('contentLength' in info.formats[0] && info.formats[0].contentLength) {
                totalSize = parseInt(info.formats[0].contentLength as string, 10);
                process.stdout.write(`totalSize from contentLength: `);
            } else if (info.formats[0].bitrate && info.formats[0].approxDurationMs) {
                totalSize = calculateApproxContentLength(info.formats[0].bitrate, parseInt(info.formats[0].approxDurationMs));
                if (filename === 'video.mp4') 
                    totalSize = totalSize * 9; // Increase size by 25% for video{
                else
                totalSize = totalSize /2; // Decrease size by 50% for audio
                process.stdout.write(`totalSize from bitrate: `);    
            }
        } else { 
            if (filename === 'video.mp4') 
                totalSize =190881996;
            else
                totalSize =1908819;
            process.stdout.write(`totalSize from default: `,);    
        }
        console.log(`${Math.floor(totalSize/(1024*1024))} MB`);
        let downloadedSize = 0;
        let previousProgress = -10; // To ensure it starts with 9
        process.stdout.write(`\nDownloading ${filename} progress: `);

        // Create a transform stream to track progress
        const progressStream = new Transform({
            transform(chunk, encoding, callback) {
                downloadedSize += chunk.length;
                const progress = (totalSize > 0) ? (downloadedSize / totalSize) * 100 : 0;
                const progressStep = Math.floor(progress / 10);
                const countdownValue = 9 - progressStep;

                // Only update on each 10% interval
                if (progressStep > previousProgress) {
                    if (countdownValue < 0) {   
                        process.stdout.write(`\nSomething went wrong with file size, progress indicator stopped. Download continues...\n`);    
                        previousProgress = progressStep+100;
                    } else {
                    previousProgress = progressStep;
                    process.stdout.write(`${countdownValue}`);
                    }
                }
                callback(null, chunk);
            }
        });

        // Start the download
        const stream = toPipeableStream(await ytdl.download(link, options));
        const outputStream = createWriteStream(`${dirPath}/${filename}`);

        await pipelineAsync(await stream, progressStream, outputStream);

        console.log(`\n${endString} effective length: ${downloadedSize} Calculated: ${totalSize}`);
        return true;
    } catch (error: any) {
        let errorMessage = `Error during downloading ${filename}: ${error.message}`;
        if (error.message.includes("This video is private")) {
            errorMessage = `The video is private and cannot be downloaded: ${error.message}`;
        } else if (error.message.includes("This video is unavailable")) {
            errorMessage = `The video is unavailable and cannot be downloaded: ${error.message}`;
        } else if (error.message.includes("UnrecoverableError")) {
            errorMessage = `An unrecoverable error occurred: ${error.message}`;
        }
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    // Log the completion message
    console.log(`${endString}`);
    
    return true;
};

export { promiseDownload };