import sys
from pathlib import Path

# Ensure backend directory is in sys.path for pytest regardless of working directory
backend_dir = Path(__file__).parent.resolve()
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
