# ═══════════════════════════════════════════════════════════════════════════
# FILE: backend/utils/predictor.py
# DEVELOPER: Anak 4 (Backend - Predictor & IPK Target)
# DESKRIPSI: Modul prediksi performa akademik mahasiswa
# ═══════════════════════════════════════════════════════════════════════════

# ─── BAGIAN 1: IMPORT STATEMENTS (~10 baris) ──────────────────────────────
# TODO: Import modul yang diperlukan
# 1. Import 'date' dari module 'datetime' untuk timestamp
# 2. Import semua fungsi dari './curriculum.py':
#    - CURRICULUM, get_prodi_key, get_wajib_courses, get_pilihan_courses
#    - get_max_sks_by_ipk, validate_prerequisites, get_completed_courses


# ─── BAGIAN 2: HELPER FUNCTIONS (~80 baris) ───────────────────────────────

# FUNCTION: get_related_courses_avg(kode: str, riwayat_semester: list, prodi_key: str) -> float
# TODO: Hitung rata-rata nilai dari semua mata kuliah yang sudah diselesaikan
# Parameter:
#   - kode: kode mata kuliah (tidak digunakan dalam implementasi ini, untuk future enhancement)
#   - riwayat_semester: list berisi data semester historis
#   - prodi_key: kode prodi (TI/AK/TM/AP)
# Return: float (rata-rata nilai, atau 0.0 jika tidak ada data)
# 
# Algoritma:
# 1. Buat list kosong 'all_grades'
# 2. Loop setiap semester dalam riwayat_semester:
#    a. Ambil 'nilai_matkul' dari semester
#    b. Loop setiap nilai dalam nilai_matkul:
#       - Ambil 'nilai_angka'
#       - Jika nilai_angka tidak None, tambahkan ke all_grades
# 3. Return: sum(all_grades) / len(all_grades) jika ada data, else 0.0


# FUNCTION: get_cohort_average(prodi_key: str, angkatan: int) -> float
# TODO: Hitung rata-rata IPK cohort berdasarkan prodi
# Parameter:
#   - prodi_key: kode prodi (TI/AK/TM/AP)
#   - angkatan: tahun angkatan (tidak digunakan dalam implementasi ini)
# Return: float (rata-rata cohort)
#
# Algoritma:
# 1. Buat dictionary 'cohort_defaults' dengan key prodi dan value rata-rata:
#    - TI: 3.15
#    - AK: 3.20
#    - TM: 3.10
#    - AP: 3.18
# 2. Return: cohort_defaults.get(prodi_key, 3.15)


# FUNCTION: predict_course_grade(...) -> dict
# TODO: Prediksi nilai untuk satu mata kuliah
# Parameter:
#   - kode: kode mata kuliah
#   - wajib: boolean (True jika wajib)
#   - historical_ipk: IPK historis mahasiswa
#   - related_courses_avg: rata-rata nilai mata kuliah terkait
#   - cohort_avg: rata-rata cohort
#   - trend: tren performa (positif/negatif)
# Return: dict dengan keys: kode, prediksi_nilai_angka, prediksi_nilai_huruf, confidence
#
# Algoritma:
# 1. Hitung base prediction:
#    - Jika related_courses_avg > 0: base = (historical_ipk * 0.6) + (related_courses_avg * 0.4)
#    - Else: base = historical_ipk
# 2. Adjust dengan cohort average (hanya jika mahasiswa di bawah rata-rata):
#    - Jika historical_ipk < cohort_avg: base = base * 0.85 + cohort_avg * 0.15
# 3. Adjust dengan trend:
#    - trend_adjustment = max(-0.5, min(0.5, trend * 0.2))
#    - raw = base + trend_adjustment
#    - raw = max(0.0, min(4.0, raw))
# 4. Round ke grade point terdekat:
#    - grade_points = [4.0, 3.5, 3.0, 2.5, 2.0, 1.0, 0.0]
#    - grade_letters = ["A", "AB", "B", "BC", "C", "D", "E"]
#    - Cari grade point terdekat dengan raw
#    - Ambil letter grade yang sesuai
# 5. Hitung confidence (70-95%):
#    - Base: 70
#    - +10 jika related_courses_avg > 0
#    - +10 jika abs(trend) < 0.3
#    - +5 jika historical_ipk >= 3.0
#    - Max 95
# 6. Return dict dengan kode, prediksi_nilai_angka (rounded 2 decimal), prediksi_nilai_huruf, confidence


