#!/bin/sh
npm run compile
cdk8s "$@"

if [ "$uid" != "" ]; then
	chown -R $uid:$uid /files
fi