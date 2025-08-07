import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { description, attachmentUrl } = await request.json();

    if (!description) {
      return Response.json({ error: "Description is required" }, { status: 400 });
    }

    // Verify user is a homeowner
    const userProfile = await sql`
      SELECT role FROM user_profiles WHERE user_id = ${session.user.id}
    `;

    if (userProfile.length === 0 || userProfile[0].role !== 'homeowner') {
      return Response.json({ error: "Only homeowners can submit concerns" }, { status: 403 });
    }

    // Create the concern
    const concern = await sql`
      INSERT INTO concerns (
        homeowner_id, description, attachment_url, status
      )
      VALUES (
        ${session.user.id}, ${description}, ${attachmentUrl || null}, 'not_resolved'
      )
      RETURNING id, description, attachment_url, status, created_at
    `;

    return Response.json(concern[0]);
  } catch (error) {
    console.error('Create concern error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}