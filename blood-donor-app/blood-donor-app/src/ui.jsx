import { useEffect } from 'react';
import { since, wait } from './data.js';

export function Drop({ t, size = 48 }) {
  return (
    <svg className="drop" width={size} height={(size * 7) / 6} viewBox="0 0 48 56" role="img" aria-label={'فصيلة ' + t}>
      <path d="M24 2C24 2 6 24 6 36a18 18 0 0036 0C42 24 24 2 24 2z" />
      <text x="24" y="40">{'\u200E' + t + '\u200E'}</text>
    </svg>
  );
}

export function Status({ d }) {
  const w = wait(d);
  return w === 0 ? <span className="pill ok">متاح للتبرع</span> : <span className="pill wait">{'متاح بعد ' + w + ' يوماً'}</span>;
}

export function Sheet({ d, onClose, onRemove }) {
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={d.name} onClick={e => e.stopPropagation()}>
        <div className="top"><Drop t={d.type} size={56} /><div><h2>{d.name}</h2><Status d={d} /></div></div>
        <dl>
          <dt>المدينة</dt><dd>{d.city}</dd>
          <dt>العمر</dt><dd>{d.age} سنة</dd>
          <dt>آخر تبرع</dt><dd>{d.last ? since(d.last) + ' يوماً مضت' : 'لم يتبرع من قبل'}</dd>
          <dt>الهاتف</dt><dd dir="ltr" style={{ textAlign: 'right' }}>{d.phone}</dd>
        </dl>
        <a className="btn" href={'tel:' + d.phone}>اتصل بالمتبرع</a>
        {d.mine && <button className="btn alt" onClick={() => onRemove(d.id)}>إلغاء تسجيلي</button>}
        <button className="btn alt" onClick={onClose}>إغلاق</button>
      </div>
    </div>
  );
}
