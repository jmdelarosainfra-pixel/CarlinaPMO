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

    // Get pending contractors with user details
    const pendingContractors = await sql`
      SELECT 
        c.id,
        c.company_name,
        c.username,
        c.approval_status,
        c.dti_sec_document,
        c.bir_certificate,
        c.business_permit,
        c.created_at,
        c.updated_at,
        au.name,
        au.email,
        up.full_name,
        up.contact_number,
        up.address
      FROM contractors c
      JOIN auth_users au ON c.user_id = au.id
      LEFT JOIN user_profiles up ON c.user_id = up.user_id
      WHERE c.approval_status = 'pending'
      ORDER BY c.created_at ASC
    `;

    return Response.json(pendingContractors);
  } catch (error) {
    console.error('Error fetching pending contractors:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}