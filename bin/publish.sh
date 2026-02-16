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

# Update package.json, commit the file and create a tag
npm version "$1" -m "chore: prepare for v$1" --sign-git-tag