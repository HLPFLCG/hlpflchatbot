#!/bin/bash
# HLPFL Chatbot API Test Suite
# Usage: chmod +x API_Testing_Script.sh && ./API_Testing_Script.sh

echo "======================================"
echo "HLPFL Chatbot API Test Suite"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0
WARNINGS=0

# Function to print section header
print_section() {
    echo ""
    echo -e "${BLUE}$1${NC}"
    echo "$(printf '%.0s-' {1..50})"
}

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected HTTP $expected_status, got $response)"
        ((FAILED++))
    fi
}

# Function to test JSON response
test_json_response() {
    local name=$1
    local url=$2
    local expected_field=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s "$url")
    
    if echo "$response" | grep -q "$expected_field"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected field '$expected_field' not found)"
        echo "Response: $response"
        ((FAILED++))
    fi
}

# Function to test POST endpoint
test_post_endpoint() {
    local name=$1
    local url=$2
    local data=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -X POST "$url" \
        -H "Content-Type: application/json" \
        -d "$data" \
        -w "\n%{http_code}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        echo "Response: $body"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "Response: $body"
        ((FAILED++))
    fi
}

# Start testing
print_section "1. Basic Connectivity Tests"
test_endpoint "Root Endpoint" "https://hlpfl.io" 200
test_endpoint "Health Endpoint" "https://hlpfl.io/api/health" 200
test_endpoint "Docs Endpoint" "https://hlpfl.io/api/docs" 200
test_endpoint "Services Endpoint" "https://hlpfl.io/api/services" 200

print_section "2. JSON Response Validation"
test_json_response "Root Message" "https://hlpfl.io" "HLPFL Records Chatbot API"
test_json_response "Health Status" "https://hlpfl.io/api/health" "healthy"
test_json_response "Version Info" "https://hlpfl.io" "version"
test_json_response "Company Name" "https://hlpfl.io/api/health" "HLPFL Records"
test_json_response "Location Info" "https://hlpfl.io/api/health" "Grand Rapids"

print_section "3. Chat Endpoint Tests"
echo "Testing chat endpoint with sample message..."
test_post_endpoint "Chat Message" "https://hlpfl.io/api/chat" '{"message":"Hello, I want to submit my music","sessionId":"test-session-123"}'

print_section "4. Response Time Tests"
echo -n "Measuring API response time... "
start_time=$(date +%s%N)
curl -s "https://hlpfl.io/api/health" > /dev/null
end_time=$(date +%s%N)
elapsed=$((($end_time - $start_time) / 1000000))

if [ $elapsed -lt 500 ]; then
    echo -e "${GREEN}✓ PASSED${NC} (${elapsed}ms - Excellent)"
    ((PASSED++))
elif [ $elapsed -lt 1000 ]; then
    echo -e "${YELLOW}⚠ WARNING${NC} (${elapsed}ms - Acceptable but could be faster)"
    ((WARNINGS++))
else
    echo -e "${RED}✗ FAILED${NC} (${elapsed}ms - Too slow)"
    ((FAILED++))
fi

print_section "5. Website Integration Tests"
test_endpoint "Main Website" "https://hlpfl.org" 200
test_endpoint "About Page" "https://hlpfl.org/about/" 200
test_endpoint "Contact Page" "https://hlpfl.org/contact/" 200
test_endpoint "Artists Page" "https://hlpfl.org/artists/" 200

print_section "6. CORS Headers Check"
echo -n "Checking CORS headers... "
cors_header=$(curl -s -I "https://hlpfl.io/api/health" | grep -i "access-control-allow-origin")
if [ -n "$cors_header" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "  $cors_header"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (CORS headers not found - may cause issues)"
    ((WARNINGS++))
fi

print_section "7. SSL/TLS Certificate Check"
echo -n "Checking SSL certificate... "
ssl_check=$(curl -s -I "https://hlpfl.io" | head -n1)
if echo "$ssl_check" | grep -q "200"; then
    echo -e "${GREEN}✓ PASSED${NC} (SSL working correctly)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (SSL issue detected)"
    ((FAILED++))
fi

print_section "8. API Versioning Check"
echo "Checking API version consistency..."
root_version=$(curl -s "https://hlpfl.io" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
health_version=$(curl -s "https://hlpfl.io/api/health" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)

echo "Root endpoint version: $root_version"
echo "Health endpoint version: $health_version"

if [ "$root_version" = "$health_version" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (Versions match)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (Version mismatch detected)"
    ((WARNINGS++))
fi

# Summary
echo ""
echo "======================================"
echo "Test Summary"
echo "======================================"
echo -e "Passed:   ${GREEN}$PASSED${NC}"
echo -e "Failed:   ${RED}$FAILED${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

# Calculate success rate
total=$((PASSED + FAILED + WARNINGS))
if [ $total -gt 0 ]; then
    success_rate=$((PASSED * 100 / total))
    echo "Success Rate: $success_rate%"
fi

echo ""

# Final verdict
if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✓ All tests passed! Your API is working perfectly.${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠ Tests passed with warnings. Review warnings above.${NC}"
        exit 0
    fi
else
    echo -e "${RED}✗ Some tests failed. Please review and fix the issues above.${NC}"
    exit 1
fi