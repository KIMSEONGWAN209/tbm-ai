import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

export async function readJson(name, fallback) {
  const file = path.join(dataDir, name);
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    await fs.writeFile(file, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

export async function writeJson(name, value) {
  const file = path.join(dataDir, name);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2), 'utf8');
}
