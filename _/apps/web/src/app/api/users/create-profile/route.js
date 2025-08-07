import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { email, role, fullName, contactNumber, address, companyName, username } = await request.json();

    // Find the user by email
    const user = await sql`
      SELECT id FROM auth_users WHERE email = ${email}
    `;

    if (user.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user[0].id;

    // Check if profile already exists
    const existingProfile = await sql`
      SELECT id FROM user_profiles WHERE user_id = ${userId}
    `;

    if (existingProfile.length > 0) {
      return Response.json({ error: "Profile already exists" }, { status: 400 });
    }

    if (role === "homeowner") {
      // Create homeowner profile
      await sql`
        INSERT INTO user_profiles (
          user_id, role, full_name, contact_number, address
        )
        VALUES (
          ${userId}, ${role}, ${fullName}, ${contactNumber}, ${address}
        )
      `;
    } else if (role === "contractor") {
      // Check if username is already taken
      const existingUsername = await sql`
        SELECT id FROM contractors WHERE username = ${username}
      `;

      if (existingUsername.length > 0) {
        return Response.json({ error: "Username already taken" }, { status: 400 });
      }

      // Create contractor profile
      await sql`
        INSERT INTO user_profiles (
          user_id, role, company_name, username
        )
        VALUES (
          ${userId}, ${role}, ${companyName}, ${username}
        )
      `;

      // Create contractor record
      await sql`
        INSERT INTO contractors (
          user_id, company_name, username, approval_status
        )
        VALUES (
          ${userId}, ${companyName}, ${username}, 'pending'
        )
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Create profile error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}