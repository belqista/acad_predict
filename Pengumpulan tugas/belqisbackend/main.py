(main.py mengatur FastAPI app, endpoint, dan model Pydantic.)

from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from utils import load_students_json, save_students_json, predict_student, analyze_ipk_target

app = FastAPI()

# Allow all origins for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache students data
students_cache = load_students_json()

class IPKTargetRequest(BaseModel):
    target_ipk: float
    kebiasaan_belajar: str
    gaya_belajar: str
    beban_sks_direncanakan: int
    matkul_tersulit: str

@app.get("/health")
def health_check():
    return {"status": "ok", "total_mahasiswa": len(students_cache)}

@app.get("/api/students")
def list_students(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    prodi: Optional[str] = None,
    search: Optional[str] = None
):
    students = list(students_cache.values())

    if prodi:
        students = [s for s in students if s["prodi"].lower() == prodi.lower()]
    if search:
        students = [s for s in students if search.lower() in s["nama"].lower() or search in s["nim"]]

    start = (page - 1) * limit
    end = start + limit
    return {
        "page": page,
        "limit": limit,
        "total": len(students),
        "data": students[start:end]
    }

@app.get("/api/student/{nim}")
def get_student(nim: str):
    student = students_cache.get(nim)
    if not student:
        raise HTTPException(status_code=404, detail="Mahasiswa tidak ditemukan")
    return student

@app.get("/api/predict/{nim}")
def predict(nim: str):
    student = students_cache.get(nim)
    if not student:
        raise HTTPException(status_code=404, detail="Mahasiswa tidak ditemukan")
    prediction = predict_student(student)
    return {"student": student, "prediction": prediction}

@app.post("/api/ipk-target/{nim}")
def ipk_target(nim: str, request: IPKTargetRequest):
    student = students_cache.get(nim)
    if not student:
        raise HTTPException(status_code=404, detail="Mahasiswa tidak ditemukan")
    analysis = analyze_ipk_target(nim, request)
    return analysis

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
