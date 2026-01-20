import { gatherTopTierMatches, getBanMap, analyzeToptierMatches, analyzeChampionGroup } from '../services/gather_top_tier.js';
import * as fs from 'fs/promises';

async function main() {
    console.log('Starting gather top tier test...');

    try {
        console.log('Gathering matches (this might take a while)...');
        const { matches, size } = await gatherTopTierMatches();
        const matchesArray = Array.from(matches);
        console.log(`Gathered ${matchesArray.length} matches from ${size} unique IDs.`);

        if (matchesArray.length === 0) {
            console.log('No matches found. Skipping analysis.');
            return;
        }

        console.log('Generating ban map...');
        const banMap = getBanMap(matchesArray);
        console.log(`Ban map generated for ${banMap.size} champions.`);

        console.log('Grouping matches by champion...');
        const { championGroups } = await analyzeToptierMatches();
        console.log(`Found ${championGroups.size} unique champions in participants.`);

        const allResults: any[] = [];
        const championStats: Record<string, any> = {};

        console.log(`Analyzing all ${championGroups.size} champions...`);

        for (const [champId, champMatches] of championGroups.entries()) {
            const bans = banMap.get(champId) || 0;
            const results = await analyzeChampionGroup(champId, champMatches, bans, size);

            results.forEach(res => {
                allResults.push(res.tierlist);
                // We'll store the stats for the champion in a map, 
                // typically the one with the most games if multiple roles exist.
                if (!championStats[res.stats.name] || res.tierlist.games > (championStats[res.stats.name].games || 0)) {
                    championStats[res.stats.name] = { ...res.stats, games: res.tierlist.games };
                }
            });
        }

        const finalData = {
            tierlist: allResults,
            championStats,
            totalMatches: size,
            updatedAt: new Date().toISOString()
        };

        const outputPath = 'top_tier_analysis.json';
        await fs.writeFile(outputPath, JSON.stringify(finalData, null, 2));
        console.log(`\nResults saved to ${outputPath}`);
        console.log(`Analyzed ${Object.keys(championStats).length} champions.`);

        console.log('\nTest completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

main();
