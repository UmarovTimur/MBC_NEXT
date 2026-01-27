/* eslint-disable no-console */
const IS_DEBUG = process.env.DEBUG_BUILD === 'true';

export const logger = {
   info: (message: string, ...args: unknown[]) => {
      console.log(`[INFO] ${message}`, ...args);
   },
   success: (message: string) => {
    console.log(`[SUCCESS] ${message}`);
  },
  debug: (message: string, object?: unknown) => {
    if (IS_DEBUG) {
      console.log(`[DEBUG] ${message}`);
      if (object) console.dir(object, { depth: null, colors: true });
    }
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ❌ ${message}`);
    if (error) console.error(error);
  }
}