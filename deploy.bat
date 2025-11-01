@echo off
echo 🚀 Cognify MCP Server Deployment Script

echo.
echo 📦 Building Backend...
cd apps\backend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Backend build failed
    exit /b 1
)

echo.
echo 📦 Building MCP Server...
cd ..\mcp-server
call npm run build
if %errorlevel% neq 0 (
    echo ❌ MCP Server build failed
    exit /b 1
)

echo.
echo ✅ Both services built successfully!

echo.
echo 🔧 Setting up environment files...
if not exist ".env" (
    echo ⚠️  Creating MCP server .env from template
    copy .env.production .env
)

cd ..\backend
if not exist ".env" (
    echo ⚠️  Creating backend .env from template  
    copy .env.production .env
)

echo.
echo ✅ Deployment setup complete!
echo.
echo 📋 Next steps:
echo 1. Edit .env files with your production values
echo 2. Start backend: cd apps\backend ^&^& npm start
echo 3. MCP server ready at: apps\mcp-server\dist\index.js
echo.
echo 📖 See DEPLOYMENT_READY.md for detailed instructions