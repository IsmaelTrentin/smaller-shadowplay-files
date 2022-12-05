import { parseDuration, parseProgress } from './parse.ffmpeg.output';

import { parentPort } from 'worker_threads';
import { spawn } from 'child_process';

const getInfo = async (inputFile: string) => {
  return new Promise<any>((resolve, reject) => {
    const chunks: string[] = [];
    const infoProc = spawn('ffmpeg', ['-i', inputFile]);

    infoProc.stderr.on('data', chunk => {
      chunks.push(chunk);
    });

    infoProc.on('close', () => {
      resolve(chunks.join('\n'));
    });
    // infoProc.on('error', err => reject(err));
  });
};

export const encodeFile = async (inputFile: string, outputFile: string) => {
  return new Promise<number | null>(async (resolve, reject) => {
    const info = await getInfo(inputFile);
    const duration = parseDuration(info);

    parentPort?.postMessage({ duration });

    const child = spawn('ffmpeg', [
      '-i',
      inputFile,
      '-c:v',
      'h264_nvenc',
      '-qp',
      '0',
      '-c:a',
      'aac',
      '-b:a',
      '320k',
      outputFile,
    ]);

    // child.stdout.pipe(process.stdout);

    // child.stdout.on('data', chunk => {
    //   console.log('got data', chunk?.length);
    // });

    child.stderr.on('data', chunk => {
      const str = Buffer.from(chunk).toString();
      if (str.includes('frame=')) {
        const startIdx = str.lastIndexOf('frame=');
        const endIdx = str.lastIndexOf('speed=') + 15;
        const outputStr = str.substring(startIdx - 6, endIdx).trim();
        const parsed = parseProgress(outputStr);
        parentPort?.postMessage(parsed);
      }
    });

    child.on('error', err => {
      reject(err);
    });
    child.on('close', code => {
      resolve(code);
    });
  });
};
