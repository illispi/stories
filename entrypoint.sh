#!/bin/sh

ls
npm run migrate:latest && node ./dist/server.js