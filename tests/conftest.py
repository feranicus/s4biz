import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "webapp", "backend"))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# The app writes enquiries to DATA_DIR before attempting delivery. Point it somewhere disposable so
# a test run never appends to a real file, and so the tests do not depend on /data existing.
os.environ.setdefault("DATA_DIR", os.path.join(ROOT, ".pytest-data"))
os.environ.setdefault("FRONTEND_DIST", os.path.join(ROOT, "webapp", "frontend", "dist"))
