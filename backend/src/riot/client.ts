import 'dotenv/config';

export type platform = 'na1' | 'br1' | 'eun1' | 'euw1' | 'jp1' | 'kr' | 'la1' | 'la2' | 'oc1' | 'tr1' | 'ru1';
export type region = 'americas' | 'asia' | 'europe' | 'sea';
export type apiResult = 'success' | 'developerError' | 'serviceError' | 'notFound'

const riotApiKey = process.env.RIOT_TOKEN || '';
if (!riotApiKey) {
    throw new Error('RIOT_TOKEN is not set in environment variables');
}

class RateLimiter {
    private requests: Map<string, number[]> = new Map();
    private queues: Map<string, (() => Promise<void>)[]> = new Map();
    private processing: Map<string, boolean> = new Map();

    private async wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async checkLimits(platform: string): Promise<number> {
        const now = Date.now();
        if (!this.requests.has(platform)) this.requests.set(platform, []);

        let timestamps = this.requests.get(platform)!;

        // Filter out timestamps older than 2 minutes
        timestamps = timestamps.filter(t => now - t < 120000);
        this.requests.set(platform, timestamps);

        const lastSecond = timestamps.filter(t => now - t < 1000).length;
        const lastTwoMinutes = timestamps.length;

        if (lastSecond >= 20) return 1000 - (now - timestamps[timestamps.length - 20]);
        if (lastTwoMinutes >= 100) return 120000 - (now - timestamps[0]);

        return 0;
    }

    async throttle<T>(platform: string, fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            if (!this.queues.has(platform)) this.queues.set(platform, []);
            this.queues.get(platform)!.push(async () => {
                try {
                    let waitTime = await this.checkLimits(platform);
                    while (waitTime > 0) {
                        await this.wait(waitTime);
                        waitTime = await this.checkLimits(platform);
                    }

                    this.requests.get(platform)!.push(Date.now());

                    let retryCount = 0;
                    while (retryCount < 3) {
                        const result: any = await fn();
                        if (result.status === 429) {
                            const retryAfter = parseInt(result.headers.get('Retry-After') || '1') * 1000;
                            console.log(`Rate limited on ${platform}. Waiting ${retryAfter}ms before retry...`);
                            await this.wait(retryAfter);
                            retryCount++;
                            continue;
                        }
                        resolve(result);
                        return;
                    }
                    reject(new Error('Max retries reached after 429s'));
                } catch (err) {
                    reject(err);
                }
            });

            this.processQueue(platform);
        });
    }

    private async processQueue(platform: string) {
        if (this.processing.get(platform)) return;
        this.processing.set(platform, true);

        const queue = this.queues.get(platform)!;
        while (queue.length > 0) {
            const task = queue.shift()!;
            await task();
        }

        this.processing.set(platform, false);
    }
}

const limiter = new RateLimiter();

export const riotApi = {
    apiKey: riotApiKey,



    async makeRequest(endpoint: string, platform: platform | region) {
        const url = `https://${platform}.api.riotgames.com${endpoint}`;

        const response = await limiter.throttle(platform, () => fetch(url, {
            headers: { 'X-Riot-Token': this.apiKey }
        }));

        if (!response.ok) {
            if (response.status === 401) {
                return {
                    result: 'developerError' as apiResult,
                    data: { message: 'Invalid API key' }
                }
            }
            if (response.status === 404) {
                return {
                    result: 'notFound' as apiResult,
                    data: { message: 'Resource not found' }
                }
            }
            if (response.status >= 500) {
                return {
                    result: 'serviceError' as apiResult,
                    data: { message: 'Riot Games service error' }
                }
            }
            return {
                result: 'developerError' as apiResult,
                data: { message: `HTTP error ${response.status}` }
            }
        }

        const data = await response.json();

        return {
            result: 'success' as apiResult,
            data: data
        }

    }
}

export type RiotApi = typeof riotApi;

