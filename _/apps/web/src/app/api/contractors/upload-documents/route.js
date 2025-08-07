import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dtiSecDocument, birCertificate, businessPermit } = await request.json();

    // Check if contractor profile exists
    const existingContractor = await sql`
      SELECT id FROM contractors WHERE user_id = ${session.user.id}
    `;

    if (existingContractor.length === 0) {
      return Response.json({ error: "Contractor profile not found" }, { status: 404 });
    }

    // Build update query dynamically
    let updateFields = [];
    let updateValues = [];

    if (dtiSecDocument) {
      updateFields.push('dti_sec_document = $' + (updateValues.length + 1));
      updateValues.push(dtiSecDocument);
    }

    if (birCertificate) {
      updateFields.push('bir_certificate = $' + (updateValues.length + 1));
      updateValues.push(birCertificate);
    }

    if (businessPermit) {
      updateFields.push('business_permit = $' + (updateValues.length + 1));
      updateValues.push(businessPermit);
    }

    if (updateFields.length === 0) {
      return Response.json({ error: "No documents provided" }, { status: 400 });
    }

    // Add updated_at field
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add contractor ID to values
    updateValues.push(existingContractor[0].id);

    const updateQuery = `
      UPDATE contractors 
      SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length}
      RETURNING id, approval_status
    `;

    const result = await sql(updateQuery, updateValues);

    return Response.json({ 
      success: true, 
      contractorId: result[0].id,
      approvalStatus: result[0].approval_status
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}