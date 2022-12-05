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
    parentPort?.postMessage(`Started encoding ${input}`);
    const t1 = Date.now();
    const exitCode = await encodeFile(input, output);
    const t2 = Date.now();
    const delta = (t2 - t1) / 1000;

    parentPort?.postMessage(exitCode);
    if (exitCode === 0) {
      parentPort?.postMessage(
        `Done in ${delta.toFixed(1)}s, output: ${output}`
      );
    } else {
      parentPort?.postMessage(
        `ERROR: code ${exitCode}, output: ${output} (${delta.toFixed(1)}s)`
      );
    }
  }

  parentPort?.close();
});
