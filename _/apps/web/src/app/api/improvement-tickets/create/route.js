import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { improvementDescription, preferredContractorId, biddingDeadline } = await request.json();

    if (!improvementDescription || !biddingDeadline) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify user is a homeowner
    const userProfile = await sql`
      SELECT role FROM user_profiles WHERE user_id = ${session.user.id}
    `;

    if (userProfile.length === 0 || userProfile[0].role !== 'homeowner') {
      return Response.json({ error: "Only homeowners can create improvement tickets" }, { status: 403 });
    }

    // Validate preferred contractor if provided
    if (preferredContractorId) {
      const contractor = await sql`
        SELECT id FROM contractors 
        WHERE id = ${preferredContractorId} AND approval_status = 'approved'
      `;

      if (contractor.length === 0) {
        return Response.json({ error: "Invalid contractor selected" }, { status: 400 });
      }
    }

    // Create the improvement ticket
    const ticket = await sql`
      INSERT INTO improvement_tickets (
        homeowner_id, improvement_description, preferred_contractor_id, bidding_deadline, status
      )
      VALUES (
        ${session.user.id}, 
        ${improvementDescription}, 
        ${preferredContractorId || null}, 
        ${biddingDeadline}, 
        'open'
      )
      RETURNING id, improvement_description, preferred_contractor_id, bidding_deadline, status, created_at
    `;

    return Response.json(ticket[0]);
  } catch (error) {
    console.error('Create improvement ticket error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}