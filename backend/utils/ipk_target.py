# ═══════════════════════════════════════════════════════════════════════════
# FILE: backend/utils/ipk_target.py
# DEVELOPER: Anak 4 (Backend - Predictor & IPK Target)
# DESKRIPSI: Analisis Target IPK dengan panduan personal
# ═══════════════════════════════════════════════════════════════════════════

# ─── BAGIAN 1: IMPORT & CONSTANTS (~5 baris) ──────────────────────────────
# TODO: Import modul yang diperlukan
# 1. Import 'ceil' dari module 'math'
# 2. Define constants:
#    - TOTAL_SEMESTER = 6
#    - SKS_PER_SEMESTER = 22


# ─── BAGIAN 2: HELPER FUNCTIONS (~80 baris) ───────────────────────────────

# FUNCTION: _ips_minimum(target_ipk, current_ipk, sks_lulus, sisa_semester) -> float
# TODO: Hitung IPS minimum yang harus dicapai tiap semester
# Parameter:
#   - target_ipk: target IPK yang ingin dicapai
#   - current_ipk: IPK saat ini
#   - sks_lulus: total SKS yang sudah lulus
#   - sisa_semester: jumlah semester tersisa
# Return: float (IPS minimum per semester)
#
# Algoritma:
# 1. sks_sisa = sisa_semester * SKS_PER_SEMESTER
# 2. total_sks = sks_lulus + sks_sisa
# 3. ips_min = (target_ipk * total_sks - current_ipk * sks_lulus) / sks_sisa
#    (jika sks_sisa > 0, else 0.0)
# 4. Return: round(max(0.0, min(4.0, ips_min)), 2)


# FUNCTION: _proyeksi_ipk(current_ipk, sks_lulus, ips_per_sem, sisa_semester) -> list
# TODO: Proyeksi IPK per semester ke depan
# Parameter:
#   - current_ipk: IPK saat ini
#   - sks_lulus: total SKS yang sudah lulus
#   - ips_per_sem: IPS yang diasumsikan per semester
#   - sisa_semester: jumlah semester tersisa
# Return: list of dict dengan keys: semester_ke, ipk_proyeksi
#
# Algoritma:
# 1. Buat list kosong 'rows'
# 2. ipk = current_ipk, sks = sks_lulus
# 3. Loop i dari 1 sampai sisa_semester:
#    a. sks += SKS_PER_SEMESTER
#    b. ipk = round((ipk * (sks - SKS_PER_SEMESTER) + ips_per_sem * SKS_PER_SEMESTER) / sks, 2)
#    c. Append {"semester_ke": i, "ipk_proyeksi": ipk} ke rows
# 4. Return rows


# FUNCTION: _validasi_target(target_ipk, current_ipk, pred_ipk, sisa_semester) -> dict
# TODO: Validasi apakah target IPK realistis
# Parameter:
#   - target_ipk: target IPK yang ingin dicapai
#   - current_ipk: IPK saat ini
#   - pred_ipk: IPK prediksi
#   - sisa_semester: jumlah semester tersisa
# Return: dict dengan keys: status, label, pesan
#
# Algoritma:
# 1. Jika target_ipk > 4.0:
#    - Return {"status": "tidak_valid", "label": "Tidak Valid", "pesan": "Target IPK tidak boleh melebihi 4.00."}
# 2. Hitung ips_min = _ips_minimum(target_ipk, current_ipk, 0, sisa_semester)
# 3. Jika ips_min > 4.0:
#    - Return {"status": "tidak_mungkin", "label": "Tidak Mungkin", "pesan": "Target ... tidak dapat dicapai..."}
# 4. gap = target_ipk - current_ipk
# 5. Jika gap <= 0.05:
#    - Return {"status": "realistis", "label": "Realistis ✓", "pesan": "Target sudah sesuai..."}
# 6. Jika ips_min <= 3.5 dan sisa_semester >= 2:
#    - Return {"status": "realistis", "label": "Realistis ✓", "pesan": "Target dapat dicapai..."}
# 7. Jika ips_min <= 4.0 dan sisa_semester >= 1:
#    - Return {"status": "ambisius", "label": "Ambisius ⚡", "pesan": "Target ambisius..."}
# 8. Else:
#    - Return {"status": "tidak_mungkin", "label": "Tidak Mungkin ✗", "pesan": "Target terlalu tinggi..."}


