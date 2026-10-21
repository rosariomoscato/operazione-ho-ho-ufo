import { serve } from './serve.mjs';

const { url } = await serve('snapshots/polished-1', 5181);
console.log(`Versione rifinita locale: ${url}/`);
