import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/services/auth";
import { getUsageCounts } from "@/lib/services/credits";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const counts = await getUsageCounts(user.id);
  return NextResponse.json(counts);
}
