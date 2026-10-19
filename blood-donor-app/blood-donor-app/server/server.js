import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';

const db = new Database(process.env.DB || 'donors.db');
db.exec(`
CREATE TABLE IF NOT EXISTS donors(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  blood_type TEXT NOT NULL CHECK(blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL CHECK(age BETWEEN 18 AND 65),
  last_donation TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_donors_type_city ON donors(blood_type, city);`);

const toClient = r => ({ id: r.id, name: r.name, type: r.blood_type, city: r.city, phone: r.phone, age: r.age, last: r.last_donation });
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/donors', (req, res) => {
  const { type, city } = req.query;
  const rows = db.prepare('SELECT * FROM donors WHERE (? IS NULL OR blood_type=?) AND (? IS NULL OR city=?) ORDER BY created_at DESC')
    .all(type ?? null, type ?? null, city ?? null, city ?? null);
  res.json(rows.map(toClient));
});

app.post('/api/donors', (req, res) => {
  const { name, type, city, phone, age, last } = req.body || {};
  if (!name?.trim() || !city?.trim() || !/^\+?[0-9]{8,15}$/.test(phone || '') || !(age >= 18 && age <= 65))
    return res.status(400).json({ error: 'بيانات غير صالحة' });
  const id = randomUUID();
  try {
    db.prepare('INSERT INTO donors(id,name,blood_type,city,phone,age,last_donation) VALUES(?,?,?,?,?,?,?)')
      .run(id, name.trim(), type, city.trim(), phone, age, last || null);
  } catch { return res.status(400).json({ error: 'فصيلة الدم غير صالحة' }); }
  res.status(201).json(toClient(db.prepare('SELECT * FROM donors WHERE id=?').get(id)));
});

// ملاحظة: الحذف بلا مصادقة في هذه النسخة التجريبية. أضف OTP/JWT قبل الإنتاج.
app.delete('/api/donors/:id', (req, res) => { db.prepare('DELETE FROM donors WHERE id=?').run(req.params.id); res.sendStatus(204); });

app.listen(process.env.PORT || 3000, () => console.log('API على المنفذ ' + (process.env.PORT || 3000)));
