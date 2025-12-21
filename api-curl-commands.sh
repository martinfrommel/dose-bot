#!/bin/bash
# DoseBot API - cURL Commands
# Base URL: http://localhost:8911 (set PATH_PREFIX=/api when behind Traefik or another proxy)
# Usage: PATH_PREFIX=/api ./api-curl-commands.sh [API_KEY]
# Default API Key: test-api-key-123

API_KEY="${1:-test-api-key-123}"
BASE_URL="${BASE_URL:-http://localhost:8911}"
PATH_PREFIX="${PATH_PREFIX:-}"
echo "Using API Key: $API_KEY"
echo "Base URL: ${BASE_URL}${PATH_PREFIX}"
echo ""

# ============================================
# SUBSTANCES
# ============================================

# Get All Substances
curl -X GET "${BASE_URL}${PATH_PREFIX}/substances" \
  -H "Authorization: Bearer $API_KEY"

# Get All Substances with Doses
curl -X GET "${BASE_URL}${PATH_PREFIX}/substances?includeDoses=true" \
  -H "Authorization: Bearer $API_KEY"

# Create Substance
curl -X POST "${BASE_URL}${PATH_PREFIX}/substances" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Caffeine",
    "description": "A central nervous system stimulant"
  }'

# Get Substance by ID
curl -X GET "${BASE_URL}${PATH_PREFIX}/substance/1" \
  -H "Authorization: Bearer $API_KEY"

# Get Substance by Slug
curl -X GET "${BASE_URL}${PATH_PREFIX}/substance/caffeine" \
  -H "Authorization: Bearer $API_KEY"

# Update Substance
curl -X PUT "${BASE_URL}${PATH_PREFIX}/substance/1" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Caffeine (Updated)",
    "description": "An updated description",
    "slug": "caffeine-new"
  }'

# Delete Substance
curl -X DELETE "${BASE_URL}${PATH_PREFIX}/substance/1" \
  -H "Authorization: Bearer $API_KEY"


# ============================================
# DOSES
# ============================================

# Get All Doses
curl -X GET "${BASE_URL}${PATH_PREFIX}/doses" \
  -H "Authorization: Bearer $API_KEY"

# Get Doses by Substance ID
curl -X GET "${BASE_URL}${PATH_PREFIX}/doses?substanceId=1" \
  -H "Authorization: Bearer $API_KEY"

# Get Doses by Substance Slug
curl -X GET "${BASE_URL}${PATH_PREFIX}/doses?slug=caffeine" \
  -H "Authorization: Bearer $API_KEY"

# Create Dose (Units: MG, ML, G, IU)
curl -X POST "${BASE_URL}${PATH_PREFIX}/doses" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "unit": "MG",
    "substanceId": 1
  }'

# Get Dose by ID
curl -X GET "${BASE_URL}${PATH_PREFIX}/dose/1" \
  -H "Authorization: Bearer $API_KEY"

# Update Dose
curl -X PUT "${BASE_URL}${PATH_PREFIX}/dose/1" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150,
    "unit": "MG",
    "substanceId": 1
  }'

# Delete Dose
curl -X DELETE "${BASE_URL}${PATH_PREFIX}/dose/1" \
  -H "Authorization: Bearer $API_KEY"