# ─── BAGIAN 3: SKS SCENARIO BUILDER (~70 baris) ───────────────────────────

# FUNCTION: build_sks_scenario(...) -> dict
# TODO: Bangun skenario SKS dengan memilih mata kuliah optimal
# Parameter:
#   - nim, prodi_key, semester_target: identitas mahasiswa
#   - all_courses_predicted: list semua mata kuliah dengan prediksi
#   - target_sks: target SKS yang ingin dicapai
#   - current_ipk: IPK saat ini
#   - cumulative_sks_so_far: total SKS yang sudah lulus
# Return: dict dengan keys: sks, prediksi_ips, prediksi_ipk, matkul_count, matkul
#
# Algoritma:
# 1. Pisahkan mata kuliah wajib dan pilihan:
#    - wajib_courses = [c for c in all_courses_predicted if c["wajib"]]
#    - pilihan_courses = [c for c in all_courses_predicted if not c["wajib"]]
# 2. Mulai dengan semua mata kuliah wajib:
#    - selected = list(wajib_courses)
#    - current_sks = sum(c["sks"] for c in selected)
# 3. Jika current_sks >= target_sks, return selected saja
# 4. Else, tambahkan mata kuliah pilihan:
#    a. Sort pilihan by prediksi_nilai_angka descending
#    b. Loop selama current_sks < target_sks dan masih ada pilihan:
#       - needed = target_sks - current_sks
#       - Cari mata kuliah yang pas (sks == needed)
#       - Jika tidak ada, cari yang <= needed
#       - Jika tidak ada, ambil yang terbaik (akan overshoot)
#       - Tambahkan ke selected, update current_sks
# 5. Hitung prediksi IPS:
#    - actual_sks = sum(c["sks"] for c in selected_courses)
#    - pred_ips = sum(c["prediksi_nilai_angka"] * c["sks"]) / actual_sks
#    - Round 2 decimal
# 6. Hitung prediksi IPK baru:
#    - total_sks = cumulative_sks_so_far + actual_sks
#    - pred_ipk = (cumulative_sks_so_far * current_ipk + pred_ips * actual_sks) / total_sks
#    - Round 2 decimal, clamp 0-4
# 7. Return dict dengan sks, prediksi_ips, prediksi_ipk, matkul_count, matkul (list detail)


# ─── BAGIAN 4: MAIN PREDICTION FUNCTION (~200 baris) ──────────────────────

