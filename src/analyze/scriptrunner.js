import { spawn } from 'child_process';
import sharp from 'sharp';
import fs from 'fs';
const __dirname = import.meta.dirname;

InputPath = `${__dirname}../../results.json`;
OutputPath = `${__dirname}../../results-filtered.json`;

async function AnalyzeData(InputPath) {
    // code here
}

AnalyzeData(InputPath);
