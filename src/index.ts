import Queue from 'promise-queue';
import { encodeNode } from './encode.node';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

export let queue = new Queue(2, Infinity);

const main = async () => {
  const { path, workers: maxWorkers } = await yargs(hideBin(process.argv))
    .option('path', {
      alias: 'p',
      type: 'string',
      description: 'path',
    })
    .option('ext', {
      alias: 'e',
      type: 'string',
      default: 'mp4',
      description: 'file extension',
    })
    .option('workers', {
      alias: 'w',
      type: 'number',
      default: 2,
      description: 'Max workers',
    })
    .parse();

  if (!path) {
    throw new Error('No path provided');
  }

  const outDir = `${path}_encoded`;
  if (existsSync(outDir)) {
    throw new Error(`Out folder ${outDir} already exists`);
  } else {
    await fs.mkdir(outDir);
  }

  queue = new Queue(maxWorkers, Infinity);
  await encodeNode(path, outDir);
};

main().catch(err => console.error(err.message));
