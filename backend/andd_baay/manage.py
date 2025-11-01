# ...existing code...
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path

def _ensure_env_utf8():
    """
    If a .env file exists next to manage.py and is not UTF-8,
    try decoding it as cp1252 (Windows ANSI) and rewrite as UTF-8 (no BOM).
    This prevents psycopg2 trying to decode non-UTF-8 bytes from env.
    """
    env_path = Path(__file__).resolve().parent / '.env'
    if not env_path.exists():
        return
    try:
        # If already UTF-8 this will succeed and we do nothing.
        env_path.read_text(encoding='utf-8')
        return
    except UnicodeDecodeError:
        raw = env_path.read_bytes()
        # Prefer utf-8; fallback to cp1252 with replacement of invalid sequences.
        try:
            text = raw.decode('utf-8')
        except UnicodeDecodeError:
            text = raw.decode('cp1252', errors='replace')
        # Remove BOM if present and write as UTF-8 without BOM.
        if text.startswith('\ufeff'):
            text = text.lstrip('\ufeff')
        env_path.write_text(text, encoding='utf-8')

def main():
    """Run administrative tasks."""
    # ensure .env is UTF-8 before loading settings (so DB creds are valid unicode)
    try:
        _ensure_env_utf8()
    except Exception:
        # keep manage.py resilient; on failure fall back to normal behavior
        pass

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'andd_baay.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
# ...existing code...