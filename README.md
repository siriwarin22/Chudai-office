# Chudai Office

ออฟฟิศพิกเซลสไตล์ Stardew Valley ที่รวมระบบจัดการออฟฟิศไว้ในเกม: งาน โปรเจกต์ ปฏิทิน แชท ห้องเสียง ประชุม ส่งงาน/อนุมัติ ติดตามงาน พนักงาน ไฟล์ ประกาศ รายงาน และบูธดีเจ

## เปิดใช้งาน
เว็บนี้เป็นไฟล์ HTML/JS ล้วน ไม่ต้อง build

- เปิดผ่าน GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `(root)`
- หรือเปิดในเครื่อง: `npx serve .` แล้วเข้า `http://localhost:3000`

## ไฟล์
| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | โครงหน้าและสไตล์ |
| `data.js` | ข้อมูลเริ่มต้นของออฟฟิศ (แผนก ช่องแชท นโยบาย) |
| `core.js` | สถานะ, การแจ้งเตือน, สถานะออนไลน์/DND/Focus, เวิร์กโฟลว์งาน, ระบบติดตามงานอัตโนมัติ |
| `i18n.js` | ภาษาไทย/อังกฤษ |
| `pixel.js` | แผนที่ออฟฟิศพิกเซล ตัวละคร ห้องแต่งตัว โต๊ะ ไมค์ |
| `dj.js` | บูธดีเจ (คิวลิงก์ YouTube) |
| `views.js` | หน้าต่างของแต่ละโมดูล |
| `onboard.js` | ขั้นตอนสร้างตัวละคร |
| `actions.js` | ปุ่ม ฟอร์ม และการเริ่มต้นแอป |
| `sync.js` | เชื่อม Supabase: ข้อมูลรวมทั้งทีม + เห็นกันเดินแบบสด |

## ระบบเรียลไทม์ (Supabase)
- ข้อมูลทุกอย่าง (ตัวละคร งาน แชท ประชุม โต๊ะ คิวเพลง ฯลฯ) เก็บเป็นแถวในตาราง `office_docs` และอัปเดตสดผ่าน Realtime
- ตำแหน่งตัวละคร สถานะ ไมค์ บับเบิลข้อความ และบูธดีเจ ส่งผ่าน Realtime channel `office-floor`
- ตั้งค่า URL และ publishable key ไว้ด้านบนของ `sync.js`
- ถ้าเชื่อมต่อไม่ได้ แอปยังใช้งานได้ในเครื่อง (จุดสีมุมขวาบน: เขียว = เชื่อมต่อแล้ว, แดง = ไม่ได้เชื่อมต่อ)

ตาราง (รันใน SQL Editor ของ Supabase):
```sql
create table public.office_docs (
  collection text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);
alter table public.office_docs enable row level security;
create policy "office read"   on public.office_docs for select using (true);
create policy "office insert" on public.office_docs for insert with check (true);
create policy "office update" on public.office_docs for update using (true);
create policy "office delete" on public.office_docs for delete using (true);
alter publication supabase_realtime add table public.office_docs;
grant select, insert, update, delete on public.office_docs to anon, authenticated;
```

> ไม่มีระบบล็อกอิน: ใครมีลิงก์ก็เข้าและแก้ข้อมูลได้ อย่าใส่ข้อมูลลับ
