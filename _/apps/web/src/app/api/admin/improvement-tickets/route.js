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

    // Get all improvement tickets with homeowner details and bid counts
    const tickets = await sql`
      SELECT 
        it.id,
        it.improvement_description,
        it.bidding_deadline,
        it.status,
        it.floor_plan_url,
        it.created_at,
        it.updated_at,
        au.name as homeowner_name,
        au.email as homeowner_email,
        pc.company_name as preferred_contractor,
        wc.company_name as winning_contractor,
        COUNT(cb.id) as bid_count
      FROM improvement_tickets it
      JOIN auth_users au ON it.homeowner_id = au.id
      LEFT JOIN contractors pc ON it.preferred_contractor_id = pc.id
      LEFT JOIN contractors wc ON it.winning_contractor_id = wc.id
      LEFT JOIN contractor_bids cb ON it.id = cb.ticket_id
      GROUP BY it.id, au.name, au.email, pc.company_name, wc.company_name
      ORDER BY it.created_at DESC
    `;

    return Response.json(tickets);
  } catch (error) {
    console.error('Error fetching improvement tickets:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}