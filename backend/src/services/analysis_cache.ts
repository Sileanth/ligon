import * as fs from 'fs/promises';
import path from 'path';

interface AnalysisData {
    tierlist: any[];
    championStats: Record<string, any>;
    totalMatches: number;
    updatedAt: string;
}

let cachedData: AnalysisData | null = null;
let lastLoaded: number = 0;
const CACHE_DURATION = 10 * 60 * 1000;
export async function getAnalysisData(): Promise<AnalysisData | null> {
    const now = Date.now();

    if (cachedData && (now - lastLoaded < CACHE_DURATION)) {
        return cachedData;
    }

    try {
        const filePath = path.join(process.cwd(), 'top_tier_analysis.json');
        const content = await fs.readFile(filePath, 'utf-8');
        cachedData = JSON.parse(content);
        lastLoaded = now;
        return cachedData;
    } catch (error) {
        console.error('Error loading top_tier_analysis.json:', error);
        return null;
    }
}
