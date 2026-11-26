import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
function App() {
  return <main><p className="eyebrow">YOUR PERSONAL NOTEBOOK</p><h1>A little space<br/>for your ideas.</h1><p className="intro">Keep your thoughts, plans, and discoveries together.</p><section aria-labelledby="setup-title"><span aria-hidden="true">✦</span><h2 id="setup-title">A fresh start</h2><p>Your notebook is taking shape. Sign-in and note editing are coming in the next features.</p></section><footer>Notes · 10Pearls Internship</footer></main>;
}
const root = document.getElementById('root');
if (!root) throw new Error('Root element is missing');
createRoot(root).render(<StrictMode><App /></StrictMode>);
