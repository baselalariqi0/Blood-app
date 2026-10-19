// طبقة البيانات: بدون VITE_API_URL تُحفظ البيانات على الجهاز، ومعه تتصل بالخادم في /server
import { SEED } from './data.js';
const API = import.meta.env.VITE_API_URL;
const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); if (v) return v; } catch (e) {} return fb; };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

const local = {
  async list() { return read('bd-donors', SEED); },
  async add(d) { write('bd-donors', [d, ...(await local.list())]); return d; },
  async remove(id) { write('bd-donors', (await local.list()).filter(x => x.id !== id)); },
};
const remote = {
  async list() {
    const r = await fetch(API + '/api/donors'); if (!r.ok) throw new Error('تعذّر تحميل المتبرعين');
    const mine = read('bd-mine', []);
    return (await r.json()).map(d => ({ ...d, mine: mine.includes(d.id) }));
  },
  async add(d) {
    const r = await fetch(API + '/api/donors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
    const j = await r.json(); if (!r.ok) throw new Error(j.error || 'تعذّر الحفظ');
    write('bd-mine', [j.id, ...read('bd-mine', [])]); return { ...j, mine: true };
  },
  async remove(id) { await fetch(API + '/api/donors/' + id, { method: 'DELETE' }); },
};
export const api = API ? remote : local;
