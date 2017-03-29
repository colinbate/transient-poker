#!/bin/bash
bump=${1:-minor}
if [ "$bump" = "current" ]; then
  echo Releasing current version of Planning Poker
  version=$(node -e "console.log('v' + require('./package.json').version)")
  echo Version is $version
else
  echo Releasing new $bump version of Planning Poker
  version=$(npm version $bump)
  echo New version is $version
fi

grunt pack

hg ci -m "Release $version"
hg tag $version -m "Tag for release $version"
now ./dist/${version#?}/