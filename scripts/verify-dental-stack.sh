#!/usr/bin/env bash
# Automated verification for the dental stack (API + viewer reachability).
set -euo pipefail

WEB_URL="${WEB_URL:-http://localhost:8080}"
API_URL="${API_URL:-http://localhost:3000/api/v1}"
EMAIL="${DENTAL_EMAIL:-admin@example.com}"
PASSWORD="${DENTAL_PASSWORD:-change-me-strongly}"

pass=0
fail=0

check() {
  local name="$1"
  shift
  if "$@"; then
    echo "PASS  $name"
    pass=$((pass + 1))
  else
    echo "FAIL  $name"
    fail=$((fail + 1))
  fi
}

echo "Dental verification — web=$WEB_URL api=$API_URL"
echo ""

check "viewer responds" curl -sf "$WEB_URL/" >/dev/null
check "dental config served" curl -sf "$WEB_URL/config/dental.js" | grep -q dentalPracticeName
check "api health" curl -sf "$API_URL/health" | grep -q '"status":"ok"'

TOKEN=""
if TOKEN=$(curl -sf -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])"); then
  echo "PASS  login returns JWT"
  pass=$((pass + 1))
else
  echo "FAIL  login returns JWT"
  fail=$((fail + 1))
fi

if [[ -n "$TOKEN" ]]; then
  STUDY="verify.$(date +%s)"
  check "viewer-state save" curl -sf -X POST "$API_URL/viewer-state" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"study_instance_uid\":\"$STUDY\",\"mode\":\"dental\",\"theme\":\"dental\",\"selected_tooth\":\"21\",\"tooth_system\":\"FDI\"}" \
    | grep -q '"statusCode":200'

  check "viewer-state read" curl -sf "$API_URL/viewer-state/study/$STUDY" \
    -H "Authorization: Bearer $TOKEN" \
    | grep -q '"selected_tooth":"21"'
fi

echo ""
echo "Results: $pass passed, $fail failed"
[[ "$fail" -eq 0 ]]
