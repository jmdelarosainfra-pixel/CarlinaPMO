import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get contractor profile
    const contractor = await sql`
      SELECT 
        c.id,
        c.company_name,
        c.username,
        c.approval_status,
        c.dti_sec_document,
        c.bir_certificate,
        c.business_permit,
        c.created_at,
        c.updated_at
      FROM contractors c
      WHERE c.user_id = ${session.user.id}
    `;

    if (contractor.length === 0) {
      return Response.json({ error: "Contractor profile not found" }, { status: 404 });
    }

    return Response.json(contractor[0]);
  } catch (error) {
    console.error('Error fetching contractor profile:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}