# FUNCTION: predict_student(student: dict) -> dict
# TODO: Generate prediksi lengkap untuk satu mahasiswa
# Parameter:
#   - student: dict berisi data mahasiswa lengkap
# Return: dict berisi prediksi lengkap
#
# Algoritma:
# 1. Extract data mahasiswa:
#    - nim, prodi_key, riwayat_semester, semester_aktif
#    - semester_target = semester_aktif (prediksi untuk semester yang sedang berjalan)
# 2. Filter riwayat yang sudah selesai (semester < semester_aktif):
#    - riwayat_selesai = [s for s in riwayat if s["semester"] < semester_aktif]
# 3. Extract IPS history:
#    - ips_by_sem = {entry["semester"]: entry["ips"] for entry in riwayat_selesai}
#    - sks_by_sem = {entry["semester"]: entry["sks"] for entry in riwayat_selesai}
#    - ips_list = [ips_by_sem.get(s, 0.0) for s in sorted(ips_by_sem.keys())]
# 4. Hitung weighted average dan trend:
#    - Jika len(ips_list) >= 3:
#      * ips1, ips2, ips3 = ips_list[-3], ips_list[-2], ips_list[-1]
#      * weighted_avg = ips3 * 0.5 + ips2 * 0.3 + ips1 * 0.2
#      * trend = ips3 - ips2
#    - Jika len(ips_list) == 2:
#      * ips2, ips3 = ips_list[-2], ips_list[-1]
#      * weighted_avg = ips3 * 0.6 + ips2 * 0.4
#      * trend = ips3 - ips2
#    - Jika len(ips_list) == 1:
#      * weighted_avg = ips_list[0]
#      * trend = 0.0
#    - Else:
#      * weighted_avg = 2.5
#      * trend = 0.0
# 5. Hitung predicted IPS fallback:
#    - predicted_ips_fallback = weighted_avg + (trend * 0.15)
#    - Clamp 0-4, round 2 decimal
# 6. Hitung cumulative SKS:
#    - cumulative_sks = sum(sks_by_sem.get(s, 0) for s in range(1, semester_aktif))
# 7. Get current IPK dan rekomendasi SKS:
#    - current_ipk = student["ipk_kumulatif"]
#    - rekomendasi_sks = get_max_sks_by_ipk(current_ipk, semester_aktif)
# 8. Hitung overall confidence (60-95%):
#    - Base: 70
#    - +20 jika trend stable (abs(ips[-1] - ips[-2]) < 0.5)
#    - +5 jika len(ips_list) >= 3
#    - Clamp 60-95, round 1 decimal
# 9. Tentukan trend label:
#    - "meningkat" jika trend > 0.1
#    - "menurun" jika trend < -0.1
#    - "stabil" otherwise
# 10. Get mata kuliah semester target:
#     - target_semester_courses = CURRICULUM[prodi_key]["semesters"].get(semester_target, [])
# 11. Get completed courses dan cohort average:
#     - completed_courses = get_completed_courses(riwayat)
#     - cohort_avg = get_cohort_average(prodi_key, student.get("angkatan", 2024))
# 12. Prediksi nilai untuk setiap mata kuliah:
#     - all_courses_predicted = []
#     - Loop setiap course in target_semester_courses:
#       a. Validate prerequisites
#       b. Get related courses average
#       c. Call predict_course_grade()
#       d. Build course_data dict dengan semua info
#       e. Tambahkan ke all_courses_predicted
# 13. Filter eligible courses (prasyarat terpenuhi):
#     - eligible_courses = [c for c if prasyarat_terpenuhi]
#     - ineligible_courses = [c for c if not prasyarat_terpenuhi]
# 14. Sort eligible courses (wajib first, then by grade desc):
#     - wajib_pred = sorted([c for c if wajib], key=lambda c: c["prediksi_nilai_angka"], reverse=True)
#     - pilihan_pred = sorted([c for c if not wajib], key=lambda c: c["prediksi_nilai_angka"], reverse=True)
#     - all_sorted = wajib_pred + pilihan_pred
# 15. Build SKS scenarios (18, 20, 22, 24):
#     - sks_scenarios = []
#     - Loop target_sks in [18, 20, 22, 24]:
#       * max_allowed = get_max_sks_by_ipk(current_ipk, semester_aktif)
#       * Jika target_sks <= max_allowed:
#         - scenario = build_sks_scenario(...)
#         - Append ke sks_scenarios
# 16. Get recommended scenario:
#     - rec_scenario = scenario dengan sks == rekomendasi_sks (atau terakhir jika tidak ada)
#     - matakuliah_direkomendasikan = rec_scenario["matkul"]
#     - rec_sks = rec_scenario["sks"]
#     - predicted_ips = rec_scenario["prediksi_ips"]
# 17. Hitung predicted IPK:
#     - predicted_ipk = (cumulative_sks * current_ipk + predicted_ips * rec_sks) / (cumulative_sks + rec_sks)
#     - Clamp 0-4, round 2 decimal
# 18. Generate catatan akademik:
#     - catatan = generate_catatan(current_ipk, trend_label, predicted_ips, predicted_ipk, semester_target)
# 19. Return dict lengkap dengan semua data prediksi


