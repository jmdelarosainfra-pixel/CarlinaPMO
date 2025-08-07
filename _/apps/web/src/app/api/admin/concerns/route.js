import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminCheck = await sql`
      SELECT role FROM user_profiles 
      WHERE user_id = ${session.user.id} AND role = 'admin'
    `;

    if (adminCheck.length === 0) {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get all concerns with homeowner details
    const concerns = await sql`
      SELECT 
        c.id,
        c.description,
        c.attachment_url,
        c.status,
        c.admin_notes,
        c.handled_by,
        c.is_urgent,
        c.created_at,
        c.updated_at,
        au.name as homeowner_name,
        au.email as homeowner_email
      FROM concerns c
      JOIN auth_users au ON c.homeowner_id = au.id
      ORDER BY c.is_urgent DESC, c.created_at DESC
    `;

    return Response.json(concerns);
  } catch (error) {
    console.error('Error fetching concerns:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}