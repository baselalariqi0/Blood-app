import { useEffect, useState } from 'react';
import { api } from './api.js';
import { List, Register } from './screens.jsx';
import { Sheet } from './ui.jsx';

export default function App() {
  const [tab, setTab] = useState('list'); const [donors, setDonors] = useState([]);
  const [sel, setSel] = useState(null); const [toast, setToast] = useState('');
  const say = m => { setToast(m); setTimeout(() => setToast(''), 2600); };
  useEffect(() => { api.list().then(setDonors).catch(e => say(e.message)); }, []);
  const add = async d => {
    try { const s = await api.add(d); setDonors(p => [s, ...p]); setTab('list'); window.scrollTo(0, 0); say('تم تسجيلك متبرعاً'); return true; }
    catch (e) { say(e.message || 'تعذّر الحفظ، حاول مرة أخرى'); return false; }
  };
  const remove = async id => { await api.remove(id); setDonors(p => p.filter(d => d.id !== id)); setSel(null); say('تم إلغاء تسجيلك'); };
  return (
    <>
      {tab === 'list' ? <List donors={donors} open={setSel} /> : <Register onAdd={add} />}
      {sel && <Sheet d={sel} onClose={() => setSel(null)} onRemove={remove} />}
      {toast && <div className="toast" role="status">{toast}</div>}
      <nav className="nav" aria-label="التنقل">
        <button aria-current={tab === 'list' ? 'page' : undefined} onClick={() => setTab('list')}>المتبرعون</button>
        <button aria-current={tab === 'reg' ? 'page' : undefined} onClick={() => setTab('reg')}>سجّل متبرعاً</button>
      </nav>
    </>
  );
}
