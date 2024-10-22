#!/bin/sh

ls && npm run migrate:latest && node ./output/server/index.mjs