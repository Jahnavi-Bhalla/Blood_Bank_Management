const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Initial Relational In-Memory Dataset (replaces any NoSQL/MongoDB layers)
let db = {
  donors: [
    { donor_id: 'D101', name: 'Dr. Aravind Swaminathan', blood_group: 'O-', age: 28, gender: 'Male', phone: '+91 98401 23456', email: 'aravind.s@vit.ac.in', city: 'Chennai', hemoglobin: 14.5, last_donation: '2026-08-10', status: 'Eligible', total_donations: 6 },
    { donor_id: 'D102', name: 'Priyanka Sundaram', blood_group: 'A+', age: 24, gender: 'Female', phone: '+91 97890 87654', email: 'priyanka.s@gmail.com', city: 'Vellore', hemoglobin: 13.2, last_donation: '2026-09-02', status: 'Eligible', total_donations: 3 },
    { donor_id: 'D103', name: 'Karthik Ramanathan', blood_group: 'B+', age: 32, gender: 'Male', phone: '+91 94441 54321', email: 'karthik.r@yahoo.com', city: 'Chennai', hemoglobin: 15.1, last_donation: '2026-07-15', status: 'Eligible', total_donations: 8 },
    { donor_id: 'D104', name: 'Sneha Narayanan', blood_group: 'AB-', age: 22, gender: 'Female', phone: '+91 98840 99887', email: 'sneha.n@vit.ac.in', city: 'Bangalore', hemoglobin: 12.8, last_donation: '2026-06-20', status: 'Eligible', total_donations: 2 },
    { donor_id: 'D105', name: 'Manoj Kumar', blood_group: 'O+', age: 29, gender: 'Male', phone: '+91 99620 11223', email: 'manoj.k@outlook.com', city: 'Madurai', hemoglobin: 14.0, last_donation: '2026-09-28', status: 'Eligible', total_donations: 5 },
    { donor_id: 'D106', name: 'Deepa Krishnan', blood_group: 'A-', age: 35, gender: 'Female', phone: '+91 94432 44556', email: 'deepa.krish@gmail.com', city: 'Coimbatore', hemoglobin: 11.8, last_donation: '2026-10-01', status: 'Deferred', total_donations: 1 },
    { donor_id: 'D107', name: 'Venkatesh Prasad', blood_group: 'B-', age: 41, gender: 'Male', phone: '+91 98410 77889', email: 'v.prasad@health.in', city: 'Chennai', hemoglobin: 14.8, last_donation: '2026-05-12', status: 'Eligible', total_donations: 9 },
    { donor_id: 'D108', name: 'Ananya Raghavan', blood_group: 'AB+', age: 26, gender: 'Female', phone: '+91 97909 33221', email: 'ananya.ragh@vit.ac.in', city: 'Vellore', hemoglobin: 13.6, last_donation: '2026-08-25', status: 'Eligible', total_donations: 4 }
  ],
  blood_stock: {
    'A+': { units: 28, capacity: 50, minSafe: 15 },
    'A-': { units: 9, capacity: 30, minSafe: 12 },
    'B+': { units: 35, capacity: 50, minSafe: 15 },
    'B-': { units: 14, capacity: 30, minSafe: 10 },
    'AB+': { units: 22, capacity: 35, minSafe: 12 },
    'AB-': { units: 4, capacity: 25, minSafe: 8 },
    'O+': { units: 44, capacity: 60, minSafe: 20 },
    'O-': { units: 6, capacity: 35, minSafe: 12 }
  },
  hospital_requests: [
    { req_id: 'REQ-501', hospital: 'Apollo Specialty Hospital, Chennai', patient: 'Kavitha Shanmugam', blood_group: 'O-', component: 'Packed Red Cells', units: 2, urgency: 'Emergency STAT', status: 'Pending', date: '2026-10-12 18:45' },
    { req_id: 'REQ-502', hospital: 'CMC Hospital, Vellore', patient: 'Rahul Verma', blood_group: 'B+', component: 'Whole Blood', units: 3, urgency: 'High Priority', status: 'Approved', date: '2026-10-12 16:10' },
    { req_id: 'REQ-503', hospital: 'MIOT International, Chennai', patient: 'Divya Nair', blood_group: 'A+', component: 'Platelets', units: 1, urgency: 'Routine', status: 'Fulfilled', date: '2026-10-12 11:30' }
  ],
  dispatch_log: []
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// SQL Terminal Engine simulating JDBC PreparedStatement / ResultSetMetaData
function executeSqlQuery(sql) {
  const startTime = Date.now();
  const trimmed = sql.trim().replace(/;$/, '');
  const upper = trimmed.toUpperCase();

  if (upper.startsWith('SELECT')) {
    let rows = [];
    let tableName = '';

    if (upper.includes('FROM DONOR')) {
      tableName = 'DONOR';
      rows = [...db.donors];
    } else if (upper.includes('FROM BLOOD_STOCK') || upper.includes('FROM BLOOD_INVENTORY')) {
      tableName = 'BLOOD_STOCK';
      rows = Object.entries(db.blood_stock).map(([k, v]) => ({
        BLOOD_GROUP: k,
        UNITS_AVAILABLE: v.units,
        SAFE_CAPACITY: v.capacity,
        MIN_SAFE_LEVEL: v.minSafe,
        STATUS: v.units <= v.minSafe ? 'CRITICAL / LOW' : 'ADEQUATE'
      }));
    } else if (upper.includes('FROM HOSPITAL_REQUESTS')) {
      tableName = 'HOSPITAL_REQUESTS';
      rows = [...db.hospital_requests];
    } else if (upper.includes('FROM DISPATCH_LOG')) {
      tableName = 'DISPATCH_LOG';
      rows = [...db.dispatch_log];
    } else {
      return {
        status: 'error',
        code: 'ORA-00942',
        message: 'Table or view does not exist. Available tables: DONOR, BLOOD_STOCK, HOSPITAL_REQUESTS, DISPATCH_LOG.'
      };
    }

    // WHERE Clause filtering
    const whereMatch = trimmed.match(/WHERE\s+(.+?)(\s+ORDER\s+BY|\s*$)/i);
    if (whereMatch) {
      const clause = whereMatch[1].trim();
      const simpleFilter = clause.match(/([\w\s_]+)\s*(=|!=|<>|LIKE|>|<|>=|<=)\s*['"]?([^'"]+)['"]?/i);
      if (simpleFilter) {
        const rawCol = simpleFilter[1].trim().toLowerCase().replace(/\s+/g, '_');
        const op = simpleFilter[2];
        const val = simpleFilter[3].trim();

        rows = rows.filter(r => {
          let fieldVal = r[rawCol];
          if (fieldVal === undefined) {
            const foundKey = Object.keys(r).find(k => k.toLowerCase() === rawCol || k.toLowerCase().replace(/_/g, '') === rawCol.replace(/_/g, ''));
            if (foundKey) fieldVal = r[foundKey];
          }
          if (fieldVal === undefined) return true;

          const strField = String(fieldVal).toLowerCase();
          const strVal = val.toLowerCase();

          if (op === '=' || op === '==') return strField === strVal;
          if (op === '!=' || op === '<>') return strField !== strVal;
          if (op.toUpperCase() === 'LIKE') return strField.includes(strVal.replace(/%/g, ''));
          if (op === '>') return parseFloat(fieldVal) > parseFloat(val);
          if (op === '<') return parseFloat(fieldVal) < parseFloat(val);
          if (op === '>=') return parseFloat(fieldVal) >= parseFloat(val);
          if (op === '<=') return parseFloat(fieldVal) <= parseFloat(val);
          return true;
        });
      }
    }

    const columns = rows.length > 0 ? Object.keys(rows[0]).map(c => c.toUpperCase()) : ['RESULT'];
    return {
      status: 'success',
      type: 'SELECT',
      table: tableName,
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: (Date.now() - startTime) || 1
    };
  }

  if (upper.startsWith('INSERT')) {
    return {
      status: 'success',
      type: 'INSERT',
      rowsAffected: 1,
      message: '1 row inserted successfully. (PreparedStatement committed)',
      executionTimeMs: (Date.now() - startTime) || 1
    };
  }

  if (upper.startsWith('UPDATE')) {
    return {
      status: 'success',
      type: 'UPDATE',
      rowsAffected: 1,
      message: '1 row updated successfully. (PreparedStatement committed)',
      executionTimeMs: (Date.now() - startTime) || 1
    };
  }

  if (upper.startsWith('DELETE')) {
    return {
      status: 'success',
      type: 'DELETE',
      rowsAffected: 1,
      message: '1 row deleted successfully. (PreparedStatement committed)',
      executionTimeMs: (Date.now() - startTime) || 1
    };
  }

  if (upper.startsWith('COMMIT')) {
    return {
      status: 'success',
      type: 'TRANSACTION',
      message: 'Commit complete. All pending relational transactions saved.',
      executionTimeMs: (Date.now() - startTime) || 1
    };
  }

  if (upper.startsWith('ROLLBACK')) {
    return {
      status: 'success',
      type: 'TRANSACTION',
      message: 'Rollback complete. Active transaction reverted to savepoint.',
      executionTimeMs: (Date.now() - startTime) || 1
    };
  }

  return {
    status: 'error',
    code: 'ORA-00900',
    message: 'Invalid SQL statement. Expected SELECT, INSERT, UPDATE, DELETE, COMMIT, or ROLLBACK.'
  };
}

// Donor Health & Eligibility Assessment Processor
function assessDonorEligibility(data) {
  const age = Number(data.age) || 0;
  const weight = Number(data.weight) || 0;
  const hb = Number(data.hemoglobin) || 0;
  const systolic = Number(data.systolic) || 120;
  const diastolic = Number(data.diastolic) || 80;
  const pulse = Number(data.pulse) || 72;
  const daysSinceLast = Number(data.daysSinceLast) || 999;
  const gender = data.gender || 'Male';
  const bg = data.bloodGroup || 'O+';
  const hasTattoo = !!data.hasTattoo;
  const hasSurgery = !!data.hasSurgery;
  const hasAntibiotics = !!data.hasAntibiotics;

  const checks = {
    ageCheck: { pass: age >= 18 && age <= 65, label: 'Age Criteria (18–65 years)', value: `${age} yrs` },
    weightCheck: { pass: weight >= 50, label: 'Weight Criteria (Min 50 kg)', value: `${weight} kg` },
    hbCheck: { pass: hb >= 12.5, label: 'Hemoglobin Criteria (Min 12.5 g/dL)', value: `${hb} g/dL` },
    bpCheck: { pass: systolic >= 100 && systolic <= 140 && diastolic >= 60 && diastolic <= 90, label: 'Blood Pressure (100–140 / 60–90 mmHg)', value: `${systolic}/${diastolic} mmHg` },
    pulseCheck: { pass: pulse >= 60 && pulse <= 100, label: 'Pulse Rate (60–100 bpm)', value: `${pulse} bpm` },
    intervalCheck: {
      pass: gender === 'Female' ? daysSinceLast >= 120 : daysSinceLast >= 90,
      label: `Donation Interval (${gender === 'Female' ? '≥120 days female' : '≥90 days male'})`,
      value: `${daysSinceLast} days`
    },
    medicalCheck: {
      pass: !hasTattoo && !hasSurgery && !hasAntibiotics,
      label: 'Medical Questionnaire (No tattoo/surgery/antibiotics)',
      value: (!hasTattoo && !hasSurgery && !hasAntibiotics) ? 'Cleared' : 'Flagged'
    }
  };

  const deferrals = [];
  if (!checks.ageCheck.pass) deferrals.push(age < 18 ? 'Donor is below legal age (minimum 18 years required).' : 'Donor exceeds maximum whole blood age limit (65 years).');
  if (!checks.weightCheck.pass) deferrals.push('Donor weight is below 50 kg. Inadequate circulating blood volume for safe extraction.');
  if (!checks.hbCheck.pass) deferrals.push('Hemoglobin level is below 12.5 g/dL. Risk of post-donation anemia or fatigue.');
  if (!checks.bpCheck.pass) deferrals.push(`Blood pressure (${systolic}/${diastolic} mmHg) is outside safe range (100–140 / 60–90 mmHg).`);
  if (!checks.pulseCheck.pass) deferrals.push(`Pulse rate (${pulse} bpm) is outside normal resting range (60–100 bpm).`);
  if (!checks.intervalCheck.pass) deferrals.push(`Insufficient recovery interval (${daysSinceLast} days). Required: ${gender === 'Female' ? '120' : '90'} days.`);
  if (hasTattoo) deferrals.push('Tattoo / body piercing within past 6 months requires a temporary deferral period.');
  if (hasSurgery) deferrals.push('Recent major surgical procedure requires medical clearance deferral.');
  if (hasAntibiotics) deferrals.push('Current antibiotic or steroid medication requires a 7-day completion deferral.');

  const isEligible = deferrals.length === 0;

  // Circulating blood volume computation (Nadler formula approximation: Males ~70ml/kg, Females ~65ml/kg)
  const factor = gender === 'Female' ? 65 : 70;
  const circulatingVolume = Math.round(weight * factor);

  // Maximum Safe Donation Volume:
  // Up to 13% of blood volume, capped at standard Indian blood banking bag sizes: 350 mL (<60kg) or 450 mL (>=60kg)
  let maxVolume = 0;
  if (isEligible) {
    if (weight >= 60) {
      maxVolume = 450;
    } else {
      maxVolume = 350;
    }
  }

  // Component yield estimations
  const rbcYield = isEligible ? Math.round(maxVolume * 0.48) : 0;
  const ffpYield = isEligible ? Math.round(maxVolume * 0.40) : 0;
  const plateletYield = isEligible ? Math.round(maxVolume * 0.12) : 0;
  const livesSaved = isEligible ? 3 : 0;

  // Next eligible date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + (gender === 'Female' ? 120 : 90));

  // SQL DML statement generated
  const generatedDml = `
-- 1. Insert Donor Record
INSERT INTO DONOR (DONOR_ID, NAME, BLOOD_GROUP, AGE, GENDER, PHONE, CITY, HEMOGLOBIN, STATUS)
VALUES ('D${Math.floor(100 + Math.random() * 900)}', '${data.name || 'Anonymous'}', '${bg}', ${age}, '${gender}', '${data.phone || '+91 98401 00000'}', '${data.city || 'Chennai'}', ${hb}, '${isEligible ? 'Eligible' : 'Deferred'}');

-- 2. Record Unit Intake in BLOOD_BAGS Ledger
INSERT INTO BLOOD_BAGS (BAG_ID, DONOR_ID, BLOOD_GROUP, COMPONENT, VOLUME_ML, EXPIRY_DATE, STATUS)
VALUES ('BAG-${Math.floor(1000 + Math.random() * 9000)}', 'D109', '${bg}', 'Whole Blood', ${maxVolume}, SYSDATE + 35, 'Tested & Cleared');

-- 3. Increment Blood Stock
UPDATE BLOOD_STOCK SET UNITS_AVAILABLE = UNITS_AVAILABLE + 1 WHERE BLOOD_GROUP = '${bg}';
COMMIT;`.trim();

  return {
    isEligible,
    status: isEligible ? 'Eligible' : (deferrals.length > 0 && !checks.medicalCheck.pass ? 'Temporarily Deferred' : 'Deferred'),
    deferrals,
    checks,
    circulatingVolume,
    maxSafeDonationVolume: maxVolume,
    componentYield: {
      prbc: rbcYield,
      ffp: ffpYield,
      platelets: plateletYield
    },
    potentialLivesSaved: livesSaved,
    nextEligibleDate: nextDate.toISOString().split('T')[0],
    generatedDml
  };
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = parsedUrl.pathname;

  // =========================================================================
  // REST API ROUTING (Native JDBC / Relational Database Service)
  // =========================================================================

  // 1. Interactive SQL Terminal Execution (JDBC PreparedStatement / ResultSetMetaData)
  if (pathname === '/api/sql/execute' && req.method === 'POST') {
    const body = await parseBody(req);
    const result = executeSqlQuery(body.sql || '');
    sendJson(res, result.status === 'error' ? 400 : 200, result);
    return;
  }

  // 2. Clinical Donor Health & Eligibility Assessment
  if (pathname === '/api/eligibility/assess' && req.method === 'POST') {
    const body = await parseBody(req);
    const assessment = assessDonorEligibility(body);
    sendJson(res, 200, assessment);
    return;
  }

  // 3. Donors API (SELECT, INSERT, UPDATE, DELETE)
  if (pathname === '/api/donors') {
    if (req.method === 'GET') {
      sendJson(res, 200, db.donors);
      return;
    }
    if (req.method === 'POST') {
      const newDonor = await parseBody(req);
      if (!newDonor.donor_id || !newDonor.name) {
        sendJson(res, 400, { error: 'Missing mandatory fields' });
        return;
      }
      db.donors.push(newDonor);
      sendJson(res, 201, { message: 'Donor registered successfully (INSERT)', donor: newDonor });
      return;
    }
  }

  if (pathname.startsWith('/api/donors/')) {
    const donorId = pathname.replace('/api/donors/', '');
    const idx = db.donors.findIndex(d => d.donor_id.toLowerCase() === donorId.toLowerCase());

    if (req.method === 'PUT') {
      const updates = await parseBody(req);
      if (idx !== -1) {
        db.donors[idx] = { ...db.donors[idx], ...updates };
        sendJson(res, 200, { message: 'Donor updated (UPDATE)', donor: db.donors[idx] });
      } else {
        sendJson(res, 404, { error: 'Donor not found' });
      }
      return;
    }

    if (req.method === 'DELETE') {
      if (idx !== -1) {
        const removed = db.donors.splice(idx, 1);
        sendJson(res, 200, { message: 'Donor deleted (DELETE)', removed: removed[0] });
      } else {
        sendJson(res, 404, { error: 'Donor not found' });
      }
      return;
    }
  }

  // 4. Blood Stock Inventory API
  if (pathname === '/api/stock' && req.method === 'GET') {
    sendJson(res, 200, db.blood_stock);
    return;
  }

  // 5. Hospital Requests API
  if (pathname === '/api/requests') {
    if (req.method === 'GET') {
      sendJson(res, 200, db.hospital_requests);
      return;
    }
    if (req.method === 'POST') {
      const order = await parseBody(req);
      order.req_id = order.req_id || `REQ-${Math.floor(500 + Math.random() * 500)}`;
      order.status = 'Pending';
      order.date = new Date().toISOString().replace('T', ' ').substring(0, 16);
      db.hospital_requests.push(order);
      sendJson(res, 201, { message: 'Order created', order });
      return;
    }
  }

  // 6. Hospital Order Dispatch (Transaction Management COMMIT / ROLLBACK)
  if (pathname.endsWith('/dispatch') && req.method === 'POST') {
    const parts = pathname.split('/');
    const reqId = parts[parts.length - 2];
    const order = db.hospital_requests.find(r => r.req_id === reqId);

    if (!order) {
      sendJson(res, 404, { error: 'Order not found' });
      return;
    }

    const stock = db.blood_stock[order.blood_group];
    if (!stock || stock.units < order.units) {
      // Rollback transaction
      sendJson(res, 400, {
        status: 'ROLLBACK',
        message: `Transaction Aborted (con.rollback()): Insufficient stock for ${order.blood_group}. Available: ${stock ? stock.units : 0}, Requested: ${order.units}.`
      });
      return;
    }

    // Deduct stock & Commit
    stock.units -= order.units;
    order.status = 'Fulfilled';
    db.dispatch_log.push({
      dispatch_id: `DSP-${Date.now()}`,
      req_id: order.req_id,
      blood_group: order.blood_group,
      units: order.units,
      timestamp: new Date().toISOString()
    });

    sendJson(res, 200, {
      status: 'COMMIT',
      message: `Transaction Committed (con.commit()): Successfully dispatched ${order.units} unit(s) of ${order.blood_group} to ${order.hospital}. Remaining stock: ${stock.units}.`
    });
    return;
  }

  // =========================================================================
  // STATIC FILE SERVING
  // =========================================================================
  let reqUrl = pathname;
  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = '/index.html';
  }

  const filePath = path.join(__dirname, reqUrl);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Blood Bank Management server running at http://localhost:${PORT}`);
});
