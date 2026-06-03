import { randomUUID } from 'crypto';
import { readJson, writeJson } from './storage';
import { todayKST } from './date';

export async function getLibrary() {
  return readJson('library.json', []);
}

export async function getSetupMap() {
  return readJson('daily-setup.json', {});
}

export async function getPackagesForDate(date = todayKST()) {
  const library = await getLibrary();
  const setupMap = await getSetupMap();
  const ids = setupMap[date] || library.slice(0, 3).map((v) => v.id);
  return library.filter((v) => ids.includes(v.id));
}

export async function saveSetup(date, ids) {
  const setupMap = await getSetupMap();
  setupMap[date] = ids;
  await writeJson('daily-setup.json', setupMap);
}

export async function getSubmissions(date) {
  const rows = await readJson('submissions.json', []);
  const filtered = date ? rows.filter((v) => v.date === date) : rows;
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getSubmissionById(id) {
  const rows = await readJson('submissions.json', []);
  return rows.find((v) => v.id === id) || null;
}

export async function getPackage(id) {
  const library = await getLibrary();
  return library.find((v) => v.id === id) || null;
}

export async function createSubmission(input) {
  const rows = await readJson('submissions.json', []);
  const row = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
  rows.push(row);
  await writeJson('submissions.json', rows);
  return row;
}

export async function patchSubmission(id, patch) {
  const rows = await readJson('submissions.json', []);
  const idx = rows.findIndex((v) => v.id === id);
  if (idx < 0) return null;
  rows[idx] = { ...rows[idx], ...patch };
  await writeJson('submissions.json', rows);
  return rows[idx];
}
