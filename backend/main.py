# ============================================================================
# ANAK 1 - BACKEND: MAIN API
# FILE: backend/main.py
# ============================================================================
# 
# TUJUAN FILE INI:
# Entry point utama backend FastAPI
# Menangani semua HTTP endpoints untuk prediksi akademik
# 
# STRUKTUR FILE (urutan penting):
# 1. Docstring & imports
# 2. FastAPI app initialization
# 3. CORS middleware setup
# 4. Data loading functions
# 5. Startup event handler
# 6. API endpoints (5 endpoints)
# 7. Main runner
# 
# ============================================================================
# BAGIAN 1: DOCSTRING & IMPORTS (~15 baris)
# ============================================================================
# 
# Baris 1-3: Docstring
# """
# FastAPI Backend for Academic Performance Prediction System
# """
# 
# Baris 4-12: Standard library imports
# import json
# import os
# import sys
# 
# Baris 13-16: FastAPI imports
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import Optional, List
# 
# Baris 17-19: Path setup untuk import utils
# # Ensure the backend directory is on the path
# sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
# 
# Baris 20-22: Import dari utils modules
# from utils.predictor import predict_student
# from utils.data_generator import save_students_json
# from utils.ipk_target import analyze_ipk_target
# 
# ============================================================================
# BAGIAN 2: FASTAPI APP INITIALIZATION (~10 baris)
# ============================================================================
# 
# Buat FastAPI instance dengan metadata:
# app = FastAPI(
#     title="Academic Performance Prediction API",
#     description="Sistem Prediksi Performa Akademik Mahasiswa",
#     version="1.0.0",
# )
# 
# Kenapa perlu metadata?
# - Muncul di auto-generated docs (/docs)
# - Membantu dokumentasi API
# 
# ============================================================================
# BAGIAN 3: CORS MIDDLEWARE (~8 baris)
# ============================================================================
# 
# Setup CORS untuk allow frontend access:
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],      # Allow semua origin (development)
#     allow_credentials=True,
#     allow_methods=["*"],      # Allow semua HTTP methods
#     allow_headers=["*"],      # Allow semua headers
# )
# 
# Kenapa perlu CORS?
# - Frontend (port 3000) perlu akses backend (port 8001)
# - Tanpa CORS, browser block request cross-origin
# 
# ============================================================================
# BAGIAN 4: DATA LOADING (~30 baris)
# ============================================================================
# 
# Konstanta path ke students.json:
# STUDENTS_JSON_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "students.json")
# 
# Global cache dictionary:
# _students_cache: dict[str, dict] = {}
# 
# Function load_students() -> dict[str, dict]:
#   """Load students from JSON, generate if missing."""
#   
#   Langkah-langkah:
#   1. Cek jika _students_cache sudah ada isi, return langsung (caching)
#   2. Cek jika file students.json tidak ada:
#      - Print "students.json not found – generating..."
#      - Panggil save_students_json(STUDENTS_JSON_PATH)
#   3. Buka file students.json dengan encoding utf-8
#   4. Load JSON ke variable data (list of students)
#   5. Convert list ke dict dengan key = NIM:
#      _students_cache = {s["nim"]: s for s in data}
#   6. Print f"Loaded {len(_students_cache)} students."
#   7. Return _students_cache
# 
# Kenapa pakai cache?
# - Avoid reload JSON setiap request
# - Performance optimization
# 
# ============================================================================
# BAGIAN 5: STARTUP EVENT (~5 baris)
# ============================================================================
# 
# @app.on_event("startup")
# async def startup_event():
#     load_students()
# 
# Kenapa perlu startup event?
# - Load data saat server start (bukan saat request pertama)
# - Faster first request response
# 
# ============================================================================
# BAGIAN 6: API ENDPOINTS
# ============================================================================
# 
# --- ENDPOINT 1: Health Check (~5 baris) ---
# 
# @app.get("/health")
# def health_check():
#     students = load_students()
#     return {"status": "ok", "total_students": len(students)}
# 
# Tujuan: Cek apakah server running & data loaded
# 
# --- ENDPOINT 2: List Students (~35 baris) ---
# 
# @app.get("/api/students")
# def list_students(
#     page: int = 1,
#     limit: int = 20,
#     prodi: Optional[str] = None,
#     search: Optional[str] = None,
# ):
#     """List all students with pagination, optional prodi filter, and name/NIM search."""
#     
#     Langkah-langkah:
#     1. Load students = load_students()
#     2. Convert dict values ke list: items = list(students.values())
#     3. Filter by prodi jika ada:
#        if prodi:
#            items = [s for s in items if s["prodi_key"].upper() == prodi.upper() or
#                     s["prodi"].lower() == prodi.lower()]
#     4. Filter by search (nama atau NIM) jika ada:
#        if search:
#            s_lower = search.lower()
#            items = [s for s in items if s_lower in s["nim"] or s_lower in s["nama"].lower()]
#     5. Hitung total = len(items)
#     6. Pagination: start = (page - 1) * limit, end = start + limit
#     7. Slice: page_items = items[start:end]
#     8. Return dict dengan:
#        - total: total items
#        - page: current page
#        - limit: items per page
#        - total_pages: (total + limit - 1) // limit
#        - students: list of simplified student objects (nim, nama, prodi, prodi_key, angkatan, jenis_kelamin, semester_aktif, ipk_kumulatif)
# 
# Tujuan: List mahasiswa dengan pagination & filter
# 
# --- ENDPOINT 3: Get Single Student (~10 baris) ---
# 
# @app.get("/api/student/{nim}")
# def get_student(nim: str):
#     """Get student info by NIM."""
#     students = load_students()
#     student = students.get(nim)
#     if not student:
#         raise HTTPException(status_code=404, detail=f"Mahasiswa dengan NIM {nim} tidak ditemukan.")
#     return student
# 
# Tujuan: Get detail 1 mahasiswa by NIM
# 
# --- ENDPOINT 4: Predict Student (~30 baris) ---
# 
# @app.get("/api/predict/{nim}")
# def predict(nim: str):
#     """Get full prediction for a student."""
#     
#     Langkah-langkah:
#     1. Load students, get student by NIM
#     2. Jika tidak ada, raise HTTPException 404
#     3. Buat base dict dengan info student:
#        base = {
#            "nim": student["nim"],
#            "nama": student["nama"],
#            "prodi": student["prodi"],
#            "prodi_key": student["prodi_key"],
#            "angkatan": student["angkatan"],
#            "jenis_kelamin": student["jenis_kelamin"],
#            "semester_aktif": student["semester_aktif"],
#            "ipk_kumulatif": student["ipk_kumulatif"],
#            "riwayat_semester": student["riwayat_semester"],
#        }
#     4. Cek jika semester_aktif >= 6:
#        base["status"] = "lulus"
#        base["prediksi"] = None
#        return base
#     5. Jika masih aktif:
#        base["status"] = "aktif"
#        base["prediksi"] = predict_student(student)
#        return base
# 
# Tujuan: Get prediksi akademik lengkap untuk 1 mahasiswa
# 
# --- PYDANTIC MODEL (~10 baris) ---
# 
# class IPKTargetRequest(BaseModel):
#     target_ipk: float
#     kebiasaan_belajar: str        # "rutin", "kadang", "jarang"
#     gaya_belajar: str             # "visual", "membaca", "diskusi", "praktek"
#     beban_sks_direncanakan: int
#     matkul_tersulit: List[str]    # list kode/nama matkul
# 
# Kenapa perlu Pydantic model?
# - Auto validation request body
# - Type checking
# - Auto-generated API docs
# 
# --- ENDPOINT 5: IPK Target Analysis (~20 baris) ---
# 
# @app.post("/api/ipk-target/{nim}")
# def ipk_target(nim: str, req: IPKTargetRequest):
#     """Analisis target IPK: matematis + panduan personal."""
#     
#     Langkah-langkah:
#     1. Load students, get student by NIM
#     2. Jika tidak ada, raise HTTPException 404
#     3. Panggil prediksi = predict_student(student)
#     4. Panggil result = analyze_ipk_target(
#            student=student,
#            prediksi=prediksi,
#            target_ipk=req.target_ipk,
#            kebiasaan_belajar=req.kebiasaan_belajar,
#            gaya_belajar=req.gaya_belajar,
#            beban_sks=req.beban_sks_direncanakan,
#            matkul_tersulit=req.matkul_tersulit,
#        )
#     5. Return result
# 
# Tujuan: Analisis apakah target IPK realistis + panduan belajar personal
# 
# ============================================================================
# BAGIAN 7: MAIN RUNNER (~5 baris)
# ============================================================================
# 
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
# 
# Kenapa port 8001?
# - Frontend proxy di vite.config.js point ke port 8001
# 
# Kenapa reload=True?
# - Auto-restart saat file berubah (development mode)
# 
# ============================================================================
# TOTAL ESTIMASI: ~180 baris kode
# ============================================================================
# 
# TESTING SETELAH SELESAI:
# 1. Run: python backend/main.py
# 2. Buka browser: http://localhost:8001/docs
# 3. Test endpoint /health
# 4. Test endpoint /api/students
# 
# DEPENDENCIES:
# - Butuh utils/predictor.py (Anak 4)
# - Butuh utils/data_generator.py (Anak 3)
# - Butuh utils/ipk_target.py (Anak 4)
# 
# ============================================================================
