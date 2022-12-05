import { encodeFile } from './encode.file';
import { parentPort } from 'worker_threads';

if (!parentPort) {
  console.log('parentPort is null');
  process.exit(1);
}

parentPort.on('message', async data => {
  const { inputFiles, outputFiles } = data;

  for (let i = 0; i < inputFiles.length; i++) {
    const input = inputFiles[i];
    const output = outputFiles[i];
    parentPort?.postMessage(`encoding ${input}...`);
    const exit = await encodeFile(input, output);
    parentPort?.postMessage(exit);
  }

  parentPort?.close();
});
