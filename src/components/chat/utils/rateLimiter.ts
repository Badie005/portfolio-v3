export class RateLimiter {
    canProceed(): boolean {
        return true;
    }
    
    reset(): void {}
    
    timeUntilNext(): number {
        return 0;
    }
}

export const chatRateLimiter = new RateLimiter();
