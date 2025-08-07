import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
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

    const { contractorId, action } = await request.json();

    // Validate input
    if (!contractorId || !action) {
      return Response.json({ error: "Missing contractor ID or action" }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return Response.json({ error: "Invalid action. Must be 'approve' or 'reject'" }, { status: 400 });
    }

    // Check if contractor exists and is pending
    const contractor = await sql`
      SELECT id, approval_status, company_name
      FROM contractors 
      WHERE id = ${contractorId} AND approval_status = 'pending'
    `;

    if (contractor.length === 0) {
      return Response.json({ error: "Contractor not found or not pending approval" }, { status: 404 });
    }

    // Update contractor approval status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    const updatedContractor = await sql`
      UPDATE contractors 
      SET 
        approval_status = ${newStatus},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${contractorId}
      RETURNING id, company_name, approval_status
    `;

    return Response.json({ 
      success: true, 
      message: `Contractor "${updatedContractor[0].company_name}" has been ${newStatus}`,
      contractor: updatedContractor[0]
    });
  } catch (error) {
    console.error('Error updating contractor approval:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}