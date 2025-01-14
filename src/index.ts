import fs from 'node:fs/promises';
import * as path from 'node:path';
import process from 'node:process';
import { homedir } from 'node:os';
import { convertImmoRallyTrackSlideToSvg } from './convert.ts';

// const inputPath = process.argv[2];
// const outputPath = process.argv[2] + '.svg';
// try {
//     const data = await fs.readFile(inputPath, 'utf8');
//     const output = convertImmoRallyTrackSlideToSvg(data);
//     await fs.writeFile(outputPath, output, 'utf8');
// } catch (err) {
//     console.error(err);
//     process.exit(1);
// }

// STEAM_FOLDER is specific to Linux.
const STEAM_FOLDER = process.env.STEAM_FOLDER ?? path.join(homedir(), '.local/share/Steam');
const INPUT_DIR = process.env.INPUT_FOLDER ?? path.join(STEAM_FOLDER, 'steamapps/common/ImmoRally/irdata/tracks/');

await fs.mkdir('./tracks', {recursive: true});

for (const file of await fs.readdir(INPUT_DIR)) {
    if (!file.endsWith('.track')) {
        continue;
    }
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join('./tracks/', file + '.svg');
    try {
        const data = await fs.readFile(inputPath, 'utf8');
        const output = convertImmoRallyTrackSlideToSvg(data);
        await fs.writeFile(outputPath, output, 'utf8');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
} 
