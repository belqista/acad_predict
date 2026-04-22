# ============================================================================
# ANAK 2 - BACKEND: CURRICULUM
# FILE: backend/utils/curriculum.py
# ============================================================================
# 
# TUJUAN FILE INI:
# Mendefinisikan kurikulum lengkap untuk 4 program studi (TI, AK, TM, AP)
# Setiap prodi punya 6 semester dengan mata kuliah wajib & pilihan
# 
# STRUKTUR FILE:
# 1. Docstring
# 2. Dictionary CURRICULUM (data besar ~1500 baris)
# 3. Helper functions (6 functions)
# 
# ============================================================================
# BAGIAN 1: DOCSTRING (~5 baris)
# ============================================================================
# 
# """
# Curriculum definitions for all 4 prodi across 6 semesters.
# Each course has 1 or 2 SKS, marked as wajib (mandatory) or pilihan (elective).
# Each semester has a pool of 15-18 courses totaling 28-32 SKS.
# """
# 
# ============================================================================
# BAGIAN 2: CURRICULUM DICTIONARY (~1500 baris)
# ============================================================================
# 
# STRUKTUR DICTIONARY:
# 
# CURRICULUM = {
#     "TI": {
#         "name": "Teknologi Informasi",
#         "prodi_code": "024",
#         "semesters": {
#             1: [ list of courses ],
#             2: [ list of courses ],
#             3: [ list of courses ],
#             4: [ list of courses ],
#             5: [ list of courses ],
#             6: [ list of courses ],
#         }
#     },
#     "AK": { ... sama seperti TI ... },
#     "TM": { ... sama seperti TI ... },
#     "AP": { ... sama seperti TI ... },
# }
# 
# FORMAT SETIAP COURSE:
# {"kode": "TI101", "nama": "Logika Pemrograman", "sks": 2, "wajib": True}
# 
# ATURAN PER SEMESTER:
# - Semester 1: 8 wajib (14 SKS) + 10 pilihan (16 SKS) = 18 matkul, 30 SKS
# - Semester 2: 6 wajib (12 SKS) + 10 pilihan (18 SKS) = 16 matkul, 30 SKS
# - Semester 3: 6 wajib (12 SKS) + 12 pilihan (18 SKS) = 18 matkul, 30 SKS
# - Semester 4: 5 wajib (10 SKS) + 25 pilihan (40 SKS) = 30 matkul, 50 SKS
# - Semester 5: 4 wajib (8 SKS) + 13 pilihan (22 SKS) = 17 matkul, 30 SKS
# - Semester 6: 3 wajib (6 SKS) + 11 pilihan (22 SKS) = 14 matkul, 28 SKS
# 
# CONTOH LENGKAP UNTUK TI SEMESTER 1:
# 
# 1: [
#     # Wajib (14 SKS)
#     {"kode": "TI101", "nama": "Logika Pemrograman", "sks": 2, "wajib": True},
#     {"kode": "TI102", "nama": "Algoritma Dasar", "sks": 2, "wajib": True},
#     {"kode": "TI103", "nama": "Matematika Diskrit", "sks": 2, "wajib": True},
#     {"kode": "TI104", "nama": "Pengantar Teknologi Informasi", "sks": 2, "wajib": True},
#     {"kode": "TI105", "nama": "Bahasa Indonesia Akademik", "sks": 1, "wajib": True},
#     {"kode": "TI106", "nama": "Bahasa Inggris I", "sks": 2, "wajib": True},
#     {"kode": "TI107", "nama": "Pendidikan Agama & Moral", "sks": 2, "wajib": True},
#     {"kode": "TI108", "nama": "Kewarganegaraan", "sks": 1, "wajib": True},
#     # Pilihan (16 SKS)
#     {"kode": "TI109", "nama": "Statistika Dasar", "sks": 2, "wajib": False},
#     {"kode": "TI110", "nama": "Kalkulus Dasar", "sks": 2, "wajib": False},
#     ... (8 matkul pilihan lagi)
# ],
# 
# TIPS MEMBUAT DATA:
# 1. Copy struktur dari file asli (lihat file curriculum.py yang ada)
# 2. Pastikan kode matkul unique per prodi (TI101, TI102, AK101, AK102, dll)
# 3. Nama matkul harus relevan dengan prodi
# 4. SKS hanya 1 atau 2
# 5. Semester 6 harus ada "Tugas Akhir", "Kerja Praktik", "Seminar Hasil"
# 
# PRODI CODES:
# - TI: 024
# - AK: 025
# - TM: 026
# - AP: 027
# 
# ============================================================================
# BAGIAN 3: HELPER FUNCTIONS (~80 baris total)
# ============================================================================
# 
# --- FUNCTION 1: get_wajib_courses (~5 baris) ---
# 
# def get_wajib_courses(prodi_key: str, semester: int) -> list:
#     """Get all mandatory courses for a prodi in a semester."""
#     courses = CURRICULUM[prodi_key]["semesters"].get(semester, [])
#     return [c for c in courses if c.get("wajib", False)]
# 
# Tujuan: Filter hanya matkul wajib
# 
# --- FUNCTION 2: get_pilihan_courses (~5 baris) ---
# 
# def get_pilihan_courses(prodi_key: str, semester: int) -> list:
#     """Get all elective courses for a prodi in a semester."""
#     courses = CURRICULUM[prodi_key]["semesters"].get(semester, [])
#     return [c for c in courses if not c.get("wajib", False)]
# 
# Tujuan: Filter hanya matkul pilihan
# 
# --- FUNCTION 3: get_prodi_key (~10 baris) ---
# 
# def get_prodi_key(nim: str) -> str:
#     """Extract prodi key from NIM.
#     NIM format: 24{prodi_code}{seq}
#     Example: 24024001 -> TI (024)
#     """
#     if len(nim) < 5:
#         return "TI"  # default
#     prodi_code = nim[2:5]  # digit 3-5
#     mapping = {"024": "TI", "025": "AK", "026": "TM", "027": "AP"}
#     return mapping.get(prodi_code, "TI")
# 
# Tujuan: Parse prodi dari NIM
# 
# --- FUNCTION 4: get_max_sks_by_ipk (~15 baris) ---
# 
# def get_max_sks_by_ipk(ipk: float, semester: int) -> int:
#     """Determine max SKS allowed based on IPK.
#     
#     Rules:
#     - IPK >= 3.0: max 24 SKS
#     - IPK >= 2.5: max 22 SKS
#     - IPK < 2.5: max 20 SKS
#     - Semester 1: always 24 SKS (no IPK yet)
#     """
#     if semester == 1:
#         return 24
#     if ipk >= 3.0:
#         return 24
#     elif ipk >= 2.5:
#         return 22
#     else:
#         return 20
# 
# Tujuan: Tentukan batas SKS berdasarkan performa
# 
# --- FUNCTION 5: get_completed_courses (~10 baris) ---
# 
# def get_completed_courses(riwayat_semester: list) -> set:
#     """Extract set of completed course codes from riwayat.
#     
#     Args:
#         riwayat_semester: list of semester data with nilai_matkul
#     
#     Returns:
#         set of course codes (e.g., {"TI101", "TI102", ...})
#     """
#     completed = set()
#     for sem in riwayat_semester:
#         for nilai in sem.get("nilai_matkul", []):
#             if nilai.get("nilai_huruf") not in ["E", "D"]:  # Lulus jika bukan E/D
#                 completed.add(nilai["kode"])
#     return completed
# 
# Tujuan: Get set matkul yang sudah lulus
# 
# --- FUNCTION 6: validate_prerequisites (~35 baris) ---
# 
# def validate_prerequisites(kode: str, completed_courses: set) -> tuple[bool, list]:
#     """Check if prerequisites for a course are met.
#     
#     Args:
#         kode: course code (e.g., "TI301")
#         completed_courses: set of completed course codes
#     
#     Returns:
#         (is_valid, missing_prereqs)
#         - is_valid: True if all prereqs met
#         - missing_prereqs: list of missing course codes
#     
#     Prerequisite rules (simplified):
#     - Semester 3+ courses may require semester 1-2 courses
#     - Semester 4+ courses may require semester 2-3 courses
#     - Semester 5+ courses may require semester 3-4 courses
#     - Semester 6 courses may require semester 4-5 courses
#     
#     For simplicity, assume:
#     - No strict prerequisites (return True, [])
#     - Real implementation would have PREREQUISITES dict
#     """
#     # Simplified: no prerequisites
#     return (True, [])
#     
#     # Real implementation would be:
#     # PREREQUISITES = {
#     #     "TI301": ["TI201", "TI202"],  # RPL butuh PBO & Basis Data
#     #     "TI401": ["TI301"],  # dll
#     # }
#     # prereqs = PREREQUISITES.get(kode, [])
#     # missing = [p for p in prereqs if p not in completed_courses]
#     # return (len(missing) == 0, missing)
# 
# Tujuan: Validasi prasyarat matkul (simplified version)
# 
# ============================================================================
# TOTAL ESTIMASI: ~1600 baris
# ============================================================================
# 
# TESTING SETELAH SELESAI:
# 1. Import di Python REPL:
#    from utils.curriculum import CURRICULUM, get_wajib_courses
# 2. Test: get_wajib_courses("TI", 1)
# 3. Cek jumlah: len(CURRICULUM["TI"]["semesters"][1])
# 
# DEPENDENCIES: Tidak ada (standalone)
# 
# ============================================================================
