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

    // Get all date bookings with homeowner details
    const bookings = await sql`
      SELECT 
        db.id,
        db.booking_type,
        db.requested_date,
        db.status,
        db.admin_notes,
        db.punchlist_photos,
        db.created_at,
        db.updated_at,
        au.name as homeowner_name,
        au.email as homeowner_email
      FROM date_bookings db
      JOIN auth_users au ON db.homeowner_id = au.id
      ORDER BY db.requested_date ASC, db.created_at DESC
    `;

    return Response.json(bookings);
  } catch (error) {
    console.error('Error fetching date bookings:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}