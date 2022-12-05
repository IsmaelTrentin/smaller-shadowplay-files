import { Worker } from 'worker_threads';
import fs from 'fs/promises';
import { getItems } from './get.items';
import path from 'path';
import { queue } from '.';

export const encodeNode = async (nodePath: string, outDirRoot: string) => {
  const [files, dirs] = await getItems(nodePath);
  let root = path.parse(nodePath).dir.split(path.sep)[0];
  root = root.trim().length === 0 ? nodePath : root;
  const outDir = nodePath.replace(root, outDirRoot);

  try {
    await fs.mkdir(outDir, { recursive: true });
  } catch (error) {
    if (error.code === 'EEXIST') {
      console.log('out dir already exists, ignorig error');
    } else {
      throw error;
    }
  }

  for (const dir of dirs) {
    const nestedPath = path.join(nodePath, dir);
    await encodeNode(nestedPath, outDirRoot);
  }

  const inputFiles: string[] = [];
  const outputFiles: string[] = [];

  for (const file of files) {
    inputFiles.push(path.join(nodePath, file));
    outputFiles.push(path.join(outDir, file) + '.encoded.mp4');
  }

  const runWorker = () => {
    return new Promise<number | null>((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, 'worker.js'));
      const id = worker.threadId;
      console.log(`Running worker ${id} for node ${nodePath}`);
      console.log(`[${id}][NODE] ${dirs.length} dirs | ${files.length} files`);

      const payload = {
        id,
        inputFiles,
        outputFiles,
      };
      worker.postMessage(payload);

      worker.on('message', msg => {
        console.log(`[${id}] ${msg}`);
      });

      worker.on('error', err => reject(err));
      worker.on('messageerror', err => reject(err));

      worker.on('exit', code => resolve(code));
    });
  };

  queue.add(runWorker);
};
