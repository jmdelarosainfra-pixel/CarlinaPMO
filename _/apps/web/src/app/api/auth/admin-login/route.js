import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Verify admin credentials
    if (username !== "Admin" || password !== "Password123") {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check if admin user exists
    const existingAdmin = await sql`
      SELECT u.id, u.email FROM auth_users u
      JOIN user_profiles p ON u.id = p.user_id
      WHERE u.email = 'admin@constructor.com' AND p.role = 'admin'
    `;

    if (existingAdmin.length === 0) {
      // Create admin user if doesn't exist
      const adminUser = await sql`
        INSERT INTO auth_users (email, name)
        VALUES ('admin@constructor.com', 'Admin')
        RETURNING id, email
      `;

      // Create admin profile
      await sql`
        INSERT INTO user_profiles (user_id, role, full_name)
        VALUES (${adminUser[0].id}, 'admin', 'System Administrator')
      `;

      // Create admin account for credentials
      await sql`
        INSERT INTO auth_accounts (
          "userId", type, provider, "providerAccountId", password
        )
        VALUES (
          ${adminUser[0].id}, 'credentials', 'credentials', 'admin@constructor.com', 'Password123'
        )
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}