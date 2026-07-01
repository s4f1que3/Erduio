import { Injectable } from "@nestjs/common";
import { HealthCheckService, MemoryHealthIndicator, DiskHealthIndicator } from "@nestjs/terminus";

@Injectable()
export class NestjsHealthService {

    constructor(
        private health: HealthCheckService,
        private memory: MemoryHealthIndicator,
        private disk: DiskHealthIndicator,
    ) {}

    async getHealth() {
        return this.health.check([
            // heap memory stays under 300MB
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

            // RSS memory stays under 500MB
            () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
            
            // disk has at least 10% free
            () => this.disk.checkStorage('disk', { thresholdPercent: 0.9, path: '/' }),
        ]);
    }
}
