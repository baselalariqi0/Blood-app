import { useMemo, useState } from 'react';
import { TYPES, norm, wait } from './data.js';
import { Drop, Status } from './ui.jsx';

export function List({ donors, open }) {
  const [q, setQ] = useState(''); const [t, setT] = useState(''); const [av, setAv] = useState(false);
  const shown = useMemo(() => donors
    .filter(d => (!t || d.type === t) && (!av || wait(d) === 0) && (!q.trim() || (d.name + ' ' + d.city).includes(q.trim())))
    .sort((a, b) => (wait(a) > 0) - (wait(b) > 0) || a.name.localeCompare(b.name, 'ar')), [donors, q, t, av]);
  const n = donors.filter(d => wait(d) === 0).length;
  return (
    <>
      <header><h1>متبرعو الدم</h1><p className="sub">{n + ' متبرعاً متاحاً الآن من أصل ' + donors.length}</p></header>
      <input type="search" placeholder="ابحث بالاسم أو المدينة" aria-label="ابحث بالاسم أو المدينة" value={q} onChange={e => setQ(e.target.value)} />
      <div className="chips" role="group" aria-label="فصيلة الدم">
        <button className="chip" aria-pressed={t === ''} onClick={() => setT('')}>الكل</button>
        {TYPES.map(x => <button key={x} className="chip t" aria-pressed={t === x} onClick={() => setT(t === x ? '' : x)}>{x}</button>)}
      </div>
      <label className="row"><input type="checkbox" checked={av} onChange={e => setAv(e.target.checked)} />المتاحون للتبرع الآن فقط</label>
      {shown.length === 0
        ? <p className="empty">لا يوجد متبرعون مطابقون. جرّب فصيلة أخرى أو ألغِ تصفية المتاحين.</p>
        : shown.map(d => (
          <button key={d.id} className="card" onClick={() => open(d)}>
            <Drop t={d.type} />
            <span className="grow"><b>{d.name}</b><small>{d.city + ' • ' + d.age + ' سنة'}</small><br /><Status d={d} /></span>
          </button>))}
    </>
  );
}

const EMPTY = { name: '', type: '', city: '', phone: '', age: '', last: '', ok: false };

export function Register({ onAdd }) {
  const [f, setF] = useState(EMPTY); const [er, setEr] = useState({});
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const today = new Date().toISOString().slice(0, 10);
  const submit = async e => {
    e.preventDefault();
    const age = parseInt(norm(f.age), 10), ph = norm(f.phone).replace(/[\s-]/g, ''), x = {};
    if (f.name.trim().length < 3) x.name = 'أدخل اسمك الكامل';
    if (!f.type) x.type = 'اختر فصيلة دمك';
    if (!f.city.trim()) x.city = 'أدخل مدينتك';
    if (!/^\+?[0-9]{8,15}$/.test(ph)) x.phone = 'أدخل رقم هاتف صحيح (من 8 إلى 15 رقماً)';
    if (!(age >= 18 && age <= 65)) x.age = 'العمر يجب أن يكون بين 18 و65 سنة';
    if (f.last > today) x.last = 'تاريخ آخر تبرع لا يمكن أن يكون في المستقبل';
    if (!f.ok) x.ok = 'وافق على إظهار رقمك للمحتاجين';
    setEr(x); if (Object.keys(x).length) return;
    const ok = await onAdd({ id: 'u' + Date.now(), name: f.name.trim(), type: f.type, city: f.city.trim(), phone: ph, age, last: f.last || null, mine: true });
    if (ok) setF(EMPTY);
  };
  const Er = ({ k }) => (er[k] ? <p className="err" role="alert">{er[k]}</p> : null);
  return (
    <>
      <header><h1>سجّل متبرعاً</h1><p className="sub">يظهر اسمك ومدينتك ورقمك لمن يبحث عن فصيلتك.</p></header>
      <form onSubmit={submit} noValidate>
        <div className="field"><label htmlFor="n">الاسم الكامل</label><input id="n" autoComplete="name" value={f.name} onChange={e => set('name', e.target.value)} /><Er k="name" /></div>
        <div className="field"><span className="lbl">فصيلة الدم</span>
          <div className="chips" role="group" aria-label="فصيلة الدم">{TYPES.map(x => <button type="button" key={x} className="chip t" aria-pressed={f.type === x} onClick={() => set('type', x)}>{x}</button>)}</div><Er k="type" /></div>
        <div className="field"><label htmlFor="c">المدينة</label><input id="c" value={f.city} onChange={e => set('city', e.target.value)} /><Er k="city" /></div>
        <div className="field"><label htmlFor="p">رقم الهاتف</label><input id="p" type="tel" inputMode="tel" dir="ltr" style={{ textAlign: 'right' }} placeholder="05xxxxxxxx" value={f.phone} onChange={e => set('phone', e.target.value)} /><Er k="phone" /></div>
        <div className="field"><label htmlFor="a">العمر</label><input id="a" inputMode="numeric" value={f.age} onChange={e => set('age', e.target.value)} /><Er k="age" /></div>
        <div className="field"><label htmlFor="l">تاريخ آخر تبرع <span className="hint">(اختياري)</span></label><input id="l" type="date" max={today} value={f.last} onChange={e => set('last', e.target.value)} /><Er k="last" /></div>
        <label className="row"><input type="checkbox" checked={f.ok} onChange={e => set('ok', e.target.checked)} />أوافق على إظهار رقم هاتفي للمحتاجين للتبرع</label><Er k="ok" />
        <button className="btn" type="submit">سجّلني متبرعاً</button>
      </form>
    </>
  );
}
