
/**
 * LOMUZ SMOKE TEST
 * Executa um ciclo completo de vida de uma rádio para validar a integridade do sistema.
 * Requisito: O servidor deve estar rodando (npm start).
 * Uso: npm run smoke:test
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
require('dotenv').config();

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m'
};

const log = (msg, type = 'info') => {
    const color = type === 'success' ? colors.green : type === 'error' ? colors.red : colors.yellow;
    console.log(`${color}[${type.toUpperCase()}] ${msg}${colors.reset}`);
};

async function run() {
    let token = '';
    let streamId = '';

    try {
        log('Starting Lomuz Smoke Tests...', 'info');

        // 1. Healthcheck
        log('1. Checking Database Health...');
        try {
            const health = await fetch(`${BASE_URL}/health/db`).then(r => r.json());
            if (!health.ok) throw new Error('Database Healthcheck Failed');
            log('Database OK', 'success');
        } catch (e) {
            throw new Error(`Connection Error: ${e.message}. Is server running?`);
        }

        // 2. Authentication (Login as Director)
        log('2. Authenticating...');
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                login: 'diretor@lomuz.com', // Credencial padrão do seed
                senha: 'admin123',
                tipo: 'diretor'
            })
        });
        
        if (loginRes.status !== 200) {
            const txt = await loginRes.text();
            throw new Error(`Login Failed: ${loginRes.status} - ${txt}`);
        }
        const loginData = await loginRes.json();
        token = loginData.token;
        log(`Authenticated as ${loginData.user.name}`, 'success');

        // 3. Create Stream
        log('3. Creating Test Stream...');
        const streamRes = await fetch(`${BASE_URL}/v1/streams`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Smoke Test Radio ' + Date.now()
            })
        });
        
        if (streamRes.status !== 200) throw new Error(`Stream Creation Failed: ${streamRes.status}`);
        const streamData = await streamRes.json();
        streamId = streamData.id;
        log(`Stream Created: ${streamId}`, 'success');

        // 4. Save Step 3 (Configuration)
        log('4. Saving Step 3 Configuration...');
        const step3Res = await fetch(`${BASE_URL}/v1/streams/${streamId}/step3`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                attractions: {
                    horaCerta: { active: true, mode: 'RECURRENCE', recurrenceInterval: 30 }
                }
            })
        });
        if (step3Res.status !== 200) throw new Error('Step 3 Save Failed');
        log('Step 3 Configured', 'success');

        // 5. Billing Activation (Mock if enabled)
        if (process.env.BILLING_ENABLED === 'true') {
            log('5. Activating Billing (Mock)...');
            const billRes = await fetch(`${BASE_URL}/v1/billing/activate`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    stream_id: streamId,
                    plan_code: 'SMOKE_TEST',
                    contracted_accesses: 10,
                    currency: 'BRL',
                    price_cents: 0,
                    gateway: 'INTERNAL'
                })
            });
            if (billRes.status !== 200) throw new Error('Billing Activation Failed');
            log('Billing Activated', 'success');
        } else {
            log('5. Billing Skipped (Disabled in ENV)', 'info');
        }

        // 6. Generate Manifest
        log('6. Generating Manifest...');
        const manifestRes = await fetch(`${BASE_URL}/v1/streams/${streamId}/manifest`);
        if (manifestRes.status !== 200) {
            const err = await manifestRes.text();
            throw new Error(`Manifest Generation Failed: ${err}`);
        }
        const manifest = await manifestRes.json();
        
        if (!manifest.stream_id || manifest.stream_id !== streamId) {
            throw new Error('Invalid Manifest Content');
        }
        log(`Manifest Generated. Items in queue: ${manifest.queue.length}`, 'success');

        // 7. Check Access (Player Auth)
        log('7. Checking Access...');
        const accessRes = await fetch(`${BASE_URL}/v1/streams/${streamId}/access/check`);
        const accessData = await accessRes.json();
        if (!accessData.allowed) throw new Error('Access Denied');
        log('Access Validated', 'success');

        // 8. System Readiness Check
        log('8. Checking System Readiness Endpoint...');
        const readyRes = await fetch(`${BASE_URL}/v1/system/readiness`);
        const readyData = await readyRes.json();
        
        if (readyData.status !== 'OK') {
            log('System Reports Issues:', 'error');
            console.table(readyData.warnings);
            // Non-blocking warning for smoke test, unless status is FAIL
            if (readyData.status === 'FAIL') throw new Error('System Readiness Failed');
        } else {
            log('System Readiness OK', 'success');
        }

        console.log('\n-----------------------------------');
        log('ALL SMOKE TESTS PASSED', 'success');
        console.log('-----------------------------------');
        process.exit(0);

    } catch (error) {
        console.error('\n-----------------------------------');
        log(`TEST FAILED: ${error.message}`, 'error');
        console.error('-----------------------------------');
        process.exit(1);
    }
}

run();
