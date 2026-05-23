#!/usr/bin/env python3
"""
Sentinel AI - Cross-Platform Setup & Diagnostic Coordinator
Handles complete environment setup, dependency installation, and database seeding
for easy running on localhost of any machine.
"""

import os
import sys
import subprocess
import shutil
import platform

# Color support for terminals
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
BOLD = "\033[1m"
RESET = "\033[0m"

# Disable coloring on Windows systems that do not support it natively
if platform.system() == "Windows":
    # Enable VT100 Escape Sequence support on Windows 10+
    try:
        import ctypes
        kernel32 = ctypes.windll.kernel32
        kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
    except Exception:
        # Fallback to plain text if failed
        GREEN = YELLOW = RED = BLUE = BOLD = RESET = ""

def print_banner():
    banner = f"""
{BLUE}{BOLD}========================================================================
   __ ___ _  _ _____ ___ _  _ ___ _      _   ___    ___   ___  ___ 
  / _/ __| \\| |_   _|_ _| \\| | __| |    /_\\ |_ _|  | _ \\ / _ \\| _ \\\\
  \\__\\__ \\ .` | | |  | || .` | _|| |__ / _ \\ | |   |  _/| (_) |   /
  |__/___/_|\\_| |_| |___|_|\\_|___|____/_/ \\_\\___|  |_|   \\___/|_|_\\\\
                                                                   
        Institutional AI Wealth Management Scenario Responder
========================================================================{RESET}
{GREEN}Welcome to the Sentinel AI Portability and Setup Diagnostic tool!{RESET}
This script will configure your localhost environment automatically.
"""
    print(banner)