# ─── BAGIAN 5: CATATAN AKADEMIK GENERATOR (~60 baris) ─────────────────────

# FUNCTION: generate_catatan(ipk, trend, pred_ips, pred_ipk, semester_target) -> str
# TODO: Generate catatan akademik berdasarkan performa
# Parameter:
#   - ipk: IPK saat ini
#   - trend: label trend ("meningkat", "menurun", "stabil")
#   - pred_ips: prediksi IPS semester target
#   - pred_ipk: prediksi IPK baru
#   - semester_target: semester yang diprediksi
# Return: string catatan akademik
#
# Algoritma:
# 1. Buat list kosong 'lines'
# 2. Tambahkan kalimat berdasarkan IPK:
#    - >= 3.5: "Mahasiswa menunjukkan performa akademik yang sangat baik..."
#    - >= 3.0: "Mahasiswa memiliki performa akademik yang baik..."
#    - >= 2.5: "Mahasiswa memiliki performa akademik yang cukup. Diperlukan peningkatan."
#    - < 2.5: "Mahasiswa perlu perhatian khusus... Sangat disarankan konsultasi..."
# 3. Tambahkan kalimat berdasarkan trend:
#    - "meningkat": "Tren akademik menunjukkan peningkatan yang positif..."
#    - "menurun": "Tren akademik menunjukkan penurunan. Perlu evaluasi..."
#    - "stabil": "Tren akademik relatif stabil."
# 4. Tambahkan prediksi:
#    - "Prediksi IPS semester {semester_target}: {pred_ips:.2f}, dengan prediksi IPK baru: {pred_ipk:.2f}."
# 5. Tambahkan penjelasan tentang IPK:
#    - Jika pred_ipk <= ipk:
#      * "Catatan: IPK kumulatif sulit naik signifikan di semester lanjut..."
#    - Else:
#      * "Dengan IPS prediksi {pred_ips:.2f}, IPK diperkirakan dapat meningkat..."
# 6. Tambahkan penutup:
#    - "Untuk klarifikasi atau penyempurnaan lebih lanjut, silakan diskusi."
# 7. Return: " ".join(lines)


# ═══════════════════════════════════════════════════════════════════════════
# CATATAN PENTING UNTUK DEVELOPER:
# ═══════════════════════════════════════════════════════════════════════════
# 1. File ini adalah CORE PREDICTION ENGINE - sangat penting untuk akurasi
# 2. Formula prediksi menggunakan weighted average (Sem3: 50%, Sem2: 30%, Sem1: 20%)
# 3. Confidence level dihitung berdasarkan kualitas data historis
# 4. SKS scenarios memberikan simulasi "what-if" untuk berbagai beban SKS
# 5. Algoritma selalu prioritaskan mata kuliah wajib, baru pilihan
# 6. Prediksi nilai per mata kuliah menggunakan kombinasi IPK historis dan related courses
# 7. Cohort average hanya berpengaruh jika mahasiswa di bawah rata-rata
# 8. Trend adjustment memberikan dampak kecil tapi signifikan pada prediksi
# 9. Semua nilai di-clamp ke range 0-4 untuk keamanan
# 10. Testing: Pastikan prediksi masuk akal untuk berbagai profil mahasiswa
#
# TESTING CHECKLIST:
# □ Test dengan mahasiswa IPK tinggi (>= 3.5)
# □ Test dengan mahasiswa IPK sedang (2.5-3.5)
# □ Test dengan mahasiswa IPK rendah (< 2.5)
# □ Test dengan trend meningkat
# □ Test dengan trend menurun
# □ Test dengan trend stabil
# □ Test SKS scenarios (18, 20, 22, 24)
# □ Test prerequisite validation
# □ Test dengan data semester minimal (1-2 semester)
# □ Test dengan data semester lengkap (3+ semester)
# ═══════════════════════════════════════════════════════════════════════════
