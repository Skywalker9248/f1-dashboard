const f1Service = require('./services/f1Service');

async function test2025Data() {
    console.log('=== Testing 2025 F1 Data ===\n');
    
    try {
        console.log('Fetching driver standings...');
        const driverStandings = await f1Service.getDriverStandings();
        
        console.log('\n--- SEASON INFO ---');
        console.log('Season:', driverStandings.season);
        
        console.log('\n--- TOP 10 DRIVERS ---');
        driverStandings.standings.slice(0, 10).forEach(driver => {
            console.log(`${driver.position}. ${driver.driver} (${driver.team}) - ${driver.points} pts`);
        });
        
        console.log('\n--- CONSTRUCTOR STANDINGS ---');
        const constructorStandings = await f1Service.getConstructorStandings();
        constructorStandings.standings.slice(0, 5).forEach(team => {
            console.log(`${team.position}. ${team.team} - ${team.points} pts`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

test2025Data();
