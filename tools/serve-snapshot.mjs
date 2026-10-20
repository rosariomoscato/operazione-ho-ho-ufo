import { serve } from './serve.mjs';

// Serve the approved snapshot as-is. Never rebuild or overwrite its files.
const { url } = await serve('snapshots/m1-slice', 5176);
console.log(`Cortile M1 congelato: ${url}/`);
