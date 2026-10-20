import './style.css';
import { Game } from './game';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Contenitore #app assente');
try { new Game(app); } catch (error) {
  app.textContent = `Preparazione non riuscita: ${error instanceof Error ? error.message : String(error)}. Ricarica la pagina per riprovare.`;
  console.error(error);
}
