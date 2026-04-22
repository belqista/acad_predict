# ============================================================================
# ANAK 3 - BACKEND: DATA GENERATOR
# FILE: backend/utils/data_generator.py
# ============================================================================
# 
# TUJUAN FILE INI:
# Generate 100 mahasiswa sintetis dengan data akademik realistis
# 25 mahasiswa per prodi (TI, AK, TM, AP)
# Setiap mahasiswa punya riwayat 3 semester dengan nilai
# 
# STRUKTUR FILE:
# 1. Docstring & imports
# 2. Constants (nama, profiles, grade mapping)
# 3. Helper functions (5 functions)
# 4. Main generator functions (3 functions)
# 5. Main runner
# 
# ============================================================================
# BAGIAN 1: DOCSTRING & IMPORTS (~15 baris)
# ============================================================================
# 
# """
# Generate 100 synthetic student records (25 per prodi).
# semester_aktif = 3 (students have completed semesters 1, 2, 3).
# prediction_target = 4.
# """
# 
# import json
# import random
# import os
# import hashlib
# from .curriculum import CURRICULUM, get_wajib_courses, get_pilihan_courses
# 
# ============================================================================
# BAGIAN 2: CONSTANTS (~200 baris)
# ============================================================================
# 
# --- INDONESIAN_MALE_NAMES (list 100 nama) ---
# 
# INDONESIAN_MALE_NAMES = [
#     "Ahmad Fauzi", "Budi Santoso", "Cahyo Nugroho", ... (100 nama total)
# ]
# 
# Tips: Gunakan nama Indonesia yang umum
# Format: "Nama Depan Nama Belakang"
# 
# --- INDONESIAN_FEMALE_NAMES (list 100 nama) ---
# 
# INDONESIAN_FEMALE_NAMES = [
#     "Ayu Lestari", "Bella Safitri", "Citra Dewi", ... (100 nama total)
# ]
# 
# --- PERFORMANCE_PROFILES (dict 6 profiles) ---
# 
# PERFORMANCE_PROFILES = {
#     "sangat_berprestasi": {
#         "ipk_range": (3.75, 4.00),
#         "grade_weights": {"A": 0.70, "AB": 0.25, "B": 0.05, "BC": 0.0, "C": 0.0, "D": 0.0, "E": 0.0},
#     },
#     "berprestasi": {
#         "ipk_range": (3.50, 3.74),
#         "grade_weights": {"A": 0.40, "AB": 0.40, "B": 0.15, "BC": 0.05, "C": 0.0, "D": 0.0, "E": 0.0},
#     },
#     "baik": {
#         "ipk_range": (3.00, 3.49),
#         "grade_weights": {"A": 0.15, "AB": 0.30, "B": 0.40, "BC": 0.10, "C": 0.05, "D": 0.0, "E": 0.0},
#     },
#     "cukup": {
#         "ipk_range": (2.50, 2.99),
#         "grade_weights": {"A": 0.05, "AB": 0.10, "B": 0.35, "BC": 0.35, "C": 0.15, "D": 0.0, "E": 0.0},
#     },
#     "kurang": {
#         "ipk_range": (2.00, 2.49),
#         "grade_weights": {"A": 0.0, "AB": 0.05, "B": 0.20, "BC": 0.35, "C": 0.30, "D": 0.10, "E": 0.0},
#     },
#     "berisiko": {
#         "ipk_range": (1.50, 1.99),
#         "grade_weights": {"A": 0.0, "AB": 0.0, "B": 0.05, "BC": 0.20, "C": 0.40, "D": 0.25, "E": 0.10},
#     },
# }
# 
# Kenapa perlu profiles?
# - Simulasi distribusi performa realistis
# - Mahasiswa berprestasi dapat A lebih sering
# - Mahasiswa berisiko dapat C/D/E lebih sering
# 
# --- GRADE_TO_ANGKA (dict mapping) ---
# 
# GRADE_TO_ANGKA = {"A": 4.0, "AB": 3.5, "B": 3.0, "BC": 2.5, "C": 2.0, "D": 1.0, "E": 0.0}
# 
# --- PERFORMANCE_DISTRIBUTION (list 25 items) ---
# 
# PERFORMANCE_DISTRIBUTION = (
#     ["sangat_berprestasi"] * 4 +
#     ["berprestasi"] * 6 +
#     ["baik"] * 7 +
#     ["cukup"] * 5 +
#     ["kurang"] * 2 +
#     ["berisiko"] * 1
# )
# 
# Total: 4+6+7+5+2+1 = 25 mahasiswa per prodi
# Distribusi realistis: mayoritas "baik", sedikit "sangat berprestasi" & "berisiko"
# 
# ============================================================================
# BAGIAN 3: HELPER FUNCTIONS
# ============================================================================
# 
# --- FUNCTION 1: seeded_random (~10 baris) ---
# 
# def seeded_random(seed_str: str, salt: str = "") -> random.Random:
#     """Create a seeded Random instance."""
#     h = hashlib.md5(f"{seed_str}{salt}".encode()).hexdigest()
#     seed_val = int(h[:8], 16)
#     return random.Random(seed_val)
# 
# Kenapa perlu seeded random?
# - Hasil konsisten setiap kali generate
# - Mahasiswa dengan NIM sama selalu dapat data sama
# - Reproducible untuk testing
# 
# --- FUNCTION 2: pick_grade (~15 baris) ---
# 
# def pick_grade(rng: random.Random, profile: str) -> str:
#     """Pick a grade letter based on profile weights."""
#     weights = PERFORMANCE_PROFILES[profile]["grade_weights"]
#     grades = list(weights.keys())
#     probs = list(weights.values())
#     r = rng.random()
#     cumulative = 0.0
#     for g, p in zip(grades, probs):
#         cumulative += p
#         if r <= cumulative:
#             return g
#     return grades[-1]
# 
# Algoritma: Cumulative probability distribution
# Contoh: A=0.7, AB=0.25, B=0.05
# - Random 0.0-0.7 → A
# - Random 0.7-0.95 → AB
# - Random 0.95-1.0 → B
# 
# --- FUNCTION 3: select_courses_for_semester (~25 baris) ---
# 
# def select_courses_for_semester(prodi_key: str, semester: int, rng: random.Random, target_sks: int) -> list:
#     """
#     Select courses for a semester:
#     - Always take all wajib courses
#     - Fill electives until reaching target_sks
#     - Shuffle electives with seeded random for variety
#     """
#     wajib = get_wajib_courses(prodi_key, semester)
#     pilihan = get_pilihan_courses(prodi_key, semester)
#     
#     selected = list(wajib)
#     current_sks = sum(c["sks"] for c in selected)
#     
#     # Shuffle electives
#     shuffled_pilihan = list(pilihan)
#     rng.shuffle(shuffled_pilihan)
#     
#     for course in shuffled_pilihan:
#         if current_sks >= target_sks:
#             break
#         selected.append(course)
#         current_sks += course["sks"]
#     
#     return selected
# 
# Logika:
# 1. Ambil semua wajib (pasti diambil)
# 2. Shuffle pilihan (variasi per mahasiswa)
# 3. Tambah pilihan sampai target SKS tercapai
# 
# --- FUNCTION 4: recommended_sks_for_profile (~10 baris) ---
# 
# def recommended_sks_for_profile(profile: str) -> int:
#     """Get recommended SKS based on performance profile."""
#     mapping = {
#         "sangat_berprestasi": 24,
#         "berprestasi": 24,
#         "baik": 23,
#         "cukup": 22,
#         "kurang": 21,
#         "berisiko": 21,
#     }
#     return mapping.get(profile, 22)
# 
# Logika: Mahasiswa berprestasi ambil SKS lebih banyak
# 
# ============================================================================
# BAGIAN 4: MAIN GENERATOR FUNCTIONS
# ============================================================================
# 
# --- FUNCTION 5: generate_student (~80 baris) ---
# 
# def generate_student(nim: str, nama: str, jenis_kelamin: str, prodi_key: str, profile: str) -> dict:
#     """Generate a single student record."""
#     
#     Langkah-langkah:
#     1. Get prodi info dari CURRICULUM
#     2. Initialize riwayat = [], cumulative_sks = 0, cumulative_points = 0.0
#     3. Get target_sks_per_sem dari recommended_sks_for_profile(profile)
#     4. Loop untuk semester 1, 2, 3:
#        a. Buat seeded rng: rng = seeded_random(nim, f"sem_{sem}")
#        b. Select courses: selected_courses = select_courses_for_semester(...)
#        c. Generate nilai untuk setiap course:
#           - Buat grade_rng = seeded_random(nim, f"grade_{sem}_{course['kode']}")
#           - Pick grade: nilai_huruf = pick_grade(grade_rng, profile)
#           - Convert ke angka: nilai_angka = GRADE_TO_ANGKA[nilai_huruf]
#           - Append ke nilai_list: {"kode", "nama", "sks", "nilai_huruf", "nilai_angka"}
#        d. Calculate IPS semester:
#           sem_sks = sum(n["sks"] for n in nilai_list)
#           actual_ips = sum(n["nilai_angka"] * n["sks"] for n in nilai_list) / sem_sks
#           actual_ips = round(actual_ips, 2)
#        e. Update cumulative:
#           cumulative_sks += sem_sks
#           cumulative_points += actual_ips * sem_sks
#        f. Append ke riwayat: {"semester", "ips", "sks", "nilai_matkul"}
#     5. Calculate IPK kumulatif:
#        ipk_kumulatif = round(cumulative_points / cumulative_sks, 2)
#     6. Return dict:
#        {
#            "nim": nim,
#            "nama": nama,
#            "prodi": prodi_name,
#            "prodi_key": prodi_key,
#            "angkatan": 2024,
#            "jenis_kelamin": jenis_kelamin,
#            "semester_aktif": 3,
#            "ipk_kumulatif": ipk_kumulatif,
#            "riwayat_semester": riwayat,
#        }
# 
# --- FUNCTION 6: generate_all_students (~80 baris) ---
# 
# def generate_all_students() -> list:
#     """Generate all 100 students (25 per prodi)."""
#     
#     Langkah-langkah:
#     1. Define prodi_configs = [("TI", "024"), ("AK", "025"), ("TM", "026"), ("AP", "027")]
#     2. Copy nama lists: male_names = INDONESIAN_MALE_NAMES[:], female_names = INDONESIAN_FEMALE_NAMES[:]
#     3. Initialize: students = [], used_names = set()
#     4. Loop untuk setiap prodi:
#        a. Buat rng_prodi = seeded_random(f"prodi_{prodi_code}")
#        b. Copy & shuffle performance distribution:
#           perf_list = PERFORMANCE_DISTRIBUTION[:]
#           rng_prodi.shuffle(perf_list)
#        c. Filter available names (belum dipakai):
#           avail_male = [n for n in male_names if n not in used_names]
#           avail_female = [n for n in female_names if n not in used_names]
#        d. Loop untuk seq 1-25:
#           - Generate NIM: nim = f"24{prodi_code}{seq:03d}"
#             Contoh: 24024001, 24024002, ..., 24024025
#           - Get profile: profile = perf_list[seq - 1]
#           - Buat rng_student = seeded_random(nim)
#           - Random gender: is_male = rng_student.random() < 0.5
#           - Pick nama dari avail_male atau avail_female:
#             * Random index dari list
#             * Remove dari available list
#             * Add ke used_names
#           - Set jenis_kelamin: "L" atau "P"
#           - Generate student: student = generate_student(nim, nama, jenis_kelamin, prodi_key, profile)
#           - Append ke students list
#     5. Return students
# 
# --- FUNCTION 7: save_students_json (~10 baris) ---
# 
# def save_students_json(output_path: str) -> None:
#     """Generate and save students to JSON file."""
#     students = generate_all_students()
#     with open(output_path, "w", encoding="utf-8") as f:
#         json.dump(students, f, ensure_ascii=False, indent=2)
#     print(f"Generated {len(students)} students -> {output_path}")
# 
# ============================================================================
# BAGIAN 5: MAIN RUNNER (~5 baris)
# ============================================================================
# 
# if __name__ == "__main__":
#     base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
#     output = os.path.join(base_dir, "students.json")
#     save_students_json(output)
# 
# Untuk testing: python backend/utils/data_generator.py
# 
# ============================================================================
# TOTAL ESTIMASI: ~450 baris
# ============================================================================
# 
# TESTING SETELAH SELESAI:
# 1. Run: python backend/utils/data_generator.py
# 2. Cek file students.json terbuat
# 3. Cek jumlah: 100 mahasiswa
# 4. Cek struktur: setiap mahasiswa punya riwayat 3 semester
# 
# DEPENDENCIES:
# - Butuh utils/curriculum.py (Anak 2)
# 
# ============================================================================