# ─── BAGIAN 3: PANDUAN PERSONAL GENERATOR (~150 baris) ────────────────────

# FUNCTION: _panduan_personal(...) -> str
# TODO: Generate panduan personal berdasarkan profil mahasiswa
# Parameter:
#   - target_ipk, current_ipk, validasi_status: target dan status validasi
#   - kebiasaan, gaya: kebiasaan dan gaya belajar
#   - matkul_tersulit: list mata kuliah tersulit
#   - sisa_semester, ips_min, pred_ipk: data matematis
# Return: string panduan personal
#
# Algoritma:
# 1. Buat mapping nama gaya dan kebiasaan:
#    - nama_gaya = {"visual": "visual (diagram/mind map)", "membaca": "membaca & mencatat", ...}
#    - nama_kebiasaan = {"rutin": "rutin setiap hari", "kadang": "kadang-kadang", ...}
# 2. Buat list kosong 'lines'
# 3. PEMBUKA MOTIVASI (berdasarkan validasi_status):
#    - "realistis": "🎯 Target IPK {target_ipk:.2f} sangat realistis untukmu!..."
#    - "ambisius": "⚡ Target IPK {target_ipk:.2f} cukup ambisius, tapi bukan tidak mungkin!..."
#    - Else: "💡 Target IPK {target_ipk:.2f} perlu disesuaikan..."
# 4. STRATEGI BERDASARKAN KEBIASAAN BELAJAR:
#    - lines.append("\n📚 Strategi Belajar:")
#    - Jika kebiasaan == "rutin":
#      * "• Kebiasaan belajar rutinmu adalah aset besar. Tingkatkan kualitas..."
#      * "• Buat jadwal review mingguan..."
#    - Jika kebiasaan == "kadang":
#      * "• Mulai bangun rutinitas belajar minimal 1.5 jam per hari..."
#      * "• Gunakan teknik spaced repetition..."
#    - Else (jarang):
#      * "• Prioritas utama: bangun kebiasaan belajar harian minimal 45 menit..."
#      * "• Cari study buddy atau bergabung kelompok belajar..."
# 5. TIPS BERDASARKAN GAYA BELAJAR:
#    - lines.append(f"\n🧠 Tips untuk Gaya Belajar {nama_gaya.title()}:")
#    - Jika gaya == "visual":
#      * "• Buat mind map untuk setiap bab materi kuliah."
#      * "• Gunakan warna berbeda untuk konsep berbeda..."
#      * "• Manfaatkan video tutorial dan infografis..."
#    - Jika gaya == "membaca":
#      * "• Buat ringkasan tertulis setelah setiap sesi belajar..."
#      * "• Gunakan metode Cornell Notes..."
#      * "• Baca ulang catatan 24 jam setelah kuliah..."
#    - Jika gaya == "diskusi":
#      * "• Bentuk kelompok belajar 3-4 orang..."
#      * "• Coba teknik 'teach back'..."
#      * "• Aktif bertanya di kelas dan forum diskusi..."
#    - Else (praktek):
#      * "• Prioritaskan mengerjakan soal latihan dan studi kasus..."
#      * "• Ikuti praktikum atau proyek tambahan..."
#      * "• Buat proyek mini untuk mengaplikasikan teori..."
# 6. PRIORITAS MATA KULIAH SULIT:
#    - Jika matkul_tersulit:
#      * matkul_str = ", ".join(matkul_tersulit[:3])
#      * lines.append(f"\n⚠️ Fokus Mata Kuliah Sulit ({matkul_str}):")
#      * "• Alokasikan 40% waktu belajar untuk mata kuliah ini."
#      * "• Konsultasi ke dosen atau asisten dosen minimal 1x per minggu."
#      * "• Kerjakan semua soal latihan dari tahun-tahun sebelumnya."
#      * "• Jangan tunda — mulai belajar dari minggu pertama..."
# 7. PENUTUP:
#    - lines.append(f"\n✨ Ingat: IPK adalah maraton, bukan sprint. Setiap nilai yang kamu perbaiki...")
# 8. Return: "\n".join(lines)


# ─── BAGIAN 4: MAIN ANALYSIS FUNCTION (~60 baris) ─────────────────────────

