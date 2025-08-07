import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId, bidAmount, commitmentFinishDate, warrantyPeriodMonths } = await request.json();

    // Validate input
    if (!ticketId || !bidAmount || !commitmentFinishDate || !warrantyPeriodMonths) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
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
      return Response.json({ error: "Contractor not approved for bidding" }, { status: 403 });
    }

    // Check if improvement ticket exists and is open
    const ticket = await sql`
      SELECT id, status, bidding_deadline 
      FROM improvement_tickets 
      WHERE id = ${ticketId} AND status = 'open'
    `;

    if (ticket.length === 0) {
      return Response.json({ error: "Improvement ticket not found or not open for bidding" }, { status: 404 });
    }

    // Check if bidding deadline has passed
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    if (ticket[0].bidding_deadline < currentDate) {
      return Response.json({ error: "Bidding deadline has passed" }, { status: 400 });
    }

    // Check if contractor already submitted a bid for this ticket
    const existingBid = await sql`
      SELECT id FROM contractor_bids 
      WHERE ticket_id = ${ticketId} AND contractor_id = ${contractor[0].id}
    `;

    if (existingBid.length > 0) {
      // Update existing bid
      const updatedBid = await sql`
        UPDATE contractor_bids 
        SET 
          bid_amount = ${bidAmount},
          commitment_finish_date = ${commitmentFinishDate},
          warranty_period_months = ${warrantyPeriodMonths}
        WHERE id = ${existingBid[0].id}
        RETURNING id, bid_amount, commitment_finish_date, warranty_period_months
      `;

      return Response.json({ 
        success: true, 
        message: "Bid updated successfully",
        bid: updatedBid[0]
      });
    } else {
      // Create new bid
      const newBid = await sql`
        INSERT INTO contractor_bids (
          ticket_id,
          contractor_id,
          bid_amount,
          commitment_finish_date,
          warranty_period_months
        ) VALUES (
          ${ticketId},
          ${contractor[0].id},
          ${bidAmount},
          ${commitmentFinishDate},
          ${warrantyPeriodMonths}
        )
        RETURNING id, bid_amount, commitment_finish_date, warranty_period_months
      `;

      return Response.json({ 
        success: true, 
        message: "Bid submitted successfully",
        bid: newBid[0]
      });
    }
  } catch (error) {
    console.error('Error submitting bid:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}