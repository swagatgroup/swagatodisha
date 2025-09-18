#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class RedisSystemSetup {
    constructor() {
        this.isWindows = process.platform === 'win32';
        this.isMac = process.platform === 'darwin';
        this.isLinux = process.platform === 'linux';
    }

    async setup() {
        console.log('🔧 Setting up Redis System for Swagat Odisha');
        console.log('============================================\n');

        try {
            // Check if Redis is installed
            await this.checkRedisInstallation();

            // Install Redis if needed
            await this.installRedis();

            // Start Redis server
            await this.startRedisServer();

            // Install Node.js dependencies
            await this.installDependencies();

            // Create necessary directories
            await this.createDirectories();

            // Set up environment variables
            await this.setupEnvironment();

            console.log('\n✅ Redis System setup completed successfully!');
            console.log('\n📋 Next Steps:');
            console.log('1. Start the Redis-powered server: npm run dev:redis');
            console.log('2. Run tests: npm run test:redis');
            console.log('3. Check health: curl http://localhost:5000/health');

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            process.exit(1);
        }
    }

    async checkRedisInstallation() {
        console.log('🔍 Checking Redis installation...');

        try {
            const version = execSync('redis-server --version', { encoding: 'utf8' });
            console.log('✅ Redis is already installed:', version.trim());
            return true;
        } catch (error) {
            console.log('❌ Redis is not installed');
            return false;
        }
    }

    async installRedis() {
        console.log('📦 Installing Redis...');

        try {
            if (this.isWindows) {
                console.log('   Windows detected. Please install Redis manually:');
                console.log('   1. Download from: https://github.com/microsoftarchive/redis/releases');
                console.log('   2. Or use Chocolatey: choco install redis-64');
                console.log('   3. Or use WSL with Ubuntu');
                throw new Error('Redis installation required on Windows');
            } else if (this.isMac) {
                console.log('   Installing Redis using Homebrew...');
                execSync('brew install redis', { stdio: 'inherit' });
            } else if (this.isLinux) {
                console.log('   Installing Redis using apt...');
                execSync('sudo apt update', { stdio: 'inherit' });
                execSync('sudo apt install redis-server -y', { stdio: 'inherit' });
            }

            console.log('✅ Redis installed successfully');
        } catch (error) {
            console.error('❌ Failed to install Redis:', error.message);
            throw error;
        }
    }

    async startRedisServer() {
        console.log('🚀 Starting Redis server...');

        try {
            // Check if Redis is already running
            try {
                execSync('redis-cli ping', { encoding: 'utf8' });
                console.log('✅ Redis server is already running');
                return;
            } catch (error) {
                // Redis is not running, start it
            }

            if (this.isWindows) {
                console.log('   Please start Redis manually on Windows');
                console.log('   Or use: redis-server');
            } else {
                // Start Redis in background
                const redisProcess = execSync('redis-server --daemonize yes', { stdio: 'inherit' });
                console.log('✅ Redis server started');
            }

            // Wait a moment for Redis to start
            await this.sleep(2000);

            // Verify Redis is running
            const ping = execSync('redis-cli ping', { encoding: 'utf8' });
            if (ping.trim() === 'PONG') {
                console.log('✅ Redis server is responding');
            } else {
                throw new Error('Redis server is not responding');
            }

        } catch (error) {
            console.error('❌ Failed to start Redis server:', error.message);
            throw error;
        }
    }

    async installDependencies() {
        console.log('📦 Installing Node.js dependencies...');

        try {
            execSync('npm install', { stdio: 'inherit' });
            console.log('✅ Dependencies installed successfully');
        } catch (error) {
            console.error('❌ Failed to install dependencies:', error.message);
            throw error;
        }
    }

    async createDirectories() {
        console.log('📁 Creating necessary directories...');

        const directories = [
            'uploads',
            'uploads/documents',
            'uploads/processed',
            'uploads/pdfs',
            'uploads/temp',
            'logs'
        ];

        directories.forEach(dir => {
            const dirPath = path.join(__dirname, '..', dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`   ✅ Created directory: ${dir}`);
            } else {
                console.log(`   ✅ Directory already exists: ${dir}`);
            }
        });
    }

    async setupEnvironment() {
        console.log('⚙️  Setting up environment variables...');

        const envPath = path.join(__dirname, '..', '.env');
        const envExamplePath = path.join(__dirname, '..', 'env.example');

        if (!fs.existsSync(envPath)) {
            if (fs.existsSync(envExamplePath)) {
                fs.copyFileSync(envExamplePath, envPath);
                console.log('   ✅ Created .env file from example');
            } else {
                // Create basic .env file
                const envContent = `# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/swagatodisha

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# API Configuration
API_URL=http://localhost:5000
`;
                fs.writeFileSync(envPath, envContent);
                console.log('   ✅ Created basic .env file');
            }
        } else {
            console.log('   ✅ .env file already exists');
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    const setup = new RedisSystemSetup();
    setup.setup().catch(console.error);
}

module.exports = RedisSystemSetup;
