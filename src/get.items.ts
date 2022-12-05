import { Dirent } from 'fs';
import fs from 'fs/promises';

export const getItems = async (baseDir: string) => {
  let items: Dirent[] = [];
  try {
    items = await fs.readdir(baseDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw `Path ${baseDir} not found or not accessible`;
    }
    throw error;
  }
  const files = items.filter(i => i.isFile()).map(i => i.name);
  const dirs = items.filter(i => i.isDirectory()).map(i => i.name);
  return [files, dirs] as const;
};
