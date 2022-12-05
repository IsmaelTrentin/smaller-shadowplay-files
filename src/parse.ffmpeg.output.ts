export const parseTimestamp = (timestamp: string) => {
  const values = timestamp.split(':');
  const timeObj = {
    h: parseInt(values[0]) || 0,
    m: parseInt(values[1]) || 0,
    s: parseFloat(values[2]) || 0,
  };
  return timeObj;
};

export const parseDuration = (output: string) => {
  const startKey = 'Duration: ';
  const startIdx = output.indexOf(startKey) + startKey.length;
  const endIdx = output.indexOf(', start:');
  const durationStr = output.substring(startIdx, endIdx).trim();
  return parseTimestamp(durationStr);
};

export const parseProgress = (output: string) => {
  const splitted = output.split('=').map(k => k.trim());

  const keys: string[] = [];
  let values: (string | number)[] = [];

  splitted.forEach((e, i) => {
    const entry = e.split(' ');
    if (i === splitted.length - 1) {
      values.push(entry[0]);
      return;
    }
    keys.push(entry[entry.length - 1]);
    if (i > 0) {
      values.push(entry[0]);
    }
  });
  values = values.map((v, i) => {
    if (i === 0 || i === 1) {
      return parseInt(v as string);
    }
    if (i === 2) {
      return parseFloat(v as string);
    }
    if (i === 6) {
      return parseFloat((v as string).replace('x', ''));
    }
    return v as string;
  });

  const outputObj: { [key: string]: string | number } = {};
  keys.forEach((k, i) => (outputObj[k] = values[i]));

  return outputObj;
};
