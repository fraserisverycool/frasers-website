#!/bin/bash

# Set the source and destination paths
ABSOLUTE_PATH="/home/fraserbowen/Documents/frasers-website" # change this for your setup
GZIP_LOCATION="/usr/bin/"
SOURCE="${ABSOLUTE_PATH}/database.sqlite"
BACKUP_DIR="${ABSOLUTE_PATH}/backups"
DEST="${BACKUP_DIR}/database_$(date +%Y%m%d).sqlite"

# Set the number of days to keep backups
DAYS_TO_KEEP=60

# Create the backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Copy the database file to the backups folder
cp "$SOURCE" "$DEST"

# Compress the backup, change the path for your setup if necessary
/usr/bin/gzip "$DEST"

# Upload to Google Drive (using rclone)
/usr/bin/rclone copy "$DEST.gz" frasergoogle:/frasers-website/backups --progress

# Cleanup old backups
find "$BACKUP_DIR" -name "database_*.sqlite.gz" -type f -mtime +$DAYS_TO_KEEP -delete
