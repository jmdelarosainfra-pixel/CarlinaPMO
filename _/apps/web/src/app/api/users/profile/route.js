import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await sql`
      SELECT 
        p.id,
        p.role,
        p.full_name,
        p.contact_number,
        p.address,
        p.company_name,
        p.username,
        u.email,
        u.name
      FROM user_profiles p
      JOIN auth_users u ON p.user_id = u.id
      WHERE p.user_id = ${session.user.id}
    `;

    if (profile.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    return Response.json(profile[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}