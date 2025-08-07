import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if contractor is approved
    const contractor = await sql`
      SELECT id, approval_status FROM contractors 
      WHERE user_id = ${session.user.id}
    `;

    if (contractor.length === 0) {
      return Response.json({ error: "Contractor profile not found" }, { status: 404 });
    }

    if (contractor[0].approval_status !== 'approved') {
      return Response.json({ error: "Contractor not approved" }, { status: 403 });
    }

    // Get open improvement tickets with homeowner details
    const tickets = await sql`
      SELECT 
        it.id,
        it.improvement_description,
        it.bidding_deadline,
        it.status,
        it.floor_plan_url,
        it.created_at,
        au.name as homeowner_name,
        au.email as homeowner_email,
        -- Check if this contractor already submitted a bid
        CASE WHEN cb.id IS NOT NULL THEN true ELSE false END as has_bid,
        cb.bid_amount as existing_bid_amount,
        cb.commitment_finish_date as existing_commitment_date,
        cb.warranty_period_months as existing_warranty_months
      FROM improvement_tickets it
      JOIN auth_users au ON it.homeowner_id = au.id
      LEFT JOIN contractor_bids cb ON it.id = cb.ticket_id AND cb.contractor_id = ${contractor[0].id}
      WHERE it.status = 'open' 
        AND it.bidding_deadline >= CURRENT_DATE
      ORDER BY it.bidding_deadline ASC, it.created_at DESC
    `;

    return Response.json(tickets);
  } catch (error) {
    console.error('Error fetching improvement tickets:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}