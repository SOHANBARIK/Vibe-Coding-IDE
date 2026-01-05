import subprocess

def execute_in_sandbox(code: str, language: str = "python") -> str:
    """
    Runs code in the 'fractal-sandbox' container based on language.
    """
    
    # Define how to run each language
    commands = {
        "python":     ["python", "-c", code],
        "javascript": ["node", "-e", code],
        "bash":       ["bash", "-c", code],
        "cpp":        ["sh", "-c", f"echo '{code}' > main.cpp && g++ main.cpp -o main && ./main"],
        # JAVA SUPPORT: Write to main.java -> Run it
        "java":       ["sh", "-c", f"echo '{code}' > main.java && java main.java"]
    }

    if language not in commands:
        return f"ERROR: Unsupported language '{language}'"

    # Docker Command
    cmd = [
        "docker", "run", "--rm",
        "--network", "none",     # No Internet (Security)
        "fractal-sandbox",       # Our new custom image
    ] + commands[language]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        return result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return "ERROR: Execution timed out."
    except Exception as e:
        return f"SYSTEM ERROR: {str(e)}"