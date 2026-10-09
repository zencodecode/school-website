#!/bin/bash
# ============================================
# MongoDB Backup Script
# ============================================
set -euo pipefail

BACKUP_DIR="/opt/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ponpes-abs-$DATE.gz"
RETENTION_DAYS=7

# Jalankan mongodump di container
docker exec ponpes-abs-mongo mongodump \
    --archive --gzip \
    --username="$MONGO_USERNAME" \
    --password="$MONGO_PASSWORD" \
    --authenticationDatabase=admin \
    > "$BACKUP_FILE"

echo "[$(date)] Backup berhasil: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# Hapus backup lama (lebih dari 7 hari)
find "$BACKUP_DIR" -name "ponpes-abs-*.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Backup lama (>$RETENTION_DAYS hari) dihapus"
