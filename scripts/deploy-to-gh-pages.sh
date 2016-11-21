#!/bin/bash
set -o errexit -o nounset

rev=$(git rev-parse --short HEAD)

mkdir -p deploy/gh-pages
cd deploy/gh-pages

git init
git config user.name "Stéphane Langlois"
git config user.email "stephane@scopyleft.fr"

git remote add upstream "https://$GITHUB_TOKEN@github.com/daktary-team/api.daktary.com.git"
git fetch upstream
git reset upstream/gh-pages

cp ../licence.md .
echo "api.daktary.com" > CNAME
ls -l
touch .

git add -A .
git commit -m "rebuild pages at ${rev}"
git push -q upstream HEAD:gh-pages
