import { Elysia } from 'elysia';

interface Metrics {
  requestCount: number;
  responseTime: number[];
  errorCount: number;
  activeConnections: number;
}

class MetricsCollector {
  private metrics: Metrics = {
    requestCount: 0,
    responseTime: [],
    errorCount: 0,
    activeConnections: 0,
  };

  incrementRequests(): void {
    this.metrics.requestCount++;
  }

  recordResponseTime(time: number): void {
    this.metrics.responseTime.push(time);
    // Keep only last 1000 entries for memory efficiency
    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime = this.metrics.responseTime.slice(-1000);
    }
  }

  incrementErrors(): void {
    this.metrics.errorCount++;
  }

  incrementConnections(): void {
    this.metrics.activeConnections++;
  }

  decrementConnections(): void {
    this.metrics.activeConnections--;
  }

  getMetrics(): Metrics & {
    averageResponseTime: number;
    p95ResponseTime: number;
    errorRate: number;
  } {
    const avgResponseTime = this.metrics.responseTime.length > 0
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length
      : 0;

    const sortedTimes = [...this.metrics.responseTime].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p95ResponseTime = sortedTimes[p95Index] || 0;

    const errorRate = this.metrics.requestCount > 0
      ? (this.metrics.errorCount / this.metrics.requestCount) * 100
      : 0;

    return {
      ...this.metrics,
      averageResponseTime: avgResponseTime,
      p95ResponseTime: p95ResponseTime,
      errorRate: errorRate,
    };
  }

  reset(): void {
    this.metrics = {
      requestCount: 0,
      responseTime: [],
      errorCount: 0,
      activeConnections: 0,
    };
  }
}

export const metricsCollector = new MetricsCollector();

export const metricsMiddleware = () =>
  (app: Elysia) =>
    app
      .onBeforeHandle((ctx) => {
        const req = ctx.request as Request;
        const startTime = Date.now();
        req.headers.set('x-start-time', startTime.toString());
        metricsCollector.incrementRequests();
        metricsCollector.incrementConnections();
      })
      .onAfterHandle((ctx) => {
        const req = ctx.request as Request;
        const res = ctx.response as unknown as Response;
        const startTime = parseInt(req.headers.get('x-start-time') || '0');
        const responseTime = Date.now() - startTime;
        metricsCollector.recordResponseTime(responseTime);
        metricsCollector.decrementConnections();
        if (res.status >= 400) metricsCollector.incrementErrors();
      });