# 📝 Notes App — Tugas 3 Praktikum TCC

Aplikasi catatan (notes) berbasis web dengan arsitektur:
- **Backend**: Node.js + Express + Sequelize + MySQL → di-deploy ke **Google Cloud Run**
- **Frontend**: Vue 3 + Vite + Tailwind CSS → di-deploy ke **Google App Engine**

---

## 📁 Struktur Proyek

```
Tugas3-PrakTCC-main/
├── backend/                  # REST API (Node.js)
│   ├── config/database.js    # Koneksi ke MySQL via Sequelize
│   ├── controllers/          # Logic CRUD notes
│   ├── models/               # Query database
│   ├── routes/               # Endpoint API
│   ├── schema/               # Definisi tabel Note
│   ├── Dockerfile            # Config Docker untuk Cloud Run
│   ├── docker-compose.yml    # MySQL lokal untuk development
│   └── index.js              # Entry point server
│
└── notes-frontend/           # UI Vue 3
    ├── src/
    │   ├── App.vue            # Komponen utama
    │   ├── services/api.js    # Konfigurasi axios ke backend
    │   └── main.js
    ├── app.yaml               # Config deploy ke App Engine
    └── vite.config.js
```

---

## ⚙️ Prasyarat

Pastikan sudah terinstall:

| Tool | Versi | Cek dengan |
|---|---|---|
| Node.js | ≥ 20 | `node -v` |
| npm | ≥ 9 | `npm -v` |
| Docker | terbaru | `docker -v` |
| Google Cloud SDK | terbaru | `gcloud -v` |
| Akun GCP | aktif + billing | — |

---

## 🖥️ Menjalankan Secara Lokal

### 1. Clone & masuk ke proyek

```bash
git clone <url-repo>
cd Tugas3-PrakTCC-main
```

### 2. Jalankan database MySQL (via Docker)

```bash
cd backend
docker compose up -d
```

Ini akan menjalankan MySQL di port `3306` dengan:
- Database: `notes_db`
- Password root: `rootpassword`

### 3. Setup environment backend

Buat file `.env` di folder `backend/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=notes_db
PORT=8080
```

### 4. Jalankan backend

```bash
cd backend
npm install
node index.js
```

Backend berjalan di: `http://localhost:8080`

> Tabel `Notes` akan otomatis dibuat oleh Sequelize saat pertama kali server jalan.

### 5. Setup dan jalankan frontend

```bash
cd notes-frontend
npm install
```

Buat file `.env` di folder `notes-frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Lalu jalankan:

```bash
npm run dev
```

Frontend berjalan di: `http://localhost:5173`

---

## ☁️ Deploy ke Google Cloud

### A. Deploy Backend ke Cloud Run

#### 1. Login dan set project GCP

```bash
gcloud auth login
gcloud config set project <PROJECT_ID>
```

#### 2. Aktifkan layanan yang diperlukan

```bash
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

#### 3. Buat database MySQL di Cloud SQL

```bash
gcloud sql instances create notes-db-instance \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=asia-southeast2

gcloud sql databases create notes_db \
  --instance=notes-db-instance

gcloud sql users set-password root \
  --host=% \
  --instance=notes-db-instance \
  --password=<PASSWORD_KAMU>
```

#### 4. Build dan push Docker image

```bash
cd backend

# Build image
docker build -t gcr.io/<PROJECT_ID>/notes-backend .

# Push ke Google Container Registry
docker push gcr.io/<PROJECT_ID>/notes-backend
```

#### 5. Deploy ke Cloud Run

```bash
gcloud run deploy notes-backend \
  --image gcr.io/<PROJECT_ID>/notes-backend \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars DB_HOST=<IP_CLOUD_SQL>,DB_USER=root,DB_PASSWORD=<PASSWORD>,DB_NAME=notes_db \
  --port 8080
```

Setelah deploy, catat URL backend yang diberikan, contoh:
```
https://notes-backend-xxxxxxxx-et.a.run.app
```

---

### B. Deploy Frontend ke App Engine

#### 1. Update URL backend

Di file `notes-frontend/.env.production` (buat jika belum ada):

```env
VITE_API_BASE_URL=https://notes-backend-xxxxxxxx-et.a.run.app/api/v1
```

Ganti URL di atas dengan URL Cloud Run yang didapat tadi.

#### 2. Build frontend

```bash
cd notes-frontend
npm run build
```

Hasil build ada di folder `dist/`.

#### 3. Deploy ke App Engine

```bash
gcloud app deploy
```

Ketika ditanya region, pilih `asia-southeast2` (Jakarta) atau sesuai preferensi.

Setelah selesai, frontend dapat diakses di:
```
https://<PROJECT_ID>.et.r.appspot.com
```

---

## 🔌 API Endpoints

Base URL: `https://<URL_BACKEND>/api/v1`

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/notes` | Ambil semua catatan |
| GET | `/notes/:id` | Ambil catatan berdasarkan ID |
| POST | `/notes` | Buat catatan baru |
| PUT | `/notes/:id` | Update catatan |
| DELETE | `/notes/:id` | Hapus catatan |

### Contoh Request Body (POST / PUT)

```json
{
  "judul": "Judul Catatan",
  "isi": "Isi catatan di sini..."
}
```

### Contoh Response Sukses

```json
{
  "message": "Notes created successfully",
  "data": {
    "id": 1,
    "judul": "Judul Catatan",
    "isi": "Isi catatan di sini..."
  }
}
```

---

## 🗄️ Skema Database

**Tabel: `Notes`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | INT | Primary key, auto increment |
| `judul` | VARCHAR | Judul catatan, wajib diisi |
| `isi` | VARCHAR | Isi catatan, wajib diisi |
| `created_at` | DATETIME | Waktu dibuat (otomatis) |
| `updated_at` | DATETIME | Waktu diupdate (otomatis) |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Vue 3, Vite, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| ORM | Sequelize |
| Database | MySQL 8 |
| Containerisasi | Docker |
| Cloud Backend | Google Cloud Run |
| Cloud Frontend | Google App Engine (Standard) |
| Cloud Database | Google Cloud SQL |

---


