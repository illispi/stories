#!/bin/sh

bun run migrate:latest && bun run .output/server/index.mjs