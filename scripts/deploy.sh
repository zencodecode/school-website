#!/bin/bash
# ============================================
# Deploy Script — Ponpes Abu Bakar Sidik
# ============================================
# Script ini dijalankan di VPS oleh GitHub Actions
# Lokasi: /opt/ponpes-abs/scripts/deploy.sh

set -euo pipefail

# Konfigurasi
PROJECT_DIR="/opt/ponpes-abs"
COMPOSE_FILE="docker-compose.prod.yml"
LOG_FILE="/var/log/ponpes-abs-deploy.log"

# ============================================
# Functions
# ============================================
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ============================================
# Main Deploy Process
# ============================================
log "=========================================="
log "🚀 Memulai deployment..."
log "=========================================="

# Pindah ke project directory
cd "$PROJECT_DIR"

# Pull kode terbaru
log "📥 Pulling latest code..."
git fetch origin main
git reset --hard origin/main

# Build Docker image baru
log "🔨 Building Docker image..."
docker compose -f "$COMPOSE_FILE" build --no-cache app

# Restart container dengan image baru
# Docker Compose akan restart hanya container yang berubah
log "🔄 Restarting containers..."
docker compose -f "$COMPOSE_FILE" up -d

# Tunggu app container ready
log "⏳ Menunggu app container ready..."
sleep 10

# Verifikasi container berjalan
if docker compose -f "$COMPOSE_FILE" ps | grep -q "ponpes-abs-app.*running"; then
    log "✅ App container berjalan!"
else
    log "❌ App container tidak berjalan. Cek logs:"
    docker compose -f "$COMPOSE_FILE" logs --tail=50 app
    exit 1
fi

# Bersihkan Docker images yang tidak terpakai
log "🧹 Cleaning up old images..."
docker image prune -f

# Log disk usage
log "💾 Disk usage: $(df -h / | tail -1 | awk '{print $5}')"

log "=========================================="
log "✅ Deployment selesai!"
log "=========================================="
