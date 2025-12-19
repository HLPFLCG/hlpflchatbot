#!/bin/bash

# Enhanced API Testing Script
# Tests all new endpoints with live data integration

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${1:-http://localhost:8787}"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo "=========================================="
echo "HLPFL Enhanced API Testing"
echo "=========================================="
echo "API URL: $API_URL"
echo ""

# Helper function to run tests
run_test() {
    local test_name="$1"
    local endpoint="$2"
    local expected_status="${3:-200}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Testing: $test_name... "
    
    response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Helper function to test JSON response
test_json_field() {
    local test_name="$1"
    local endpoint="$2"
    local field="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Testing: $test_name... "
    
    response=$(curl -s "$API_URL$endpoint")
    
    if echo "$response" | jq -e "$field" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Field '$field' not found)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo "=========================================="
echo "1. Basic Endpoints"
echo "=========================================="

run_test "Root endpoint" "/"
run_test "Health check" "/api/health"
run_test "Documentation" "/api/docs"
run_test "Services list" "/api/services"

echo ""
echo "=========================================="
echo "2. Live Data Endpoints"
echo "=========================================="

run_test "Company information" "/api/company"
run_test "Artist roster" "/api/artists"
run_test "Recent releases" "/api/releases"
run_test "Upcoming events" "/api/events"
run_test "Blog posts" "/api/blog"
run_test "Testimonials" "/api/testimonials"

echo ""
echo "=========================================="
echo "3. Query Parameters"
echo "=========================================="

run_test "Releases with custom days" "/api/releases?days=7"
run_test "Blog with custom limit" "/api/blog?limit=3"
run_test "Testimonials by category" "/api/testimonials?category=production"

echo ""
echo "=========================================="
echo "4. JSON Structure Validation"
echo "=========================================="

test_json_field "Company has stats" "/api/company" ".company.stats"
test_json_field "Artists array exists" "/api/artists" ".artists"
test_json_field "Releases array exists" "/api/releases" ".releases"
test_json_field "Events array exists" "/api/events" ".events"
test_json_field "Blog posts array exists" "/api/blog" ".posts"

echo ""
echo "=========================================="
echo "5. Chat Endpoint"
echo "=========================================="

TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -n "Testing: Chat with greeting... "
chat_response=$(curl -s -X POST "$API_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello!"}')

if echo "$chat_response" | jq -e '.response' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -n "Testing: Chat with company info request... "
chat_response=$(curl -s -X POST "$API_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "Tell me about HLPFL Records"}')

if echo "$chat_response" | jq -e '.response' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -n "Testing: Chat with artist roster request... "
chat_response=$(curl -s -X POST "$API_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "Who are your artists?"}')

if echo "$chat_response" | jq -e '.response' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""
echo "=========================================="
echo "6. Cache Performance"
echo "=========================================="

run_test "Cache statistics" "/api/cache/stats"

echo ""
echo "=========================================="
echo "7. Error Handling"
echo "=========================================="

run_test "404 for invalid endpoint" "/api/invalid" 404
run_test "405 for GET on chat" "/api/chat" 405

echo ""
echo "=========================================="
echo "8. Data Freshness"
echo "=========================================="

TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -n "Testing: Company data has lastUpdated... "
company_response=$(curl -s "$API_URL/api/company")
if echo "$company_response" | jq -e '.company.stats.lastUpdated' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -n "Testing: Artists data has lastUpdated... "
artists_response=$(curl -s "$API_URL/api/artists")
if echo "$artists_response" | jq -e '.lastUpdated' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""
echo "=========================================="
echo "Test Results Summary"
echo "=========================================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "\n${YELLOW}Pass rate: $PASS_RATE%${NC}"
    exit 1
fi