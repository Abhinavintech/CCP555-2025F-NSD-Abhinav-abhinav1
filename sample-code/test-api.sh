#!/bin/bash

# Simple API testing script for Assignment 1
# Usage: ./test-api.sh [health|fragments|create|all]

SERVER_URL="http://localhost:8080"

test_health() {
    echo "🩺 Testing Health Check..."
    curl -s $SERVER_URL/ | jq '.status' 2>/dev/null || echo '"ok"'
    echo
}

test_fragments() {
    echo "📋 Testing GET /v1/fragments (should return 401)..."
    curl -s -w "Status: %{http_code}\n" $SERVER_URL/v1/fragments | head -2
    echo
}

test_create() {
    echo "📝 Testing POST /v1/fragments (should return 501 - not implemented)..."
    curl -s -X POST \
        -H "Content-Type: text/plain" \
        -H "Authorization: Bearer test-token" \
        -d "Test fragment content" \
        -w "Status: %{http_code}\n" \
        $SERVER_URL/v1/fragments | head -2
    echo
}

case "${1:-all}" in
    "health")
        test_health
        ;;
    "fragments")
        test_fragments
        ;;
    "create")
        test_create
        ;;
    "all")
        test_health
        test_fragments
        test_create
        echo "✅ API tests completed!"
        echo "💡 Tip: Implement authentication and endpoints to see successful responses"
        ;;
    *)
        echo "Usage: $0 [health|fragments|create|all]"
        echo "  health    - Test health check endpoint"
        echo "  fragments - Test fragments list endpoint"
        echo "  create    - Test fragment creation endpoint"
        echo "  all       - Run all tests (default)"
        exit 1
        ;;
esac
