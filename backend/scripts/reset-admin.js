require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { Admin } = require('../db/db');

const adminEmail = 'admin@gcet.edu.in';
const adminPassword = process.env.RESET_ADMIN_PASSWORD;

if (!adminPassword) {
    throw new Error('RESET_ADMIN_PASSWORD is not configured for this one-time reset');
}

async function resetAdmin() {
    await mongoose.connection.asPromise();

    const password = await bcrypt.hash(adminPassword, 10);
    await Admin.deleteMany({});
    await Admin.create({
        username: adminEmail.split('@')[0],
        email: adminEmail,
        password,
        role: 'admin'
    });

    console.log(`Removed all existing admins and created ${adminEmail}`);
    await mongoose.disconnect();
}

resetAdmin().catch(async (error) => {
    console.error('Admin reset failed:', error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
});
