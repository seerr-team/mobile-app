#!/usr/bin/env bash

set -e

# Check arguments
if [ "$#" -ne 1 ]; then
  echo -e "Usage: $0 <version>\n\nExample: $0 1.2.3"
  exit 1
fi

# Update app.json with the new version
jq --arg version "$1" '.expo.version = $version' app.json > tmp.json
mv tmp.json app.json

# Update package.json
jq --arg version "$1" '.version = $version' package.json > tmp.json
mv tmp.json package.json
# Update package-lock.json
jq --arg version "$1" '.version = $version' package-lock.json > tmp.json
mv tmp.json package-lock.json
jq --arg version "$1" '.packages."".version = $version' package-lock.json > tmp.json
mv tmp.json package-lock.json

# Commit changes
git add app.json package.json package-lock.json
git commit -m "chore: prepare for v$1"

# Create signed git tag
git tag -s "v$1" -m "Release v$1"