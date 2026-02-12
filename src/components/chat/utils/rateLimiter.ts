export class RateLimiter {
    private lastCall = 0;
    
    constructor(private minInterval: number = 1000) {}
    
    canProceed(): boolean {
        const now = Date.now();
        if (now - this.lastCall < this.minInterval) return false;
        this.lastCall = now;
        return true;
    }
    
    reset(): void {
        this.lastCall = 0;
    }
    
    timeUntilNext(): number {
        const elapsed = Date.now() - this.lastCall;
        return Math.max(0, this.minInterval - elapsed);
    }
}

export const chatRateLimiter = new RateLimiter(500);
