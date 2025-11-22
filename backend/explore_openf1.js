const axios = require('axios');

const OPENF1_URL = 'https://api.openf1.org/v1';

async function explore() {
    console.log('Exploring OpenF1 API for Driver Data...');

    try {
        // 1. Get the last race session
        const sessionsRes = await axios.get(`${OPENF1_URL}/sessions?year=2024&session_name=Race`);
        const sessions = sessionsRes.data;
        if (sessions.length === 0) return;
        
        const lastSession = sessions[sessions.length - 1];
        console.log(`Last Session: ${lastSession.session_name} (Key: ${lastSession.session_key})`);

        // 2. Get drivers for this session
        console.log('\n--- Fetching drivers ---');
        const driversRes = await axios.get(`${OPENF1_URL}/drivers?session_key=${lastSession.session_key}`);
        
        if (driversRes.data.length > 0) {
            console.log('Sample Driver Entry:', driversRes.data[0]);
        } else {
            console.log('No driver data found.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

explore();
