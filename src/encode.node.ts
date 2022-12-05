import ProgressBar from 'progress';
import { Worker } from 'worker_threads';
import fs from 'fs/promises';
import { getItems } from './get.items';
import { logger } from './logger';
import { parseTimestamp } from './parse.ffmpeg.output';
import path from 'path';
import { queue } from '.';

const barsMap = new Map<number, { latestTime: number; bar: ProgressBar }>();

export const encodeNode = async (nodePath: string, outDirRoot: string) => {
  const [files, dirs] = await getItems(nodePath);
  let root = path.parse(nodePath).dir.split(path.sep)[0];
  root = root.trim().length === 0 ? nodePath : root;
  const outDir = nodePath.replace(root, outDirRoot);

  try {
    await fs.mkdir(outDir, { recursive: true });
  } catch (error) {
    if (error.code === 'EEXIST') {
      logger.error('out dir already exists, ignorig error', {
        at: 'encodeNode.mkdir',
      });
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

      logger.info(`Running worker ${id} for node ${nodePath}`, {
        at: 'encodeNode.runWorker',
      });
      logger.info(`${dirs.length} dirs | ${files.length} files`, {
        at: `worker.${id}`,
      });

      const payload = {
        id,
        inputFiles,
        outputFiles,
      };
      worker.postMessage(payload);

      worker.on('message', msg => {
        // exit code
        if (typeof msg === 'number') {
          if (msg === 0) {
            barsMap.delete(id);
          }
          // current file duration
        } else if (msg?.duration != undefined) {
          const entryData = {
            latestTime: 0,
            bar: new ProgressBar(`[${id}] encoding [:bar] :percent :etas`, {
              complete: '=',
              incomplete: ' ',
              width: 36,
              total:
                msg.duration.s + msg.duration.m * 60 + msg.duration.h * 120,
            }),
          };
          barsMap.set(id, entryData);
          // progress data (frames, framerate, q, time, ...)
        } else if (typeof msg === 'object') {
          const entry = barsMap.get(id);
          if (!entry) return;
          const timeObj = parseTimestamp(msg.time);
          const sum = timeObj.s + timeObj.m * 60 + timeObj.h * 120;
          const tick = sum - entry.latestTime;
          entry.latestTime = sum;
          entry.bar.tick(tick);
          console.log();
        } else {
          logger.info(msg, {
            at: `worker.${id}.message`,
          });
        }
      });

      worker.on('error', err => reject(err));
      worker.on('messageerror', err => reject(err));

      worker.on('exit', code => resolve(code));
    });
  };

  queue.add(runWorker);
};
