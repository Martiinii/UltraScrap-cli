
# UltraScrap
Download any song from [the biggest database](https://usdb.animux.de) of UltraStar songs in a matter of seconds.

This project was created in a matter of hours because me and a group of my friends wanted to sing the newest songs, but they weren't available elsewhere. Because this database provides only txt file (just lyrics, no audio or video), they had to be downloaded separately.

This project automates all of that *(and even skips 25 seconds of waiting time before downloading start)*. It downloads all of the essential files and puts them into corresponding directories.

Instead of:
- Waiting 25 seconds for download to start
- Searching for YouTube video
- Downloading video and music separately
- Changing filenames to match those in song txt file

Just enter song id into the console.

# How to use
1. Create an account on https://usdb.animux.de (I recommend creating 2 accounts, one for browsing, second one for scrapper, see FAQ)
2. Create `.env` file in the root directory and put the credentials here:
```env
USERNAME="Your username here"
PASSWORD="Your password here"
```
3. Run either:
 ```shell
npm run build
npm run start
```

Or:
```shell
npm run buildstart
```

Then you will be prompted to enter song id.

4. Enjoy singing!

# FAQ
## Where to find song id?
Once you open any song, the **id** is in the end of the link:
`usdb.animux.de/index.php?link=detail&id=27563`
For the link above, the **song id** is **27563**.
Copy it and paste it into the console when prompted.

## Why two accounts?
One account will be used for us to search songs in the database, second one for scrapper. When we start the script, it will log in and store PHP session cookie and any other session would be destroyed. This means that we can only be logged in from one device at a time. So we could either search or use script. Second account solves this problem for us (Searching database through the script in on the TODO list).

## YouTube link not found. Enter YouTube link manually
If link to YouTube video could not be found automatically, find the song and grab its link, then paste it into console when prompted.

## Lyrics are not synchronized with music/video
There is currently no easy fix for this. You could either download other version (if available) or mess with **START** and **END** variable in txt file. When the lyrics are mismatched/missing, find another version.

## Error during downloading
If there was an error while downloading YouTube video/audio, open the link and check if the error isn't displayed there. It could be to many reasons:
- YouTube is experiencing some outage
- Video is age restricted
- Video is not available in your country
- Video doesn't exist anymore
- The author of the video changed its visibility

If the error is due to outage, wait a few minutes and try again, in any other case you have to find other way to download it.
# Links
- https://usdb.animux.de - The biggest database of UltraStar songs (lyrics only)
- https://ultrastar-es.org/ - Smaller database of songs, includes audio and video. You can download **UltraStar WorldParty** here.
