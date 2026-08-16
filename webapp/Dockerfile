# ---- stage 1: build the React site ----------------------------------------------------------
FROM node:20-slim AS fe
WORKDIR /fe
COPY webapp/frontend/package.json webapp/frontend/package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY webapp/frontend/ ./

# THE GATES LIVE HERE, NOT IN ship.py, AND THAT IS DELIBERATE.
#
# The render gate needs esbuild, whose binary is a PER PLATFORM optional dependency. The operator's
# node_modules sits in a shared folder, so a Linux-native install fails on Windows with
# "@esbuild/win32-x64 could not be found": a gate that cannot run on the machine that invokes it.
# Three consecutive ships were lost to exactly that, each time to a fix that was green in a Linux
# sandbox and impossible on the operator's box.
#
# This stage does a fresh npm install inside linux/amd64, so the toolchain is correct BY
# CONSTRUCTION, there is no operator setup to drift, and a failure here fails the image and
# therefore the deploy. Nothing broken can ship, and there is still exactly one command.
#
#   i18n_gate      every locale complete, content arrays parallel, no long dash, no price,
#                  no HTML entity, no sentence over 30 words, tab labels short enough
#   layout_gate    the header row fits in every language at every breakpoint, the two chrome
#                  controls still match, every route reachable and registered in all four places
#   contrast_gate  WCAG pairs, the reserved call-to-action fill, no retired palette, no invisible
#                  text, and the app chrome agreeing with itself across three files
#   render_gate    every page server-rendered in every language, plus 1800 frames of the hero
#                  animation executed against a validating canvas. A build passing is not a page
#                  working: an undefined identifier or a malformed colour is legal JavaScript
#                  until it executes.
RUN node tools/i18n_gate.mjs \
 && node tools/layout_gate.mjs \
 && node tools/contrast_gate.mjs \
 && node tools/render_gate.mjs

RUN npm run build

# WHAT THE WORLD CAN READ. Runs AFTER the build because it measures dist/, not the source: no
# source maps (a shipped .map hands over the entire original source), no secrets or droplet
# addresses in the bundle, no HTML comments in the shell, and the structured data intact.
RUN node tools/shipped_shell.mjs

# ---- stage 2: FastAPI serving the built site --------------------------------------------------
FROM python:3.12-slim
ENV DEBIAN_FRONTEND=noninteractive PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY webapp/backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY webapp/backend/app ./app
COPY --from=fe /fe/dist ./frontend_dist
ENV FRONTEND_DIST=/app/frontend_dist DATA_DIR=/data
RUN mkdir -p /data
# Run as a non-root user. The image needs no privileged operation at runtime, and a container that
# does not need root should not have it.
RUN useradd -r -u 10001 s4biz && chown -R s4biz:s4biz /app /data
USER s4biz
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8000/api/health || exit 1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
