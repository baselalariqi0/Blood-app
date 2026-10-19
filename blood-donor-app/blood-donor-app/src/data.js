export const TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const GAP = 90; // أيام الانتظار بين تبرعين؛ عدّلها حسب جهة الصحة المحلية
const ago = d => (d == null ? null : new Date(Date.now() - d * 864e5).toISOString().slice(0, 10));
export const since = iso => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 864e5) : null);
export const norm = s => s.replace(/[٠-٩]/g, c => '٠١٢٣٤٥٦٧٨٩'.indexOf(c));
export const wait = d => { const s = since(d.last); return s == null || s >= GAP ? 0 : GAP - s; };
export const SEED = [
  ['أحمد الخالدي', 'O+', 'الرياض', '0550000001', 29, 120], ['سارة المنصور', 'A-', 'جدة', '0550000002', 34, 45],
  ['يوسف العلي', 'B+', 'الدمام', '0550000003', 41, 200], ['ليلى حداد', 'AB+', 'عمّان', '0550000004', 27, null],
  ['محمد السيد', 'O-', 'القاهرة', '0550000005', 38, 95], ['نور الهدى', 'A+', 'بغداد', '0550000006', 24, 30],
  ['خالد البكري', 'B-', 'الكويت', '0550000007', 46, 150], ['مريم الزهراني', 'AB-', 'مكة', '0550000008', 31, null],
  ['عمر الحسن', 'O+', 'دمشق', '0550000009', 52, 60], ['هبة عبدالله', 'A+', 'الخرطوم', '0550000010', 36, 180],
].map((r, i) => ({ id: 's' + i, name: r[0], type: r[1], city: r[2], phone: r[3], age: r[4], last: ago(r[5]) }));
