#!/bin/bash
bump=${1:-minor}
echo Releasing new $bump version of Planning Poker
version=$(npm version $bump)
grunt pack
echo New version is $version
echo hg ci -m "Release $version"
echo hg tag $version -m "Tag for release $version"
echo rsync -r ./dist/${version#?}/ root@wallboardr.io:/var/apps/pp.cbate.com/