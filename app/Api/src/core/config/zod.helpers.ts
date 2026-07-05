export const boolPreprocess = (val: unknown) => val === 'true' || val === true;

export const parseEnvBoolean = (val: unknown, defaultValue = false): boolean => {
  if (val === undefined || val === null || val === '') {
    return defaultValue;
  }
  if (typeof val === 'boolean') {
    return val;
  }
  return val === 'true';
};

export const numPreprocess = (val: unknown) => {
  if (val === undefined || val === null || val === '') return undefined;
  return Number(val);
};

export const optStrPreprocess = (val: unknown) => (val === '' ? undefined : val);
