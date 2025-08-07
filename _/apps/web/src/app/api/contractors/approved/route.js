import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const contractors = await sql`
      SELECT 
        c.id,
        c.company_name,
        c.username,
        u.email
      FROM contractors c
      JOIN auth_users u ON c.user_id = u.id
      WHERE c.approval_status = 'approved'
      ORDER BY c.company_name
    `;

    return Response.json(contractors);
  } catch (error) {
    console.error('Get approved contractors error:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}