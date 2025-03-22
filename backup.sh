#!/bin/bash

# Set the source and destination paths
SOURCE="./database.sqlite"
BACKUP_DIR="./backups"
DEST="${BACKUP_DIR}/database_$(date +%Y%m%d).sqlite"

# Set the number of days to keep backups
DAYS_TO_KEEP=60

# Create the backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Copy the database file to the backups folder
cp "$SOURCE" "$DEST"

# Compress the backup
gzip "$DEST"

# Cleanup old backups
find "$BACKUP_DIR" -name "database_*.sqlite.gz" -type f -mtime +$DAYS_TO_KEEP -delete
