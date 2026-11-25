"""
MediSim AI - Unified Application Launcher
Project: Simulating and Explaining Drug Responses Using AI
Team: BioNex - VIT Bhopal University
"""

import os
import sys
import subprocess
import time
import signal

def main():
    root_dir = os.path.abspath(os.path.dirname(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")
    
    python_exe = sys.executable
    venv_python = os.path.join(root_dir, "venv", "Scripts", "python.exe")
    if os.path.exists(venv_python):
        python_exe = venv_python

    print("=" * 65)
    print("  MEDISIM AI: SIMULATING & EXPLAINING DRUG RESPONSES USING AI")
    print("  Team BioNex - VIT Bhopal University")
    print("=" * 65)
    print(f"[*] Root Directory: {root_dir}")
    print(f"[*] Python Runtime: {python_exe}")
    print("[*] Launching Backend Server (FastAPI on http://localhost:8000)...")
    
    backend_proc = subprocess.Popen(
        [python_exe, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=root_dir
    )
    
    time.sleep(2)
    
    print("[*] Launching Frontend Server (Vite on http://localhost:5173)...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"],
        cwd=frontend_dir
    )
    
    print("\n[OK] Both services are starting:")
    print("     - Frontend UI: http://localhost:5173 (or http://127.0.0.1:5173)")
    print("     - Backend API: http://localhost:8000 (or http://127.0.0.1:8000)")
    print("     - API Docs:    http://localhost:8000/docs")
    print("\nPress Ctrl+C to terminate both servers.\n")
    
    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("[!] Backend server stopped unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("[!] Frontend server stopped unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\n[*] Shutting down MediSim AI servers...")
    finally:
        backend_proc.terminate()
        frontend_proc.terminate()
        backend_proc.wait()
        frontend_proc.wait()
        print("[OK] All servers stopped cleanly.")


if __name__ == "__main__":
    main()
