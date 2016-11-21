#!/bin/bash

set -o errexit -o nounset

if [ "$TRAVIS_BRANCH" != "master" ]
then
  echo "This commit was made against the $TRAVIS_BRANCH and not the master! No deploy!"
  exit 0
fi

rev=$(git rev-parse --short HEAD)

mkdir -p gh-pages
cd gh-pages

git init
git config user.name "Stéphane Langlois"
git config user.email "stephane@scopyleft.fr"

git remote add upstream "https://$GH_TOKEN@github.com:$GITHUB_REPO"
git fetch upstream
git reset upstream/gh-pages

echo "api.daktary.com" > CNAME
ls
