import { writeFile, mkdirSync, existsSync } from 'fs';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

const writeFilePromisified = promisify(writeFile);

// Load .env file
dotenv.config();

const targetPath = './src/environments/environment.ts';
const devTargetPath = './src/environments/environment.development.ts';

const environmentFileContent = `export const environment = {
  production: ${process.env['NODE_ENV'] === 'production'},
  apiUrl: '${process.env['API_URL'] || 'http://localhost:3000/api/v1'}'
};
`;

const dir = './src/environments';
if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
}

(async () => {
    try {
        await writeFilePromisified(targetPath, environmentFileContent);
        await writeFilePromisified(devTargetPath, environmentFileContent.replace('production: true', 'production: false'));
        console.log(`Environment files generated successfully at ${targetPath}`);
    } catch (err) {
        console.error(err);
    }
})();
