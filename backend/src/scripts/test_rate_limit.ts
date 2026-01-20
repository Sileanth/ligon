import { riotApi } from '../riot/client.js';

async function testRateLimit() {
    console.log('Starting rate limit test...');
    const startTime = Date.now();

    console.log("We'll try to make 110 requests to the same region to trigger both limits");
    console.log("20req/1s should trigger around the 21st request");
    console.log("100req/2min should trigger around the 101st request");

    const promises = [];
    for (let i = 0; i < 110; i++) {
        promises.push(
            riotApi.makeRequest('/lol/status/v4/platform-data', 'euw1')
                .then(res => {
                    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
                    console.log(`[${elapsed}s] Request ${i + 1} finished with result: ${res.result}`);
                    return res;
                })
        );
    }

    console.log(`Dispatched 110 requests. Monitoring progress...`);
    const results = await Promise.all(promises);

    const successCount = results.filter(r => r.result === 'success').length;
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\nTest Finished!`);
    console.log(`Total time: ${totalTime}s`);
    console.log(`Successful requests: ${successCount}/110`);

    if (successCount === 110) {
        console.log('SUCCESS: Rate limiter correctly queued and finished all requests.');
    } else {
        console.log('FAILURE: Some requests did not finish successfully.');
    }
}

testRateLimit().catch(console.error);
