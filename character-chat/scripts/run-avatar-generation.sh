#!/bin/bash
# Avatar Generation Scheduler
# This script schedules the avatar generation to run after the quota resets

WORK_DIR="/Users/akeemojuko/Downloads/agentwrite-final/character-chat"
LOG_FILE="/tmp/avatar-generation.log"

echo "================================================" >> $LOG_FILE
echo "Avatar Generation Started: $(date)" >> $LOG_FILE
echo "================================================" >> $LOG_FILE

cd "$WORK_DIR"

# Run the avatar generation script
npm run generate-avatars >> $LOG_FILE 2>&1

echo "" >> $LOG_FILE
echo "Avatar Generation Completed: $(date)" >> $LOG_FILE
echo "================================================" >> $LOG_FILE
