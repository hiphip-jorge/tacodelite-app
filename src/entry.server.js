// Entry point for AWS Lambda server
// This file handles serving the Vite+React app

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the built index.html
const indexPath = path.join(__dirname, '../../dist/index.html');
let indexHtml = '';

try {
    indexHtml = fs.readFileSync(indexPath, 'utf8');
} catch (error) {
    console.error('Error reading index.html:', error);
    indexHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Taco Delite</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div id="root">Loading...</div>
      </body>
    </html>
  `;
}

export function render() {
    return indexHtml;
}

export default {
    render,
};
