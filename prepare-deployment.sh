#!/bin/bash

# Traveler-Site - Prepare Deployment Package
# This script builds and prepares Next.js for deployment

echo "🚀 Preparing Traveler-Site for Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the traveler-site directory"
    exit 1
fi

# Check if Next.js project
if ! grep -q "\"next\"" package.json; then
    echo -e "${RED}❌ Error: This doesn't appear to be a Next.js project${NC}"
    exit 1
fi

echo "1️⃣  Checking Next.js configuration..."
if grep -q "output.*standalone" next.config.ts; then
    echo -e "${GREEN}✅ Standalone mode enabled${NC}"
else
    echo -e "${RED}❌ Standalone mode not enabled in next.config.ts${NC}"
    echo "   Please add: output: 'standalone'"
    exit 1
fi
echo ""

echo "2️⃣  Cleaning previous builds..."
rm -rf .next out node_modules/.cache
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

echo "3️⃣  Installing dependencies..."
pnpm install --prod
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo "4️⃣  Building Next.js application..."
pnpm build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"
echo ""

echo "5️⃣  Verifying standalone output..."
if [ -f ".next/standalone/server.js" ]; then
    echo -e "${GREEN}✅ Standalone server.js found${NC}"
else
    echo -e "${RED}❌ Standalone server.js not found${NC}"
    exit 1
fi
echo ""

echo "6️⃣  Preparing deployment package..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="traveler-site_${TIMESTAMP}.tar.gz"

# Create deployment package
tar -czf "../${PACKAGE_NAME}" \
    .next/standalone \
    .next/static \
    public \
    ecosystem.config.js \
    .env.example \
    package.json \
    2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Package created: ../${PACKAGE_NAME}${NC}"

    # Show file size
    SIZE=$(ls -lh "../${PACKAGE_NAME}" | awk '{print $5}')
    echo "   File size: ${SIZE}"

    # Show full path
    FULL_PATH=$(cd .. && pwd)/${PACKAGE_NAME}
    echo "   Full path: ${FULL_PATH}"
else
    echo -e "${RED}❌ Failed to create package${NC}"
    exit 1
fi
echo ""

echo "7️⃣  Deployment instructions:"
echo "   1. Upload ${PACKAGE_NAME} to VPS"
echo "   2. Extract to /www/wwwroot/traveler-site"
echo "   3. Copy static files:"
echo "      cd /www/wwwroot/traveler-site"
echo "      cp -r .next/static .next/standalone/.next/"
echo "      cp -r public .next/standalone/"
echo "   4. Create .env file"
echo "   5. Start PM2: pm2 start ecosystem.config.js"
echo ""

echo "=========================================="
echo -e "${GREEN}🎉 Ready for deployment!${NC}"
echo ""
echo "Package: ${FULL_PATH}"
echo "=========================================="
