#!/bin/sh

ls && npm run migrate:latest && npm run build && npm run start