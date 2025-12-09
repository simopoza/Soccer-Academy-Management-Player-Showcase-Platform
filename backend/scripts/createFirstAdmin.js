const db = require('../db');
const { hashPassword } = require('../helpers/hashPassword');


const createFirstAdmin = async () => {
  try {
    // Admin details (change these!)
    const email = process.argv[2] || 'admin@academy.com';
    const password = process.argv[3] || 'Admin123!';
    const firstName = process.argv[4] || 'Super';
    const lastName = process.argv[5] || 'Admin';
    
    // Check if admin already exists
    const [existing] = await db.query(
      "SELECT id FROM Users WHERE role = 'admin' LIMIT 1"
    );
    
    if (existing.length > 0) {
      console.log('❌ Admin user already exists!');
      console.log('Admin ID:', existing[0].id);
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create first admin
    const [result] = await db.query(
      `INSERT INTO Users 
       (first_name, last_name, email, password, role, status, profile_completed, approved_at) 
       VALUES (?, ?, ?, ?, 'admin', 'approved', TRUE, NOW())`,
      [firstName, lastName, email, hashedPassword]
    );
    
    console.log('✅ First admin created successfully!');
    console.log('');
    console.log('Admin Details:');
    console.log('  ID:', result.insertId);
    console.log('  Email:', email);
    console.log('  Password:', password);
    console.log('  Name:', `${firstName} ${lastName}`);
    console.log('');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createFirstAdmin();