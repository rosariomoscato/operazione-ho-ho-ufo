import { serve } from './serve.mjs';

const { url } = await serve('snapshots/m2-street', 5177);
console.log(`M2 approvato e congelato: ${url}/`);
