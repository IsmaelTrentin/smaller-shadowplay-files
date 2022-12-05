import { spawn } from 'child_process';

export const encodeFile = async (inputFile: string, outputFile: string) => {
  return new Promise<number | null>((resolve, reject) => {
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

    // child.stderr.pipe(process.stderr);

    // let errEvents = 0;
    // child.stderr.on('data', chunk => {
    //   if (errEvents > 6) {
    //     const buffer = Buffer.from(chunk);
    //     process.stdout.write(buffer);
    //   }
    //   errEvents++;
    // });

    child.on('error', err => {
      reject(err);
    });
    child.on('close', code => {
      resolve(code);
    });
  });
};
