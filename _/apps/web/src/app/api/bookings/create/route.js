import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingType, requestedDate } = await request.json();

    if (!bookingType || !requestedDate) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!['punchlist', 'acceptance'].includes(bookingType)) {
      return Response.json({ error: "Invalid booking type" }, { status: 400 });
    }

    // Verify user is a homeowner
    const userProfile = await sql`
      SELECT role FROM user_profiles WHERE user_id = ${session.user.id}
    `;

    if (userProfile.length === 0 || userProfile[0].role !== 'homeowner') {
      return Response.json({ error: "Only homeowners can create bookings" }, { status: 403 });
    }

    // Create the booking
    const booking = await sql`
      INSERT INTO date_bookings (
        homeowner_id, booking_type, requested_date, status
      )
      VALUES (
        ${session.user.id}, ${bookingType}, ${requestedDate}, 'pending'
      )
      RETURNING id, booking_type, requested_date, status, created_at
    `;

    return Response.json(booking[0]);
  } catch (error) {
    console.error('Create booking error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}