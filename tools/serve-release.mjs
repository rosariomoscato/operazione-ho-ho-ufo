import { serve } from './serve.mjs';

const { url } = await serve('snapshots/release-candidate', 5179);
console.log(`Avventura completa, release candidate locale: ${url}/`);
