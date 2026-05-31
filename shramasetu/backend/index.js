const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

// Initialize Firebase Admin SDK with service account
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(cors()); // Allow all origins for local dev/demo to prevent CORS fetch errors
app.use(express.json());

// Helper to generate IDs
function generateUid() {
  return crypto.randomBytes(16).toString('hex');
}

// Mount IVR routes
app.use(express.urlencoded({ extended: true })); // Required for Twilio form-data
app.use('/api/ivr', require('./routes/ivr'));

// =====================
// AUTH ROUTES (Using Firestore to store users securely and bypass console config errors)
// =====================

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, mobileNumber, age, address, role, skillStatus } = req.body;

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userQuery = await db.collection('users').where('email', '==', normalizedEmail).get();
    if (!userQuery.empty) {
      return res.status(400).json({ error: 'User with this email already registered' });
    }

    const uid = generateUid();

    // Store user data in Firestore
    await db.collection('users').doc(uid).set({
      uid,
      name,
      email: normalizedEmail,
      password, // Plain text for demo simplicity, can be hashed if requested
      mobileNumber,
      age: Number(age),
      address,
      role,
      skillStatus: role === 'labour' ? skillStatus : null,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: 'User registered successfully', uid });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Login a user
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Query user by email
    const snapshot = await db.collection('users').where('email', '==', normalizedEmail).get();
    if (snapshot.empty) {
      return res.status(400).json({ error: 'User not found' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    if (userData.password !== password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.json({
      uid: userData.uid,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user profile by UID
app.get('/api/user/:uid', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.uid).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// JOBS ROUTES
// =====================

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const snapshot = await db.collection('jobs').get();
    const jobs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get jobs by owner
app.get('/api/jobs/owner/:ownerId', async (req, res) => {
  try {
    const snapshot = await db.collection('jobs')
      .where('ownerId', '==', req.params.ownerId)
      .get();
    const jobs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new job
app.post('/api/jobs', async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      status: 'pending',
      acceptedBy: [],
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection('jobs').add(jobData);
    res.status(201).json({ id: ref.id, ...jobData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept a job (Labour accepting)
app.patch('/api/jobs/:jobId/accept', async (req, res) => {
  const { uid } = req.body;
  try {
    const jobRef = db.collection('jobs').doc(req.params.jobId);
    await jobRef.update({
      acceptedBy: admin.firestore.FieldValue.arrayUnion(uid),
      status: 'confirmed',
    });
    res.json({ message: 'Job accepted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// RENTALS ROUTES
// =====================

// Get all rentals
app.get('/api/rentals', async (req, res) => {
  try {
    const snapshot = await db.collection('rentals').orderBy('createdAt', 'desc').get();
    const rentals = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new rental
app.post('/api/rentals', async (req, res) => {
  try {
    const rentalData = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection('rentals').add(rentalData);
    res.status(201).json({ id: ref.id, ...rentalData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// =====================
// ATTENDANCE & WAGES ROUTES
// =====================

// Mark Attendance
app.post('/api/attendance', async (req, res) => {
  try {
    const record = { ...req.body, createdAt: new Date().toISOString() };
    const ref = await db.collection('attendanceRecords').add(record);
    res.status(201).json({ id: ref.id, ...record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Attendance
app.get('/api/attendance', async (req, res) => {
  try {
    const { labourId, ownerId } = req.query;
    let query = db.collection('attendanceRecords');
    if (labourId) query = query.where('labourId', '==', labourId);
    if (ownerId) query = query.where('ownerId', '==', ownerId);
    
    const snapshot = await query.get();
    const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    // In-memory sort to avoid requiring Firestore composite index
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Wage Record
app.post('/api/wages', async (req, res) => {
  try {
    const record = { ...req.body, createdAt: new Date().toISOString() };
    const ref = await db.collection('wageRecords').add(record);
    res.status(201).json({ id: ref.id, ...record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Wages
app.get('/api/wages', async (req, res) => {
  try {
    const { labourId, ownerId } = req.query;
    let query = db.collection('wageRecords');
    if (labourId) query = query.where('labourId', '==', labourId);
    if (ownerId) query = query.where('ownerId', '==', ownerId);
    
    const snapshot = await query.get();
    const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    // In-memory sort to avoid requiring Firestore composite index
    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Wage Status
app.patch('/api/wages/:id/status', async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    await db.collection('wageRecords').doc(req.params.id).update({
      paymentStatus,
      paymentDate: paymentStatus === 'Paid' ? new Date().toISOString() : null
    });
    res.json({ message: 'Wage status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// EQUIPMENT RENTAL MARKETPLACE & COMMISSION
// ==========================================

// --- RENTAL COMPANIES ---

// Create rental company
app.post('/api/rental-companies', async (req, res) => {
  try {
    const companyId = generateUid();
    const company = {
      companyId,
      companyName: req.body.companyName,
      ownerName: req.body.ownerName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      stateDistrict: req.body.stateDistrict || '',
      gstNumber: req.body.gstNumber,
      description: req.body.description || '',
      logoURL: req.body.logoURL || '',
      categories: req.body.categories || [],
      verificationStatus: req.body.verificationStatus || 'Pending',
      status: req.body.status || 'Active',
      commissionType: req.body.commissionType || 'Percentage',
      commissionValue: Number(req.body.commissionValue || 10),
      createdAt: new Date().toISOString()
    };
    await db.collection('rentalCompanies').doc(companyId).set(company);
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get rental companies
app.get('/api/rental-companies', async (req, res) => {
  try {
    const snapshot = await db.collection('rentalCompanies').get();
    const companies = snapshot.docs.map(d => d.data());
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update rental company
app.put('/api/rental-companies/:id', async (req, res) => {
  try {
    const companyId = req.params.id;
    const updates = {
      companyName: req.body.companyName,
      ownerName: req.body.ownerName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      stateDistrict: req.body.stateDistrict || '',
      gstNumber: req.body.gstNumber,
      description: req.body.description || '',
      logoURL: req.body.logoURL || '',
      categories: req.body.categories || [],
      commissionType: req.body.commissionType || 'Percentage',
      commissionValue: Number(req.body.commissionValue || 10)
    };
    await db.collection('rentalCompanies').doc(companyId).update(updates);
    res.json({ message: 'Company updated', companyId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Patch company status / verification
app.patch('/api/rental-companies/:id/status', async (req, res) => {
  try {
    const companyId = req.params.id;
    const { verificationStatus, status } = req.body;
    const updates = {};
    if (verificationStatus) updates.verificationStatus = verificationStatus;
    if (status) updates.status = status;

    await db.collection('rentalCompanies').doc(companyId).update(updates);
    res.json({ message: 'Company status updated', companyId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- EQUIPMENT MARKETPLACE ---

// Add equipment listing
app.post('/api/equipment-marketplace', async (req, res) => {
  try {
    const equipmentId = generateUid();
    const equipment = {
      equipmentId,
      companyId: req.body.companyId,
      companyName: req.body.companyName,
      equipmentName: req.body.equipmentName,
      category: req.body.category,
      description: req.body.description || '',
      dailyPrice: Number(req.body.dailyPrice || 0),
      weeklyPrice: Number(req.body.weeklyPrice || 0),
      monthlyPrice: Number(req.body.monthlyPrice || 0),
      deposit: Number(req.body.deposit || 0),
      quantity: Number(req.body.quantity || 1),
      condition: req.body.condition || 'Excellent',
      availability: req.body.availability !== undefined ? req.body.availability : true,
      imageURL: req.body.imageURL || '',
      location: req.body.location || '',
      adminApproval: req.body.adminApproval || 'Pending',
      createdAt: new Date().toISOString()
    };
    await db.collection('equipmentMarketplace').doc(equipmentId).set(equipment);
    res.status(201).json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get equipment listings
app.get('/api/equipment-marketplace', async (req, res) => {
  try {
    const { approvedOnly } = req.query;
    let query = db.collection('equipmentMarketplace');
    if (approvedOnly === 'true') {
      query = query.where('adminApproval', '==', 'Approved');
    }
    const snapshot = await query.get();
    const equipment = snapshot.docs.map(d => d.data());
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update equipment listing
app.put('/api/equipment-marketplace/:id', async (req, res) => {
  try {
    const equipmentId = req.params.id;
    const updates = {
      equipmentName: req.body.equipmentName,
      category: req.body.category,
      companyId: req.body.companyId,
      companyName: req.body.companyName,
      description: req.body.description || '',
      dailyPrice: Number(req.body.dailyPrice || 0),
      weeklyPrice: Number(req.body.weeklyPrice || 0),
      monthlyPrice: Number(req.body.monthlyPrice || 0),
      deposit: Number(req.body.deposit || 0),
      quantity: Number(req.body.quantity || 1),
      condition: req.body.condition || 'Excellent',
      location: req.body.location || '',
      imageURL: req.body.imageURL || ''
    };
    await db.collection('equipmentMarketplace').doc(equipmentId).update(updates);
    res.json({ message: 'Equipment updated', equipmentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Patch equipment listing status / approval / availability
app.patch('/api/equipment-marketplace/:id/status', async (req, res) => {
  try {
    const equipmentId = req.params.id;
    const { adminApproval, availability } = req.body;
    const updates = {};
    if (adminApproval) updates.adminApproval = adminApproval;
    if (availability !== undefined) updates.availability = availability;

    await db.collection('equipmentMarketplace').doc(equipmentId).update(updates);
    res.json({ message: 'Equipment status updated', equipmentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- RENTAL REQUESTS ---

// Create rental request
app.post('/api/rental-requests', async (req, res) => {
  try {
    const requestId = generateUid();
    
    // Fetch rental company details to calculate commission
    const equipmentDoc = await db.collection('equipmentMarketplace').doc(req.body.equipmentId).get();
    if (!equipmentDoc.exists) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    const equipmentData = equipmentDoc.data();
    
    const companyDoc = await db.collection('rentalCompanies').doc(equipmentData.companyId).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ error: 'Rental Company not found' });
    }
    const companyData = companyDoc.data();

    // Calculate commission
    const rentalAmount = Number(req.body.estimatedCost);
    let commissionAmount = 0;
    if (companyData.commissionType === 'Percentage') {
      commissionAmount = (rentalAmount * Number(companyData.commissionValue)) / 100;
    } else {
      commissionAmount = Number(companyData.commissionValue);
    }
    const companyEarning = rentalAmount - commissionAmount;

    const request = {
      requestId,
      ownerId: req.body.ownerId,
      ownerName: req.body.ownerName,
      companyId: equipmentData.companyId,
      companyName: equipmentData.companyName,
      equipmentId: req.body.equipmentId,
      equipmentName: equipmentData.equipmentName,
      equipmentImage: equipmentData.imageURL || '',
      rentalType: req.body.rentalType, // Daily, Weekly, Monthly
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      estimatedCost: rentalAmount,
      deposit: Number(equipmentData.deposit),
      commissionAmount,
      companyEarning,
      status: 'Pending',
      paymentStatus: 'Pending',
      createdAt: new Date().toISOString()
    };

    await db.collection('rentalRequests').doc(requestId).set(request);
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get rental requests
app.get('/api/rental-requests', async (req, res) => {
  try {
    const { ownerId } = req.query;
    let query = db.collection('rentalRequests');
    if (ownerId) {
      query = query.where('ownerId', '==', ownerId);
    }
    const snapshot = await query.get();
    const requests = snapshot.docs.map(d => d.data());
    // In-memory sort by createdAt
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Patch rental request status / payment
app.patch('/api/rental-requests/:id/status', async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status, paymentStatus } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    // Fetch the request to record a transaction if approved
    const requestDoc = await db.collection('rentalRequests').doc(requestId).get();
    if (!requestDoc.exists) {
      return res.status(404).json({ error: 'Rental Request not found' });
    }
    const requestData = requestDoc.data();

    await db.collection('rentalRequests').doc(requestId).update(updates);

    // If request status is being updated to 'Approved' or 'Active', record a transaction if it doesn't exist
    if (status === 'Approved' || status === 'Active') {
      const txQuery = await db.collection('commissionTransactions').where('rentalRequestId', '==', requestId).get();
      if (txQuery.empty) {
        const transactionId = generateUid();
        
        // Fetch company details to know commission type/value at time of transaction
        const companyDoc = await db.collection('rentalCompanies').doc(requestData.companyId).get();
        const companyData = companyDoc.exists ? companyDoc.data() : { commissionType: 'Percentage', commissionValue: 10 };

        const transaction = {
          transactionId,
          rentalRequestId: requestId,
          companyId: requestData.companyId,
          companyName: requestData.companyName,
          equipmentId: requestData.equipmentId,
          equipmentName: requestData.equipmentName,
          rentalAmount: requestData.estimatedCost,
          commissionType: companyData.commissionType,
          commissionValue: companyData.commissionValue,
          adminProfit: requestData.commissionAmount,
          companyPayout: requestData.companyEarning,
          paymentStatus: paymentStatus || requestData.paymentStatus || 'Pending',
          createdAt: new Date().toISOString()
        };

        await db.collection('commissionTransactions').doc(transactionId).set(transaction);
      } else if (paymentStatus) {
        // Update transaction paymentStatus too
        const txDoc = txQuery.docs[0];
        await db.collection('commissionTransactions').doc(txDoc.id).update({ paymentStatus });
      }
    }

    res.json({ message: 'Request status updated', requestId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- COMMISSIONS & STATS ---

// Get commissions dashboard stats
app.get('/api/admin/commissions/stats', async (req, res) => {
  try {
    const [companiesSnap, requestsSnap, txsSnap] = await Promise.all([
      db.collection('rentalCompanies').get(),
      db.collection('rentalRequests').get(),
      db.collection('commissionTransactions').get()
    ]);

    const companies = companiesSnap.docs.map(d => d.data());
    const requests = requestsSnap.docs.map(d => d.data());
    const txs = txsSnap.docs.map(d => d.data());

    // Basic KPI calculations
    const totalRentals = requests.filter(r => r.status !== 'Cancelled' && r.status !== 'Rejected').length;
    const totalRevenue = txs.reduce((sum, tx) => sum + Number(tx.rentalAmount), 0);
    const totalAdminProfit = txs.reduce((sum, tx) => sum + Number(tx.adminProfit), 0);
    const pendingCommission = txs.filter(tx => tx.paymentStatus === 'Pending').reduce((sum, tx) => sum + Number(tx.adminProfit), 0);

    // Company wise earnings
    const companyEarningsMap = {};
    companies.forEach(c => {
      companyEarningsMap[c.companyId] = {
        companyId: c.companyId,
        companyName: c.companyName,
        totalRentals: 0,
        revenue: 0,
        profit: 0
      };
    });

    txs.forEach(tx => {
      if (!companyEarningsMap[tx.companyId]) {
        companyEarningsMap[tx.companyId] = {
          companyId: tx.companyId,
          companyName: tx.companyName || 'Unknown Company',
          totalRentals: 0,
          revenue: 0,
          profit: 0
        };
      }
      companyEarningsMap[tx.companyId].totalRentals += 1;
      companyEarningsMap[tx.companyId].revenue += tx.rentalAmount;
      companyEarningsMap[tx.companyId].profit += tx.adminProfit;
    });

    const companyEarnings = Object.values(companyEarningsMap).sort((a, b) => b.revenue - a.revenue);

    // Monthly breakdown
    const monthlyMap = {};
    txs.forEach(tx => {
      const date = new Date(tx.createdAt);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, revenue: 0, profit: 0 };
      }
      monthlyMap[monthKey].revenue += tx.rentalAmount;
      monthlyMap[monthKey].profit += tx.adminProfit;
    });
    const monthlyEarnings = Object.values(monthlyMap);

    res.json({
      kpis: {
        totalCompanies: companies.length,
        verifiedCompanies: companies.filter(c => c.verificationStatus === 'Approved').length,
        activeCompanies: companies.filter(c => c.status === 'Active').length,
        totalRentals,
        totalRevenue,
        totalAdminProfit,
        pendingCommission
      },
      companyEarnings,
      monthlyEarnings,
      transactions: txs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =====================
// HEALTH INSURANCE SYSTEMS
// =====================

// --- INSURANCE PROVIDERS CRUD ---

// Create insurance provider
app.post('/api/insurance-providers', async (req, res) => {
  try {
    const providerId = generateUid();
    const provider = {
      providerId,
      providerName: req.body.providerName,
      registrationNumber: req.body.registrationNumber,
      contactPerson: req.body.contactPerson,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      categories: req.body.categories || [],
      verificationStatus: req.body.verificationStatus || 'Pending',
      commissionType: req.body.commissionType || 'Percentage',
      commissionValue: Number(req.body.commissionValue || 10),
      status: req.body.status || 'Active',
      createdAt: new Date().toISOString()
    };
    await db.collection('insuranceProviders').doc(providerId).set(provider);
    res.status(201).json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all providers
app.get('/api/insurance-providers', async (req, res) => {
  try {
    const snapshot = await db.collection('insuranceProviders').get();
    const providers = snapshot.docs.map(d => d.data());
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update provider
app.put('/api/insurance-providers/:id', async (req, res) => {
  try {
    const providerId = req.params.id;
    const updates = {
      providerName: req.body.providerName,
      registrationNumber: req.body.registrationNumber,
      contactPerson: req.body.contactPerson,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      categories: req.body.categories || [],
      commissionType: req.body.commissionType || 'Percentage',
      commissionValue: Number(req.body.commissionValue || 10)
    };
    await db.collection('insuranceProviders').doc(providerId).update(updates);
    res.json({ message: 'Insurance provider updated', providerId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update provider status or verification
app.patch('/api/insurance-providers/:id/status', async (req, res) => {
  try {
    const providerId = req.params.id;
    const { verificationStatus, status } = req.body;
    const updates = {};
    if (verificationStatus) updates.verificationStatus = verificationStatus;
    if (status) updates.status = status;
    await db.collection('insuranceProviders').doc(providerId).update(updates);
    res.json({ message: 'Insurance provider status updated', providerId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- INSURANCE PLANS CRUD ---

// Create plan
app.post('/api/insurance-plans', async (req, res) => {
  try {
    const planId = generateUid();
    const plan = {
      planId,
      providerId: req.body.providerId,
      providerName: req.body.providerName,
      planName: req.body.planName,
      coverageAmount: Number(req.body.coverageAmount),
      monthlyPremium: Number(req.body.monthlyPremium),
      yearlyPremium: Number(req.body.yearlyPremium),
      benefits: req.body.benefits || '',
      eligibility: req.body.eligibility || '',
      validityPeriod: req.body.validityPeriod || '1 Year',
      claimSupportContact: req.body.claimSupportContact || '',
      commissionType: req.body.commissionType || 'Percentage',
      commissionValue: Number(req.body.commissionValue || 10),
      status: req.body.status || 'Active',
      createdAt: new Date().toISOString()
    };
    await db.collection('insurancePlans').doc(planId).set(plan);
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all plans
app.get('/api/insurance-plans', async (req, res) => {
  try {
    const snapshot = await db.collection('insurancePlans').get();
    const plans = snapshot.docs.map(d => d.data());
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update plan
app.put('/api/insurance-plans/:id', async (req, res) => {
  try {
    const planId = req.params.id;
    const updates = {
      planName: req.body.planName,
      coverageAmount: Number(req.body.coverageAmount),
      monthlyPremium: Number(req.body.monthlyPremium),
      yearlyPremium: Number(req.body.yearlyPremium),
      benefits: req.body.benefits || '',
      eligibility: req.body.eligibility || '',
      validityPeriod: req.body.validityPeriod || '1 Year',
      claimSupportContact: req.body.claimSupportContact || '',
      commissionType: req.body.commissionType || 'Percentage',
      commissionValue: Number(req.body.commissionValue || 10)
    };
    await db.collection('insurancePlans').doc(planId).update(updates);
    res.json({ message: 'Insurance plan updated', planId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update plan status
app.patch('/api/insurance-plans/:id/status', async (req, res) => {
  try {
    const planId = req.params.id;
    const { status } = req.body;
    await db.collection('insurancePlans').doc(planId).update({ status });
    res.json({ message: 'Insurance plan status updated', planId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- INSURANCE APPLICATIONS & POLICIES ---

// Create application
app.post('/api/insurance-applications', async (req, res) => {
  try {
    const applicationId = generateUid();
    const {
      userId,
      userName,
      userRole,
      email,
      phone,
      providerId,
      providerName,
      planId,
      planName,
      premiumType,
      premiumAmount,
      documentsURL
    } = req.body;

    const planDoc = await db.collection('insurancePlans').doc(planId).get();
    if (!planDoc.exists) {
      return res.status(404).json({ error: 'Selected plan not found' });
    }
    const planData = planDoc.data();

    // Calculate commission
    let commissionAmount = 0;
    if (planData.commissionType === 'Percentage') {
      commissionAmount = premiumAmount * (planData.commissionValue / 100);
    } else {
      commissionAmount = planData.commissionValue;
    }
    const providerPayout = premiumAmount - commissionAmount;

    const application = {
      applicationId,
      userId,
      userName,
      userRole,
      email,
      phone,
      providerId,
      providerName,
      planId,
      planName,
      premiumType,
      premiumAmount,
      commissionAmount,
      providerPayout,
      documentsURL: documentsURL || '',
      status: 'Pending',
      paymentStatus: 'Pending',
      rejectionReason: '',
      adminApproval: 'Pending',
      appliedAt: new Date().toISOString()
    };

    await db.collection('insuranceApplications').doc(applicationId).set(application);
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get applications
app.get('/api/insurance-applications', async (req, res) => {
  try {
    const { userId } = req.query;
    let snapshot;
    if (userId) {
      snapshot = await db.collection('insuranceApplications').where('userId', '==', userId).get();
    } else {
      snapshot = await db.collection('insuranceApplications').get();
    }
    const applications = snapshot.docs.map(d => d.data());
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve / Reject Application
app.patch('/api/insurance-applications/:id/status', async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status, rejectionReason, adminApproval } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (rejectionReason !== undefined) updates.rejectionReason = rejectionReason;
    if (adminApproval) updates.adminApproval = adminApproval;

    const appRef = db.collection('insuranceApplications').doc(applicationId);
    const appDoc = await appRef.get();
    if (!appDoc.exists) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const appData = appDoc.data();

    if (status === 'Approved') {
      updates.approvedAt = new Date().toISOString();
      updates.status = 'Active';
      updates.paymentStatus = 'Paid';
      updates.adminApproval = 'Approved';

      // 1. Create transaction in profitTransactions
      const transactionId = generateUid();
      const tx = {
        transactionId,
        sourceType: 'insurance_commission',
        sourceId: applicationId,
        userId: appData.userId,
        userRole: appData.userRole,
        grossAmount: appData.premiumAmount,
        profitAmount: appData.commissionAmount,
        providerPayout: appData.providerPayout,
        paymentStatus: 'Paid',
        createdAt: new Date().toISOString()
      };
      await db.collection('profitTransactions').doc(transactionId).set(tx);

      // 2. Fetch validity support contact from plan
      const planDoc = await db.collection('insurancePlans').doc(appData.planId).get();
      const planData = planDoc.exists ? planDoc.data() : {};

      // 3. Create activeInsurancePolicies entry
      const policyId = generateUid();
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(startDate.getFullYear() + 1); // 1 Year validity

      const policy = {
        policyId,
        applicationId,
        userId: appData.userId,
        userName: appData.userName,
        userRole: appData.userRole,
        providerId: appData.providerId,
        providerName: appData.providerName,
        planId: appData.planId,
        planName: appData.planName,
        coverageAmount: planData.coverageAmount || 100000,
        premiumAmount: appData.premiumAmount,
        policyStartDate: startDate.toISOString().split('T')[0],
        policyEndDate: endDate.toISOString().split('T')[0],
        claimSupportContact: planData.claimSupportContact || '',
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      await db.collection('activeInsurancePolicies').doc(policyId).set(policy);
    } else if (status === 'Rejected') {
      updates.adminApproval = 'Rejected';
    }

    await appRef.update(updates);
    res.json({ message: 'Application updated successfully', applicationId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active policies
app.get('/api/active-insurance-policies', async (req, res) => {
  try {
    const { userId } = req.query;
    let snapshot;
    if (userId) {
      snapshot = await db.collection('activeInsurancePolicies').where('userId', '==', userId).get();
    } else {
      snapshot = await db.collection('activeInsurancePolicies').get();
    }
    const policies = snapshot.docs.map(d => d.data());
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// FEEDBACK & AI CHAT SYSTEM ENDPOINTS
// =====================

// --- FEEDBACK ENDPOINTS ---

// Submit Feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const feedbackId = generateUid();
    const feedback = {
      feedbackId,
      userId: req.body.userId,
      userName: req.body.userName,
      userRole: req.body.userRole,
      category: req.body.category,
      rating: Number(req.body.rating || 5),
      message: req.body.message || '',
      imageURL: req.body.imageURL || '',
      status: 'Submitted',
      adminReply: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.collection('feedback').doc(feedbackId).set(feedback);
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const { userId, userRole, category, rating, status } = req.query;
    let ref = db.collection('feedback');
    
    // Add filters
    if (userId) ref = ref.where('userId', '==', userId);
    if (userRole) ref = ref.where('userRole', '==', userRole);
    if (category) ref = ref.where('category', '==', category);
    if (rating) ref = ref.where('rating', '==', Number(rating));
    if (status) ref = ref.where('status', '==', status);

    const snapshot = await ref.get();
    const list = snapshot.docs.map(d => d.data());
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Reply to Feedback
app.patch('/api/feedback/:id/reply', async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const { adminReply, status } = req.body;
    const updates = {
      updatedAt: new Date().toISOString()
    };
    if (adminReply !== undefined) updates.adminReply = adminReply;
    if (status) updates.status = status;

    await db.collection('feedback').doc(feedbackId).update(updates);
    res.json({ message: 'Feedback updated successfully', feedbackId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Feedback Admin Stats
app.get('/api/admin/feedback/stats', async (req, res) => {
  try {
    const snapshot = await db.collection('feedback').get();
    const list = snapshot.docs.map(d => d.data());

    const totalFeedback = list.length;
    const labourFeedback = list.filter(f => f.userRole === 'labour').length;
    const ownerFeedback = list.filter(f => f.userRole === 'owner').length;
    const pendingFeedback = list.filter(f => f.status === 'Submitted' || f.status === 'Under Review').length;
    const resolvedFeedback = list.filter(f => f.status === 'Resolved').length;
    
    const sumRating = list.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = totalFeedback > 0 ? Number((sumRating / totalFeedback).toFixed(1)) : 5.0;

    res.json({
      totalFeedback,
      labourFeedback,
      ownerFeedback,
      pendingFeedback,
      resolvedFeedback,
      averageRating
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AI CHATBOT KEYWORD DICTIONARY ---

const localReplies = {
  en: {
    attendance: "To track attendance: Labourers can go to 'Attendance Tracking' and mark their daily check-in. Plantation Owners can go to 'Attendance Management' to approve check-ins.",
    wages: "For Wages: Owners set daily wage amounts during job posts. Labourers can track confirmed wages under 'Wages Tracking' and request payments. Payments are secured via local ledgers.",
    rentals: "For Equipment Rentals: Owners can browse available sprayers, tractors, and tools in the 'Rental Marketplace'. The platform handles unified security commissions.",
    insurance: "For Health Insurance: plantation workers and owners can browse verified policies in the 'Health Insurance' marketplace, apply with custom premium plans, and track active coverage.",
    auth: "For Account help: You can register as a Labourer or Owner. Use standard credentials to log in. In case of issues, please escalate to human support.",
    general: "Welcome to ShramaSetu Support! I can help you with Attendance, Wages, Rentals, or Health Insurance. If you need manual intervention, click the 'Escalate to Admin' button."
  },
  hi: {
    attendance: "हाजिरी ट्रैक करने के लिए: श्रमिक 'हाजिरी ट्रैकिंग' में जाकर दैनिक चेक-इन कर सकते हैं। वृक्षारोपण मालिक 'हाजिरी प्रबंधन' में जाकर इसे स्वीकृत कर सकते हैं।",
    wages: "मजदूरी के लिए: मालिक नौकरी पोस्ट के दौरान दैनिक मजदूरी तय करते हैं। श्रमिक 'मजदूरी ट्रैकिंग' के तहत स्वीकृत मजदूरी देख सकते हैं।",
    rentals: "उपकरण किराए के लिए: मालिक 'किરાયા बाजार' में जाकर उपलब्ध स्प्रेयर, ट्रैक्टर और टूल्स देख सकते हैं।",
    insurance: "स्वास्थ्य बीमा के लिए: श्रमिक और मालिक 'स्वास्थ्य बीमा' बाजार में जाकर पॉलिसियां देख सकते हैं और आवेदन कर सकते हैं।",
    auth: "खाता सहायता के लिए: आप श्रमिक या मालिक के रूप में पंजीकरण कर सकते हैं। लॉगिन करने के लिए अपने क्रेडेंशियल का उपयोग करें।",
    general: "श्रमसेतु सहायता में आपका स्वागत है! मैं हाजिरी, मजदूरी, उपकरण किराए पर या बीमा में मदद कर सकता हूँ। मानव सहायता के लिए 'एडमिन को एस्केलेट करें' पर क्लिक करें।"
  },
  kn: {
    attendance: "ಹಾಜರಾತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಲು: ಕಾರ್ಮಿಕರು 'ಹಾಜರಾತಿ ಟ್ರ್ಯಾಕಿಂಗ್' ಗೆ ಹೋಗಿ ದಿನನಿತ್ಯದ ಚೆക്-ಇൻ ಮಾಡಬಹುದು. ಮಾಲೀಕರು 'ಹಾಜರಾತಿ ನಿರ್ವಹಣೆ'ಯಲ್ಲಿ ಇದನ್ನು ಅನುಮೋದಿಸಬಹುದು.",
    wages: "வேತನಕ್ಕಾಗಿ: ಮಾಲೀಕರು ಕೆಲಸದ ಪೋಸ್ಟ್‌ನಲ್ಲಿ ದೈನಂದಿನ ವೇತನವನ್ನು ನಿಗದಿಪಡಿಸುತ್ತಾರೆ. ಕಾರ್ಮಿಕರು 'ವೇತನ ಟ್ರ್ಯಾಕಿಂಗ್' ಅಡಿಯಲ್ಲಿ ವೇತನವನ್ನು ನೋಡಬಹುದು.",
    rentals: "ಉಪಕರಣಗಳ ಬಾಡಿಗೆಗಾಗಿ: ಮಾಲೀಕರು 'ಬಾಡಿಗೆ ಮಾರುಕಟ್ಟೆ'ಯಲ್ಲಿ ಲಭ್ಯವಿರುವ ಟ್ರ್ಯಾಕ್ಟರ್, ಸ್ಪ್ರೇಯರ್‌ಗಳನ್ನು ಬಾಡಿಗೆಗೆ ಪಡೆಯಬಹುದು.",
    insurance: "ಆರೋಗ್ಯ ವಿಮೆಗಾಗಿ: ಕಾರ್മಿಕರು passions ಮತ್ತು ಮಾಲೀಕರು 'ಆರೋಗ್ಯ ವಿಮೆ' ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ವಿಮೆಗಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು ಮತ್ತು ಪರಿಶೀಲಿಸಬಹುದು.",
    auth: "ಖாತೆ ಸಹಾಯಕ್ಕಾಗಿ: ನೀವು ಕಾರ್ಮಿಕ ಅಥವಾ ಮಾಲೀಕರಾಗಿ ನೋಂದಾಯಿಸಿಕೊಳ್ಳಬಹುದು. ಲಾಗಿನ್ ಮಾಡಲು ನಿಮ್ಮ ರುಜುವಾತುಗಳನ್ನು ಬಳಸಿ.",
    general: "ಶ್ರಮಸೇತು ಬೆಂಬಲಕ್ಕೆ ಸುಸ್ವಾಗत! ಹಾಜರಾತಿ, ವೇತನ, ಬಾಡಿಗೆ ಉಪಕರಣ ಅಥವಾ ವಿಮೆ ಬಗ್ಗೆ ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಹೆಚ್ಚಿನ ನೆರವಿಗಾಗಿ 'ಅಡ್ಮಿನ್‌ಗೆ ಎಸ್ಕಲೇಟ್ ಮಾಡಿ' ಕ್ಲಿಕ್ ಮಾಡಿ."
  },
  ta: {
    attendance: "வருகை பதிவை கண்காணிக்க: தொழிலாளர்கள் 'வருகை பதிவு' பக்கத்தில் தினசரி செக்-இൻ செய்யலாம். உரிமையாளர்கள் 'வருகை மேलाண்மை'யில் அதை அங்கீகரிக்கலாம்.",
    wages: "ஊதியத்திற்கு: உரிமையாளர்கள் வேலை பதிவின் போது தினசரி ஊதியத்தை நிர்ணயிப்பார்கள். தொழிலாளர்கள் 'ஊதிய கண்காணிப்பு' பக்கத்தில் அதை பார்க்கலாம்.",
    rentals: "உபகரணங்கள் வாடகைக்கு: உரிமையாளர்கள் 'வாடகை சந்தை'யில் டிராக்டர்கள் மற்றும் கருவிகளை வாடகைக்கு எடுக்கலாம்.",
    insurance: "காப்பீட்டுக்கு: தொழிலாளர்கள் மற்றும் உரிமையாளர்கள் 'மருத்துவ காப்பீடு' சந்தையில் பாலிசிகளை பார்த்து விண்ணப்பிக்கலாம்.",
    auth: "கணக்கு உதவிக்கு: நீங்கள் தொழிலாளியாக அல்லது உரிமையாளராக பதிவு செய்யலாம். உள்நுழைய உங்கள் விவரங்களை பயன்படுத்தவும்.",
    general: "ஸ்ரமசேது ஆதரவுக்கு உங்களை வரவேற்கிறோம்! வருகை, ஊதியம், வாடகை அல்லது காப்பீடு குறித்து நான் உங்களுக்கு உதவ முடியும். மனித உதவிக்கு 'நிர்வாகிக்கு அனுப்பு' என்பதை கிளிக் செய்யவும்."
  },
  te: {
    attendance: "హాజరును ట్రాక్ చేయడానికి: కార్మికులు 'హాజరు ట్రాకింగ్' లో రోజువారీ చెక్-ఇన్ చేయవచ్చు. యజమానులు 'హాజరు నిర్వహణ'లో ఆమోదించవచ్చు.",
    wages: "వేతనాల కోసం: యజమానులు రోజువారీ వేతనాన్ని నిర్ణయిస్తారు. కార్మికులు 'వేతన ట్రాకింగ్' లో తమ వేతనాలను చూసుకోవచ్చు.",
    rentals: "పరికరాల అద్దెకు: యజమానులు 'అద్దె మార్కెట్' లో ట్రాక్టర్లు మరియు పరికరాలను అద్దెకు తీసుకోవచ్చు.",
    insurance: "ఆరోగ్య భీమా కోసం: కార్మికులు మరియు యజమానులు 'ఆరోగ్య భీమా' మార్కెట్లో పాలసీలను చూసి దరఖాస్తు చేసుకోవచ్చు.",
    auth: "ఖాతా సహాయం కోసం: మీరు కార్మికుడు లేదా యజమానిగా నమోదు చేసుకోవచ్చు. లాగిన్ చేయడానికి మీ వివరాలను ఉపయోగించండి.",
    general: "శ్రమసేతు సహాయ కేంద్రానికి స్వాగతం! హాజరు, వేతనం, పరికరాల అద్దె లేదా భీమా గురించి నేను సహాయం చేయగలను. మానవ సహాయం కోసం 'అడ్మిన్‌కు పంపండి' క్లిక్ చేయండి."
  },
  ml: {
    attendance: "ഹാജർ രേഖപ്പെടുത്താൻ: തൊഴിലാളികൾക്ക് 'ഹാജർ ട്രാക്കിംഗ്' വഴി ദിവസേനയുള്ള ചെക്ക്-ഇൻ ചെയ്യാം. ഉടമകൾക്ക് 'ഹാജർ മാനേജ്‌മെന്റ്' വഴി ഇത് അംഗീകരിക്കാം.",
    wages: "വേതനത്തിന്: ഉടമകൾ ജോലി പോസ്റ്റ് ചെയ്യുമ്പോൾ വേതനം നിശ്ചയിക്കുന്നു. തൊഴിലാളികൾക്ക് 'വേതന ട്രാക്കിംഗ്' വഴി ഇത് കാണാം.",
    rentals: "ഉപകരണ വാടകയ്ക്ക്: ഉടമകൾക്ക് 'വാടക വിപണി' വഴി ട്രാക്ടറുകളും സ്പ്രേയറുകളും വാടകയ്ക്ക് എടുക്കാം.",
    insurance: "ആരോഗ്യ ഇൻഷുറൻസിന്: തൊഴിലാളികൾക്കും ഉടമകൾക്കും 'ആരോഗ്യ ഇൻഷുറൻസ്' വിപണി വഴി പോളിസികൾ തിരഞ്ഞെടുക്കാം.",
    auth: "അക്കൗണ്ട് സഹായത്തിന്: നിങ്ങൾക്ക് തൊഴിലാളിയായോ ഉടമയായോ രജിസ്റ്റർ ചെയ്യാം. ലോഗിൻ ചെയ്യാൻ നിങ്ങളുടെ വിശദാംശങ്ങൾ ഉപയോഗിക്കുക.",
    general: "ശ്രമസേതു പിന്തുണയിലേക്ക് സ്വാഗതം! ഹാജർ, വേതനം, വാടക ഉപകരണങ്ങൾ, ഇൻഷുറൻസ് എന്നിവയിൽ ഞാൻ സഹായിക്കാം. കൂടുതൽ സഹായത്തിന് 'അഡ്മിന് കൈമാറുക' ക്ലിക് ചെയ്യുക."
  },
  mr: {
    attendance: "हजेरी ट्रॅक करण्यासाठी: मजूर 'हजेरी ट्रॅकिंग' मध्ये जाऊन दैनंदिन हजेरी लावू शकतात. मालक 'हजेरी व्यवस्थापन' मध्ये ते मंजूर करू शकतात.",
    wages: "मजुरीसाठी: मालक कामाच्या पोस्ट दरम्यान मजुरी ठरवतात. मजूर 'मजुरी ट्रॅकिंग' मध्ये ती पाहू शकतात.",
    rentals: "भाड्याने उपकरणांसाठी: मालक 'भाडे बाजार' मध्ये ट्रॅक्टर व स्प्रेयर भाड्याने घेऊ शकतात.",
    insurance: "आरोग्य विम्यासाठी: मजूर व मालक 'आरोग्य विमा' बाजारात पॉलिसी पाहून अर्ज करू शकतात.",
    auth: "खाते मदतीसाठी: आपण मजूर किंवा मालक म्हणून नोंदणी करू शकता. लॉगिन करण्यासाठी आपले क्रेडेंशियल वापरा.",
    general: "श्रमसेतू सपोर्टमध्ये आपले स्वागत आहे! मी हजेरी, मजुरी, भाडे उपकरणे किंवा विम्यात मदत करू शकतो. मानवी मदतीसाठी 'अॅडमीनकडे पाठवा' वर क्लिक करा।"
  },
  bn: {
    attendance: "উপস্থিতি ট্র্যাক করতে: শ্রমিকরা 'উপস্থিতি ট্র্যাকিং' এ গিয়ে দৈনিক চেক-ইন করতে পারেন। মালিকরা 'উপস্থিতি পরিচালনা'য় তা অনুমোদন করতে পারেন।",
    wages: "মজুরির জন্য: মালিকরা কাজের সময় মজুরি নির্ধারণ করেন। শ্রমিকরা 'মজুরি ট্র্যাকিং' এ গিয়ে মজুরি দেখতে পারেন।",
    rentals: "যন্ত্রপাতি ভাড়ার জন্য: মালিকরা 'ভাড়ার বাজার' থেকে ট্রাক্টর ও স্প্রেয়ার ভাড়া নিতে পারেন।",
    insurance: "स्वास्थ्य বীমার জন্য: শ্রমিক ও মালিকরা 'স্বাস্থ্য বীমা' বাজার থেকে বীমার আবেদন করতে পারেন।",
    auth: "অ্যাকাউন্ট সাহায্যের জন্য: আপনি শ্রমিক বা মালিক হিসেবে রেজিস্টার করতে পারেন। লগইন করতে আপনার তথ্য ব্যবহার করুন।",
    general: "শ্রমসেতু সহায়তায় স্বাগতম! আমি উপস্থিতি, মজুরি, ভাড়া বা বীমা সম্পর্কিত তথ্য দিতে পারি। মানুষের সাহায্যের জন্য 'অ্যাডমিনকে পাঠান' ক্লিক করুন।"
  },
  gu: {
    attendance: "હાજરી ટ્રેક કરવા માટે: શ્રમિકો 'હાજરી ટ્રેકિંગ' માં જઈને રોજની હાજરી પૂરી શકે છે. માલિકો 'હાજરી સંચાલન' માં તેને મંજૂર કરી શકે છે.",
    wages: "મજૂરી માટે: માલિકો કામની પોસ્ટ વખતે જ રોજની મજૂરી નક્કી કરે છે. શ્રમિકો 'મજૂરી ટ્રેકિંગ' માં તે જોઈ શકે છે.",
    rentals: "સાધનો ભાડે મેળવવા: માલિકો 'ભાડા બજાર' માંથી ટ્રેક્ટર કે સ્પ્રેયર ભાડે મેળવી શકે છે.",
    insurance: "આરોગ્ય વીમા માટે: શ્રમિકો અને માલિકો 'આરોગ્ય વીમો' બજારમાંથી વીમો મેળવી શકે છે.",
    auth: "ખાતાની મદદ માટે: તમે શ્રમિક અથવા માલિક તરીકે રજીસ્ટ્રેશન કરાવી શકો છો. લોગિન કરવા તમારા આઈડી પાસવર્ડ વાપરો.",
    general: "શ્રમસેતુ સહાયતા કેન્દ્રમાં આપનું સ્વાગત છે! હું હાજરી, મજૂરી, ભાડાના સાધનો અથવા વીમા બાબતે મદદ કરી શકું છું. વધુ મદદ માટે 'એડમિનને મોકલો' પર ક્લિક કરો."
  },
  pa: {
    attendance: "ਹਾਜ਼ਰੀ ਟ੍ਰੈਕ ਕਰਨ ਲਈ: ਮਜ਼ਦੂਰ 'ਹਾਜ਼ਰੀ ਟ੍ਰੈਕਿੰਗ' ਵਿੱਚ ਜਾ ਕੇ ਰੋਜ਼ਾਨਾ ਚੈੱਕ-ਇਨ ਕਰ ਸਕਦੇ ਹਨ। ਮਾਲਕ 'ਹਾਜ਼ਰੀ ਪ੍ਰਬੰਧਨ' ਵਿੱਚ ਇਸਨੂੰ ਮਨਜ਼ੂਰ ਕਰ ਸਕਦੇ ਹਨ।",
    wages: "ਮਜ਼ਦੂਰੀ ਲਈ: ਮਾਲਕ ਕੰਮ ਪੋਸਟ ਕਰਨ ਵੇਲੇ ਰੋਜ਼ਾਨਾ ਮਜ਼ਦੂਰੀ ਤੈਅ ਕਰਦੇ ਹਨ। ਮਜ਼ਦੂਰ 'ਮਜ਼ਦੂਰੀ ਟ੍ਰੈਕਿੰਗ' ਵਿੱਚ ਆਪਣੀ ਮਜ਼ਦੂਰੀ ਦੇਖ ਸਕਦੇ ਹਨ।",
    rentals: "ਸਾਜ਼ੋ-ਸਾਮਾਨ ਕਿਰਾਏ 'ਤੇ ਲੈਣ ਲਈ: ਮਾਲਕ 'ਕਿਰਾਇਆ ਬਾਜ਼ਾਰ' ਤੋਂ ਟਰੈਕਟਰ ਅਤੇ ਸਪ੍ਰੇਅਰ ਕਿਰਾਏ 'ਤੇ ਲੈ ਸਕਦੇ ਹਨ।",
    insurance: "ਸਿਹਤ ਬੀਮੇ ਲਈ: ਮਜ਼ਦੂਰ ਅਤੇ ਮਾਲਕ 'ਸਿਹਤ ਬੀਮਾ' ਬਾਜ਼ਾਰ ਵਿੱਚੋਂ ਪਾਲਿਸੀਆਂ ਦੇਖ ਕੇ ਅਪਲਾਈ ਕਰ ਸਕਦੇ ਹਨ।",
    auth: "ਖਾਤਾ ਸਹਾਇਤਾ ਲਈ: ਤੁਸੀਂ ਮਜ਼ਦੂਰ ਜਾਂ ਮਾਲਕ ਵਜੋਂ ਰਜਿਸਟਰ ਕਰ ਸਕਦੇ ਹੋ। ਲੋਗਿਨ ਕਰਨ ਲਈ ਆਪਣੇ ਵੇਰਵੇ ਵਰਤੋ।",
    general: "ਸ਼੍ਰਮਸੇਤੂ ਸਹਾਇਤਾ ਕੇਂਦਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ! ਮੈਂ ਹਾਜ਼ਰੀ, ਮਜ਼ਦੂਰੀ, ਕਿਰਾਇਆ ਜਾਂ ਬੀਮੇ ਬਾਰੇ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਮਨੁੱਖੀ ਸਹਾਇਤਾ ਲਈ 'ਐਡਮਿਨ ਨੂੰ ਭੇਜੋ' 'ਤੇ ਕਲਿੱਕ ਕਰੋ।"
  }
};

// --- AI CHAT SUPPORT ENDPOINTS ---

// Send message to AI Support
app.post('/api/ai-chat/message', async (req, res) => {
  try {
    const { userId, userName, userRole, message, language } = req.body;
    const msgLang = language || 'en';
    
    // Save user message to database
    const userMsgId = generateUid();
    const userMessage = {
      messageId: userMsgId,
      userId,
      userName,
      userRole,
      sender: 'User',
      message,
      language: msgLang,
      createdAt: new Date().toISOString()
    };
    await db.collection('aiChatMessages').doc(userMsgId).set(userMessage);

    // AI Keyword Auto-Matching Engine
    const lowerMsg = message.toLowerCase();
    let replyKey = 'general';
    
    if (lowerMsg.includes('attend') || lowerMsg.includes('present') || lowerMsg.includes('absent') || lowerMsg.includes('હાજરી') || lowerMsg.includes('हाजिरी') || lowerMsg.includes('ಹಾಜರಾತಿ') || lowerMsg.includes('வருகை') || lowerMsg.includes('ಹಾಜರು')) {
      replyKey = 'attendance';
    } else if (lowerMsg.includes('wage') || lowerMsg.includes('pay') || lowerMsg.includes('salary') || lowerMsg.includes('money') || lowerMsg.includes('rupee') || lowerMsg.includes('મજૂરી') || lowerMsg.includes('मजदूरी') || lowerMsg.includes('ವೇತನ') || lowerMsg.includes('ஊதியம்') || lowerMsg.includes('వేతనం')) {
      replyKey = 'wages';
    } else if (lowerMsg.includes('rent') || lowerMsg.includes('equip') || lowerMsg.includes('tractor') || lowerMsg.includes('machine') || lowerMsg.includes('ભાડા') || lowerMsg.includes('किराया') || lowerMsg.includes('ಬಾಡಿಗೆ') || lowerMsg.includes('வாடகை') || lowerMsg.includes('అద్దె')) {
      replyKey = 'rentals';
    } else if (lowerMsg.includes('insur') || lowerMsg.includes('health') || lowerMsg.includes('medic') || lowerMsg.includes('claim') || lowerMsg.includes('વીમો') || lowerMsg.includes('बीमा') || lowerMsg.includes('ವಿಮೆ') || lowerMsg.includes('காப்பீடு') || lowerMsg.includes('భీమా')) {
      replyKey = 'insurance';
    } else if (lowerMsg.includes('login') || lowerMsg.includes('register') || lowerMsg.includes('profile') || lowerMsg.includes('account') || lowerMsg.includes('લોગિન') || lowerMsg.includes('लॉगिन') || lowerMsg.includes('ಲಾಗಿನ್') || lowerMsg.includes('உள்நுழைய') || lowerMsg.includes('లాగిన్')) {
      replyKey = 'auth';
    }

    const dict = localReplies[msgLang] || localReplies['en'];
    const aiText = dict[replyKey] || dict['general'];

    // Save AI response to database
    const aiMsgId = generateUid();
    const aiMessage = {
      messageId: aiMsgId,
      userId,
      userName,
      userRole,
      sender: 'AI',
      message: aiText,
      language: msgLang,
      createdAt: new Date().toISOString()
    };
    await db.collection('aiChatMessages').doc(aiMsgId).set(aiMessage);

    res.status(201).json(aiMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch Chat History
app.get('/api/ai-chat/history', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId parameter' });

    const snapshot = await db.collection('aiChatMessages')
      .where('userId', '==', userId)
      .get();
      
    const messages = snapshot.docs.map(d => d.data());
    // Sort programmatically since composite index might be missing in local emulator/Firestore setup
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear Chat History
app.delete('/api/ai-chat/history', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId parameter' });

    const snapshot = await db.collection('aiChatMessages').where('userId', '==', userId).get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({ message: 'Chat history cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUPPORT ESCALATION ENDPOINTS ---

// Submit Support Escalation
app.post('/api/support-escalations', async (req, res) => {
  try {
    const escalationId = generateUid();
    const { userId, userName, userRole, issueTitle, issueDescription, chatSummary } = req.body;

    const escalation = {
      escalationId,
      userId,
      userName,
      userRole,
      issueTitle: issueTitle || 'AI Help Escalation',
      issueDescription: issueDescription || '',
      chatSummary: chatSummary || '',
      status: 'Pending',
      adminReply: '',
      createdAt: new Date().toISOString(),
      resolvedAt: null
    };

    await db.collection('supportEscalations').doc(escalationId).set(escalation);
    res.status(201).json(escalation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Support Escalations
app.get('/api/support-escalations', async (req, res) => {
  try {
    const { userId, status } = req.query;
    let ref = db.collection('supportEscalations');

    if (userId) ref = ref.where('userId', '==', userId);
    if (status) ref = ref.where('status', '==', status);

    const snapshot = await ref.get();
    const list = snapshot.docs.map(d => d.data());
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin reply to Escalation
app.patch('/api/support-escalations/:id/reply', async (req, res) => {
  try {
    const escalationId = req.params.id;
    const { adminReply, status } = req.body;
    
    const updates = {
      resolvedAt: new Date().toISOString()
    };
    if (adminReply !== undefined) updates.adminReply = adminReply;
    if (status) updates.status = status;

    await db.collection('supportEscalations').doc(escalationId).update(updates);
    res.json({ message: 'Support escalation replied successfully', escalationId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- UNIFIED PROFITS STATISTICS ---

app.get('/api/admin/profits/stats', async (req, res) => {
  try {
    const [
      rentalCompaniesSnap,
      rentalTxsSnap,
      insuranceProvidersSnap,
      insuranceAppsSnap,
      insuranceTxsSnap
    ] = await Promise.all([
      db.collection('rentalCompanies').get(),
      db.collection('commissionTransactions').get(),
      db.collection('insuranceProviders').get(),
      db.collection('insuranceApplications').get(),
      db.collection('profitTransactions').where('sourceType', '==', 'insurance_commission').get()
    ]);

    const rentalCompanies = rentalCompaniesSnap.docs.map(d => d.data());
    const rentalTxs = rentalTxsSnap.docs.map(d => d.data());
    const providers = insuranceProvidersSnap.docs.map(d => d.data());
    const apps = insuranceAppsSnap.docs.map(d => d.data());
    const insuranceTxs = insuranceTxsSnap.docs.map(d => d.data());

    // 1. Rental Stats
    const totalRentalRevenue = rentalTxs.reduce((sum, tx) => sum + Number(tx.rentalAmount), 0);
    const totalRentalProfit = rentalTxs.reduce((sum, tx) => sum + Number(tx.adminProfit), 0);
    const pendingRentalProfit = rentalTxs.filter(tx => tx.paymentStatus === 'Pending').reduce((sum, tx) => sum + Number(tx.adminProfit), 0);

    // 2. Insurance Stats
    const totalInsuranceRevenue = insuranceTxs.reduce((sum, tx) => sum + Number(tx.grossAmount), 0);
    const totalInsuranceProfit = insuranceTxs.reduce((sum, tx) => sum + Number(tx.profitAmount), 0);
    const pendingInsuranceProfit = apps.filter(a => a.status === 'Pending').reduce((sum, a) => sum + Number(a.commissionAmount), 0);
    const completedInsuranceProfit = apps.filter(a => a.status === 'Active' || a.status === 'Completed').reduce((sum, a) => sum + Number(a.commissionAmount), 0);

    // 3. Unified Stats
    const totalPlatformProfit = totalRentalProfit + totalInsuranceProfit;

    // Monthly Profit aggregates
    const monthlyMap = {};
    rentalTxs.forEach(tx => {
      const date = new Date(tx.createdAt);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, rentalProfit: 0, insuranceProfit: 0, totalProfit: 0 };
      }
      monthlyMap[monthKey].rentalProfit += tx.adminProfit;
      monthlyMap[monthKey].totalProfit += tx.adminProfit;
    });

    insuranceTxs.forEach(tx => {
      const date = new Date(tx.createdAt);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, rentalProfit: 0, insuranceProfit: 0, totalProfit: 0 };
      }
      monthlyMap[monthKey].insuranceProfit += tx.profitAmount;
      monthlyMap[monthKey].totalProfit += tx.profitAmount;
    });
    const monthlyEarnings = Object.values(monthlyMap);

    // Provider performance
    const providerEarningsMap = {};
    providers.forEach(p => {
      providerEarningsMap[p.providerId] = {
        providerId: p.providerId,
        providerName: p.providerName,
        totalApplications: 0,
        revenue: 0,
        profit: 0
      };
    });

    insuranceTxs.forEach(tx => {
      const app = apps.find(a => a.applicationId === tx.sourceId) || {};
      const providerId = app.providerId || tx.providerId || 'unknown';
      const providerName = app.providerName || tx.providerName || 'Unknown Provider';

      if (!providerEarningsMap[providerId]) {
        providerEarningsMap[providerId] = {
          providerId,
          providerName,
          totalApplications: 0,
          revenue: 0,
          profit: 0
        };
      }
      providerEarningsMap[providerId].totalApplications += 1;
      providerEarningsMap[providerId].revenue += tx.grossAmount;
      providerEarningsMap[providerId].profit += tx.profitAmount;
    });
    const providerEarnings = Object.values(providerEarningsMap).sort((a, b) => b.profit - a.profit);

    // Unified Ledger lists
    const rentalLedger = rentalTxs.map(tx => ({
      id: tx.transactionId,
      sourceType: 'rental_commission',
      partnerName: tx.companyName,
      itemName: tx.equipmentName,
      grossAmount: tx.rentalAmount,
      profitAmount: tx.adminProfit,
      payoutAmount: tx.companyPayout,
      paymentStatus: tx.paymentStatus,
      createdAt: tx.createdAt
    }));

    const insuranceLedger = insuranceTxs.map(tx => {
      const app = apps.find(a => a.applicationId === tx.sourceId) || {};
      return {
        id: tx.transactionId,
        sourceType: 'insurance_commission',
        partnerName: app.providerName || 'Insurance Provider',
        itemName: app.planName || 'Insurance Plan',
        grossAmount: tx.grossAmount,
        profitAmount: tx.profitAmount,
        payoutAmount: tx.providerPayout,
        paymentStatus: tx.paymentStatus,
        createdAt: tx.createdAt
      };
    });

    const unifiedLedger = [...rentalLedger, ...insuranceLedger].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      kpis: {
        totalRentalProfit,
        totalInsuranceProfit,
        totalPlatformProfit,
        pendingRentalProfit,
        pendingInsuranceProfit,
        completedInsuranceProfit,
        totalRentalRevenue,
        totalInsuranceRevenue
      },
      providerEarnings,
      monthlyEarnings,
      ledger: unifiedLedger
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// ADMIN ROUTES
// =====================

// Get all users (non-admin)
app.get('/api/admin/users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').where('role', '!=', 'admin').get();
    const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a user
app.delete('/api/admin/users/:uid', async (req, res) => {
  try {
    await db.collection('users').doc(req.params.uid).delete();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get platform stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [usersSnap, jobsSnap, rentalsSnap] = await Promise.all([
      db.collection('users').where('role', '!=', 'admin').get(),
      db.collection('jobs').get(),
      db.collection('rentals').get(),
    ]);
    res.json({
      totalUsers: usersSnap.size,
      totalJobs: jobsSnap.size,
      totalRentals: rentalsSnap.size,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', project: process.env.FIREBASE_PROJECT_ID });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ ShramaSetu Backend running at http://localhost:${PORT}`);
  console.log(`🔥 Connected to Firebase project: ${serviceAccount.project_id}`);
});
