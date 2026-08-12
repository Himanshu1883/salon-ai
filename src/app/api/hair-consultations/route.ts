import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { createHairConsultation } from "@/actions/hair-consultations";

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.salonId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = await createHairConsultation({
    customerId: body.customerId,
    serviceId: body.serviceId,
    employeeId: body.employeeId,
    branchId: body.branchId,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
