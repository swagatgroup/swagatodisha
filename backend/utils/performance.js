const os = require('os');
const process = require('process');

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                averageResponseTime: 0
            },
            memory: {
                used: 0,
                total: 0,
                percentage: 0
            },
            cpu: {
                usage: 0,
                loadAverage: []
            },
            database: {
                connections: 0,
                queries: 0,
                slowQueries: 0
            }
        };

        this.startTime = Date.now();
        this.responseTimes = [];
    }

    // Record request metrics
    recordRequest(responseTime, success = true) {
        this.metrics.requests.total++;
        if (success) {
            this.metrics.requests.successful++;
        } else {
            this.metrics.requests.failed++;
        }

        this.responseTimes.push(responseTime);

        // Keep only last 1000 response times for average calculation
        if (this.responseTimes.length > 1000) {
            this.responseTimes.shift();
        }

        this.metrics.requests.averageResponseTime =
            this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    }

    // Get current memory usage
    getMemoryUsage() {
        const memUsage = process.memoryUsage();
        const totalMem = os.totalmem();

        this.metrics.memory.used = memUsage.heapUsed;
        this.metrics.memory.total = totalMem;
        this.metrics.memory.percentage = (memUsage.heapUsed / totalMem) * 100;

        return this.metrics.memory;
    }

    // Get CPU usage
    getCpuUsage() {
        const cpus = os.cpus();
        const loadAvg = os.loadavg();

        this.metrics.cpu.loadAverage = loadAvg;

        // Calculate CPU usage percentage
        let totalIdle = 0;
        let totalTick = 0;

        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });

        this.metrics.cpu.usage = 100 - ~~(100 * totalIdle / totalTick);

        return this.metrics.cpu;
    }

    // Get system uptime
    getUptime() {
        return {
            process: process.uptime(),
            system: os.uptime(),
            startTime: this.startTime
        };
    }

    // Get all metrics
    getAllMetrics() {
        return {
            ...this.metrics,
            memory: this.getMemoryUsage(),
            cpu: this.getCpuUsage(),
            uptime: this.getUptime(),
            timestamp: new Date().toISOString()
        };
    }

    // Performance middleware
    performanceMiddleware() {
        return (req, res, next) => {
            const startTime = Date.now();

            // Override res.end to capture response time
            const originalEnd = res.end.bind(res);
            res.end = function (chunk, encoding) {
                const responseTime = Date.now() - startTime;
                const success = res.statusCode < 400;

                // Record metrics
                this.recordRequest(responseTime, success);

                // Call original end
                originalEnd(chunk, encoding);
            }.bind(this);

            next();
        };
    }

    // Database query monitoring
    recordDatabaseQuery(queryTime, isSlow = false) {
        this.metrics.database.queries++;
        if (isSlow) {
            this.metrics.database.slowQueries++;
        }
    }

    // Get performance recommendations
    getRecommendations() {
        const recommendations = [];
        const metrics = this.getAllMetrics();

        // Memory recommendations
        if (metrics.memory.percentage > 80) {
            recommendations.push({
                type: 'memory',
                priority: 'high',
                message: 'High memory usage detected. Consider optimizing memory usage or increasing server resources.',
                current: `${metrics.memory.percentage.toFixed(1)}%`,
                threshold: '80%'
            });
        }

        // Response time recommendations
        if (metrics.requests.averageResponseTime > 1000) {
            recommendations.push({
                type: 'response_time',
                priority: 'high',
                message: 'Slow response times detected. Consider optimizing database queries or implementing caching.',
                current: `${metrics.requests.averageResponseTime.toFixed(0)}ms`,
                threshold: '1000ms'
            });
        }

        // Error rate recommendations
        const errorRate = (metrics.requests.failed / metrics.requests.total) * 100;
        if (errorRate > 5) {
            recommendations.push({
                type: 'error_rate',
                priority: 'high',
                message: 'High error rate detected. Check application logs for issues.',
                current: `${errorRate.toFixed(1)}%`,
                threshold: '5%'
            });
        }

        // CPU recommendations
        if (metrics.cpu.usage > 80) {
            recommendations.push({
                type: 'cpu',
                priority: 'medium',
                message: 'High CPU usage detected. Consider optimizing code or scaling resources.',
                current: `${metrics.cpu.usage.toFixed(1)}%`,
                threshold: '80%'
            });
        }

        // Database recommendations
        const slowQueryRate = (metrics.database.slowQueries / metrics.database.queries) * 100;
        if (slowQueryRate > 10) {
            recommendations.push({
                type: 'database',
                priority: 'medium',
                message: 'High slow query rate detected. Consider optimizing database queries or adding indexes.',
                current: `${slowQueryRate.toFixed(1)}%`,
                threshold: '10%'
            });
        }

        return recommendations;
    }

    // Health check
    getHealthStatus() {
        const metrics = this.getAllMetrics();
        const recommendations = this.getRecommendations();

        const criticalIssues = recommendations.filter(r => r.priority === 'high');
        const warningIssues = recommendations.filter(r => r.priority === 'medium');

        let status = 'healthy';
        if (criticalIssues.length > 0) {
            status = 'critical';
        } else if (warningIssues.length > 0) {
            status = 'warning';
        }

        return {
            status,
            metrics,
            recommendations,
            criticalIssues: criticalIssues.length,
            warningIssues: warningIssues.length
        };
    }

    // Reset metrics
    reset() {
        this.metrics = {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                averageResponseTime: 0
            },
            memory: {
                used: 0,
                total: 0,
                percentage: 0
            },
            cpu: {
                usage: 0,
                loadAverage: []
            },
            database: {
                connections: 0,
                queries: 0,
                slowQueries: 0
            }
        };
        this.responseTimes = [];
        this.startTime = Date.now();
    }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;