# FUNCTION: analyze_ipk_target(student, prediksi, target_ipk, kebiasaan_belajar, gaya_belajar, beban_sks, matkul_tersulit) -> dict
# TODO: Analisis lengkap target IPK dengan panduan personal
# Parameter:
#   - student: dict data mahasiswa
#   - prediksi: dict hasil prediksi
#   - target_ipk: target IPK yang ingin dicapai
#   - kebiasaan_belajar: "rutin", "kadang", atau "jarang"
#   - gaya_belajar: "visual", "membaca", "diskusi", atau "praktek"
#   - beban_sks: beban SKS yang direncanakan
#   - matkul_tersulit: list kode mata kuliah tersulit
# Return: dict hasil analisis lengkap
#
# Algoritma:
# 1. Extract data mahasiswa:
#    - current_ipk = student["ipk_kumulatif"]
#    - semester_aktif = student.get("semester_aktif", 3)
#    - sisa_semester = max(1, TOTAL_SEMESTER - semester_aktif + 1)
# 2. Hitung total SKS yang sudah lulus:
#    - riwayat = student.get("riwayat_semester", [])
#    - sks_lulus = sum(s["sks"] for s in riwayat if s["semester"] < semester_aktif)
# 3. Get prediksi IPK:
#    - pred_ipk = prediksi.get("prediksi_ipk_baru", current_ipk)
# 4. Validasi target:
#    - validasi = _validasi_target(target_ipk, current_ipk, pred_ipk, sisa_semester)
# 5. Hitung IPS minimum:
#    - ips_min = _ips_minimum(target_ipk, current_ipk, sks_lulus, sisa_semester)
# 6. Proyeksi IPK per semester:
#    - proyeksi = _proyeksi_ipk(current_ipk, sks_lulus, ips_min, sisa_semester)
# 7. Estimasi semester untuk capai target:
#    - sem_capai = None
#    - Loop row in proyeksi:
#      * Jika row["ipk_proyeksi"] >= target_ipk:
#        - sem_capai = semester_aktif + row["semester_ke"] - 1
#        - break
# 8. Generate panduan personal:
#    - panduan = _panduan_personal(...)
# 9. Return dict lengkap:
#    - {
#        "target_ipk": target_ipk,
#        "ipk_saat_ini": current_ipk,
#        "ipk_prediksi": pred_ipk,
#        "sisa_semester": sisa_semester,
#        "validasi": validasi,
#        "ips_minimum_per_semester": ips_min,
#        "proyeksi_ipk": proyeksi,
#        "estimasi_semester_capai_target": sem_capai,
#        "panduan_personal": panduan,
#      }


# ═══════════════════════════════════════════════════════════════════════════
# CATATAN PENTING UNTUK DEVELOPER:
# ═══════════════════════════════════════════════════════════════════════════
# 1. File ini memberikan ANALISIS MATEMATIS + PANDUAN PERSONAL
# 2. Validasi target menggunakan perhitungan IPS minimum yang realistis
# 3. Proyeksi IPK menunjukkan trajectory jika IPS minimum tercapai
# 4. Panduan personal disesuaikan dengan profil belajar mahasiswa
# 5. Kebiasaan belajar: rutin > kadang > jarang (impact berbeda)
# 6. Gaya belajar: visual, membaca, diskusi, praktek (strategi berbeda)
# 7. Mata kuliah tersulit mendapat perhatian khusus dalam panduan
# 8. Tone panduan: motivasi + praktis + realistis
# 9. Estimasi semester capai target bisa None jika target tidak tercapai
# 10. Semua perhitungan matematis harus akurat dan transparan
#
# TESTING CHECKLIST:
# □ Test dengan target realistis (gap kecil)
# □ Test dengan target ambisius (gap sedang)
# □ Test dengan target tidak mungkin (gap besar)
# □ Test dengan berbagai kebiasaan belajar
# □ Test dengan berbagai gaya belajar
# □ Test dengan 0-5 mata kuliah tersulit
# □ Test dengan sisa semester 1, 2, 3+
# □ Test proyeksi IPK accuracy
# □ Test panduan personal relevance
# □ Test edge cases (target < current_ipk, target > 4.0)
# ═══════════════════════════════════════════════════════════════════════════
