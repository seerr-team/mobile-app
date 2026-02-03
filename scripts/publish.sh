#!/usr/bin/env bash

set -e

# Check arguments
if [ "$#" -ne 1 ]; then
    echo -e "Usage: $0 <version>\n\nExample: $0 1.2.3"
    exit 1
fi

# Run version update script
node scripts/new-version.mjs $1

# Commit changes
git add app.json package.json package-lock.json
git commit -m "chore: update version to v$1"

# Add git tag
git tag "v$1"
