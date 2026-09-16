# GitHub Portfolio

Static developer portfolio built with React, TypeScript, Vite, Tailwind CSS and Lucide. ไม่มี backend, database หรือ access token และไม่มีข้อมูลผลงานจำลองใน production

## Requirements / เริ่มใช้งาน

Node.js 24 LTS และ npm พร้อม Git สำหรับอัปโหลด source

```sh
npm install
npm run dev
```

เปิด URL ที่ Vite แสดงใน terminal

## ตั้งค่าข้อมูลส่วนตัว

แก้ **`src/config/portfolio.ts` เพียงไฟล์เดียว**:

- `githubUsername`: เปลี่ยน `YOUR_GITHUB_USERNAME` เป็น GitHub username จริง เป็นจุดเดียวที่ต้องเปลี่ยน username
- `name`, `bio`, `avatar`: เว้นว่างเพื่อใช้ข้อมูลจริงจาก GitHub หรือกำหนดเอง (avatar ใช้ URL https)
- `role`, `about`, `skills`: ตำแหน่ง แนะนำตัว และทักษะ
- `githubUrl`: เว้นว่างเพื่อสร้างจาก username
- `email`, `linkedinUrl`: เว้นว่างเพื่อซ่อนช่องทางนั้น
- `pinnedRepos`, `hiddenRepos`: ชื่อ repository แบบตรงตัว เช่น `['my-app']` โดย repository ที่ซ่อนมีลำดับความสำคัญเหนือการปักหมุด
- `showForks`, `showArchived`: ค่าเริ่มต้น false
- `accentColor`: สีหลักรูปแบบ `#RRGGBB`; เลือกสีเข้มที่อ่านตัวอักษรสีขาวได้ชัดเจน
- `canonicalUrl`: URL เว็บจริงรวม path และ slash ท้าย เช่น `https://USERNAME.github.io/REPOSITORY/`; ถ้าเว้นว่าง Actions จะตรวจจับ URL ให้
- `cacheMinutes`: อายุ cache ใหม่ ค่าเริ่มต้น 15 นาที; cache เก่าจะแสดงพร้อมคำเตือนเมื่อเชื่อมต่อ GitHub ไม่สำเร็จ

ก่อนตั้ง username หน้าเว็บแสดงสถานะพร้อมเชื่อมต่อ ไม่เรียก API ด้วย placeholder และไม่สร้างตัวเลขสถิติปลอม ทุกการแก้ config ต้อง build ใหม่

## คำสั่งตรวจสอบและ build

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
npm run format
```

Browser tests (desktop/mobile, theme persistence, API error, rate limit, Retry และ empty search):

```sh
npx playwright install chromium
npm run test:e2e
```

Production อยู่ใน `dist/` ไม่ต้องใช้ Node.js บน hosting ใช้ anchor navigation จึงไม่มี client-router refresh 404

## GitHub Pages: ตั้งแต่สร้าง repository จน deploy

สร้าง **public repository ว่าง** บน GitHub โดยไม่เพิ่ม README จากหน้าเว็บ แล้วรันในโฟลเดอร์นี้ (แทน USERNAME และ REPOSITORY ด้วยค่าจริง):

```sh
git init
git add .
git commit -m "Create GitHub portfolio"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

เข้า **Settings → Pages → Build and deployment → Source → GitHub Actions** แล้วเข้า **Actions → Deploy portfolio to GitHub Pages → Run workflow** หาก push แรกเกิดก่อนเปิด Pages หลังจากนั้นทุก push ไป `main` จะตรวจ lint/test/typecheck, build และ deploy ให้อัตโนมัติ ดู URL จริงใน deployment ของ job `deploy`

รองรับทั้ง `https://USERNAME.github.io/REPOSITORY/` และ repository `USERNAME.github.io` รวมถึง Pages custom domain โดยอ่าน path/URL จาก `actions/configure-pages` ไม่ฝังชื่อ repository ใน source หากใช้ default branch อื่นให้แก้ `branches` ใน workflow ให้ตรงกัน