def check_command(cmd, arg=None):
    """Checks if a command-line tool exists."""
    full_cmd = [cmd]
    if arg:
        full_cmd.append(arg)
    try:
        subprocess.run(full_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def run_step(title, func):
    """Utility to run a setup step with nice visual formatting."""
    print(f"\n{BOLD}[Step]{RESET} {title}...")
    try:
        success = func()
        if success:
            print(f"{GREEN}-> SUCCESS{RESET}")
            return True
        else:
            print(f"{RED}-> FAILED{RESET}")
            return False
    except Exception as e:
        print(f"{RED}-> EXCEPTION:{RESET} {e}")
        return False

def check_prerequisites():
    """Verify Node, NPM, Python are available."""
    prereqs = True
    
    # 1. Python Check
    print(f"  - Checking Python 3: ", end="", flush=True)
    if sys.version_info >= (3, 8):
        print(f"{GREEN}PASS{RESET} (v{sys.version_info.major}.{sys.version_info.minor})")
    else:
        print(f"{RED}FAIL{RESET} (Need Python >= 3.8)")
        prereqs = False
        
    # 2. Node Check
    print(f"  - Checking Node.js: ", end="", flush=True)
    if check_command("node", "--version"):
        print(f"{GREEN}PASS{RESET}")
    else:
        print(f"{YELLOW}WARNING{RESET} (Node.js not detected in path. Required for Frontend Next.js app)")
        
    # 3. NPM Check
    print(f"  - Checking NPM: ", end="", flush=True)
    if check_command("npm", "--version"):
        print(f"{GREEN}PASS{RESET}")
    else:
        print(f"{YELLOW}WARNING{RESET} (NPM not detected in path. Required for Frontend Node modules)")
        
    return prereqs

def setup_backend():
    """Prepares the Python environment and seeds the database."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    api_dir = os.path.join(base_dir, "apps", "api")
    
    if not os.path.exists(api_dir):
        print(f"  {RED}Error: API folder not found at {api_dir}{RESET}")
        return False
        
    # 1. Find virtual environment path
    venv_dir = os.path.join(api_dir, "venv")
    is_windows = platform.system() == "Windows"
    
    if is_windows:
        python_executable = os.path.join(venv_dir, "Scripts", "python.exe")
        pip_executable = os.path.join(venv_dir, "Scripts", "pip.exe")
    else:
        python_executable = os.path.join(venv_dir, "bin", "python")
        pip_executable = os.path.join(venv_dir, "bin", "pip")
        
    # 2. Create Virtual Environment if not exists
    if not os.path.exists(venv_dir):
        print(f"  - Creating virtual environment at {venv_dir}...")
        try:
            subprocess.run([sys.executable, "-m", "venv", venv_dir], check=True)
            print(f"    {GREEN}Virtual environment created.{RESET}")
        except subprocess.CalledProcessError as e:
            print(f"    {RED}Failed to create virtual env: {e}{RESET}")
            return False
    else:
        print(f"  - Existing virtual environment detected.")

    # 3. Upgrade Pip & Install requirements
    print("  - Installing/upgrading backend dependencies in venv...")
    reqs_path = os.path.join(api_dir, "requirements.txt")
    if not os.path.exists(reqs_path):
        print(f"    {RED}Requirements file not found at {reqs_path}{RESET}")
        return False
        
    try:
        # Upgrade pip
        subprocess.run([python_executable, "-m", "pip", "install", "--upgrade", "pip"], check=True, stdout=subprocess.DEVNULL)
        # Install packages
        subprocess.run([pip_executable, "install", "-r", reqs_path], check=True)
        # Make sure requests is installed
        subprocess.run([pip_executable, "install", "requests"], check=True, stdout=subprocess.DEVNULL)
        print(f"    {GREEN}Python dependencies installed successfully.{RESET}")
    except subprocess.CalledProcessError as e:
        print(f"    {RED}Failed installing backend packages: {e}{RESET}")
        return False

    # 4. Synchronize local configuration file
    print("  - Configuring API local environment settings...")
    api_env = os.path.join(api_dir, ".env")
    api_env_example = os.path.join(api_dir, ".env.example")
    
    if not os.path.exists(api_env):
        if os.path.exists(api_env_example):
            shutil.copyfile(api_env_example, api_env)
            print("    Copied local `.env` from `.env.example` template.")
        else:
            # Create a basic one
            with open(api_env, "w") as f:
                f.write("# Local Environment Settings\nSECRET_KEY=sentinel-super-secret-key-2026\nACCESS_TOKEN_EXPIRE_MINUTES=11520\n")
            print("    Created a new local `.env` settings file.")
    else:
        print("    Local `.env` settings already exist.")

    # 5. Initialize and Seed the Database
    print("  - Dropping and recreating tables & seeding the database...")
    src_dir = os.path.join(api_dir, "src")
    seed_script = os.path.join(src_dir, "seed_db.py")
    
    if not os.path.exists(seed_script):
        print(f"    {RED}Database seed script not found at {seed_script}{RESET}")
        return False
        
    try:
        # Drop tables first to ensure clean state
        drop_cmd = f"from config.database import engine; from models import Base; Base.metadata.drop_all(bind=engine); print('Tables reset.')"
        # Run clean DB reset script
        subprocess.run([python_executable, "-c", drop_cmd], cwd=src_dir, check=True)
        # Run DB seed script
        subprocess.run([python_executable, "seed_db.py"], cwd=src_dir, check=True)
        print(f"    {GREEN}Database seeded successfully with all 9 scenarios!{RESET}")
    except subprocess.CalledProcessError as e:
        print(f"    {RED}Failed seeding database: {e}{RESET}")
        return False

    return True

def setup_frontend():
    """Installs dependencies for Node/Next.js frontend."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    web_dir = os.path.join(base_dir, "apps", "web")
    
    # 1. Check Node availability before starting
    if not check_command("node", "--version") or not check_command("npm", "--version"):
        print(f"  {YELLOW}Skipping frontend setup (Node/NPM not fully configured locally).{RESET}")
        print("  You will need to install Node/NPM and run `npm install` inside the root directory manually later.")
        return True
        
    # 2. Synchronize root .env
    root_env = os.path.join(base_dir, ".env")
    root_env_example = os.path.join(base_dir, ".env.example")
    if not os.path.exists(root_env) and os.path.exists(root_env_example):
        shutil.copyfile(root_env_example, root_env)
        print("  - Copied root `.env` configuration file.")

    # 3. Install NPM dependencies using workspaces or root npm
    print("  - Installing frontend Node modules. Please wait...")
    try:
        # Check if workspaces are supported or just run standard npm install
        subprocess.run(["npm", "install"], cwd=base_dir, check=True)
        print(f"    {GREEN}Frontend dependencies installed successfully.{RESET}")
    except subprocess.CalledProcessError as e:
        print(f"    {RED}Failed running npm install: {e}{RESET}")
        return False
        
    return True

def start_interactive_guide():
    """Explains how to run the application."""
    print(f"\n{BOLD}========================================================================{RESET}")
    print(f"   {GREEN}{BOLD}*** SENTINEL AI IS NOW CONFIGURED AND READY ON YOUR LOCALHOST! ***{RESET}")
    print(f"{BOLD}========================================================================{RESET}")
    print(f"\n{BOLD}To launch the platform, start both the backend API and Next.js frontend:{RESET}")
    print(f"\n  {BOLD}1. Start the API Backend:{RESET}")
    print(f"     cd apps/api/src")
    if platform.system() == "Windows":
        print(f"     ..\\venv\\Scripts\\python.exe -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload")
    else:
        print(f"     ../venv/bin/python -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload")
    print(f"     {BLUE}--> API will be active at http://127.0.0.1:8000/docs (FastAPI Swagger){RESET}")
    
    print(f"\n  {BOLD}2. Start the Frontend Client:{RESET}")
    print(f"     Npm run dev")
    print(f"     {BLUE}--> Frontend will be active at http://localhost:3000{RESET}")
    
    print(f"\n{BOLD}Demo Login Credentials (for Relationship Manager, Risk Officer, Compliance Head):{RESET}")
    print(f"  - {BOLD}Relationship Manager:{RESET} rm@sentinel.ai         / Sentinel2026!")
    print(f"  - {BOLD}Risk Officer:{RESET}         risk@sentinel.ai       / Sentinel2026!")
    print(f"  - {BOLD}Compliance Head:{RESET}      compliance@sentinel.ai / Sentinel2026!")
    print(f"\n{BOLD}Happy Hackathon Coding!{RESET}\n")

def main():
    print_banner()
    
    # Run Step 0: Check Prerequisites
    if not run_step("Verifying System Prerequisites", check_prerequisites):
        print(f"\n{RED}Prerequisite check failed or warned. Continuing setup with best-effort fallback.{RESET}")
        
    # Run Step 1: Backend Python Environment & Database Seeding
    if not run_step("Setting up Backend API & Seeding SQLite Database", setup_backend):
        print(f"\n{RED}Backend setup failed. Please fix Python or package environment dependencies and retry.{RESET}")
        sys.exit(1)
        
    # Run Step 2: Frontend JS Environment
    if not run_step("Setting up Frontend Next.js & Client Libraries", setup_frontend):
        print(f"\n{YELLOW}Warning: Frontend node package setup encountered issues. You can manually install later.{RESET}")
        
    # Show how to run
    start_interactive_guide()

if __name__ == "__main__":
    main()