แก้ไขครั้งถัดไป:

```sh
git add .
git commit -m "Update portfolio"
git push
```

ทดสอบ project path ด้วย PowerShell:

```powershell
$env:GITHUB_REPOSITORY = 'example/portfolio'
npm run build
npm run preview
# เปิด http://127.0.0.1:4173/portfolio/
Remove-Item Env:GITHUB_REPOSITORY
```

## API / ความทนทาน

ตั้งค่าบัญชีเป็น `looknamx` แล้ว และนำเข้าข้อมูล Public Repository จริง 13 รายการผ่านตัวเชื่อมต่อ GitHub ลง `src/data/github-snapshot.json` เพื่อให้แสดงผลงานได้ทันทีเมื่อ Public API เชื่อมต่อไม่ได้ Snapshot ใช้เฉพาะเมื่อ username ตรงกัน และเว็บยังเรียก API เพื่ออัปเดตข้อมูลทุกครั้งที่ cache หมดอายุ ค่าผู้ติดตามที่ยังดึงไม่ได้แสดงเป็น — โดยไม่สร้างตัวเลขขึ้นมา เมื่อ API ล้มเหลวจะแจ้งวันที่นำเข้าข้อมูล การเชื่อมต่อมี timeout 12 วินาที

ใช้ `GET /users/{username}` และ `GET /users/{username}/repos?per_page=100&sort=updated&page=N` จนหมดทุกหน้า Public API แบบไม่ยืนยันตัวตนมี primary rate limit โดยทั่วไป **60 requests ต่อชั่วโมงต่อ IP** และอาจมี secondary limits เพิ่มเติม เครื่องในเครือข่ายเดียวกันอาจแชร์ quota กัน การโหลดใช้ 1 profile request บวกจำนวนหน้าของ repositories (และอีกหนึ่งหน้าว่างเมื่อจำนวนหาร 100 ลงตัว)

แสดง HTTP error, account not found, reset time จาก `x-ratelimit-reset` หรือ `retry-after`, ปุ่ม Retry, skeleton, empty state และ cache fallback เมื่อ API ล้มเหลว localStorage ถูกปิดหรือเต็มจะไม่ทำให้หน้าเว็บพัง ไม่เก็บ token ใด ๆ และไม่ควรใส่ secret ใน config หรือ Vite environment เพราะ frontend เป็นข้อมูลสาธารณะ

SEO ถูกสร้างลง HTML ตอน build รวม title, description, Open Graph, Twitter Card, canonical และ JSON-LD (Person เมื่อกำหนดชื่อ) สร้าง robots.txt และ sitemap.xml ลง dist เมื่อ build ท้องถิ่นโดยไม่มี canonical/Actions URL จะไม่ใส่ URL สมมติลง sitemap; avatar แบบ absolute URL จะถูกใช้เป็น social image ถ้าต้องการชื่อจริงใน metadata ให้กำหนด `name` เนื่องจาก build ไม่เรียก GitHub API

เอกสารอ้างอิง: [Vite Pages deployment](https://vite.dev/guide/static-deploy#github-pages), [GitHub REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api), [Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## โครงสร้างไฟล์

```text
.github/workflows/deploy.yml
.gitignore
.prettierignore
.prettierrc.json
README.md
eslint.config.js
index.html
package.json
package-lock.json
playwright.config.ts
tests/portfolio.spec.ts
tsconfig.json
vite.config.ts
public/favicon.svg
src/
  App.tsx
  main.tsx
  styles.css
  components/
    ErrorBoundary.tsx
    ProjectCard.tsx
    Projects.tsx
  config/portfolio.ts
  data/github-snapshot.json
  hooks/
    useGitHub.ts
    useTheme.ts
  services/
    github.ts
    github.test.ts
  types/github.ts
  utilities/
    projects.ts
    projects.test.ts
```

Unit tests ใช้ fixtures เฉพาะใน `.test.ts` ซึ่งไม่ถูก import ใน production ครอบคลุม search, filters, sorting, pagination, HTTP failures, rate limit และ cache
