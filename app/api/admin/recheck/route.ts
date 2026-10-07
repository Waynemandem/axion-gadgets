import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyOrder } from "@/lib/orders";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (typeof body?.reference !== "string") {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const result = await verifyOrder(body.reference);
  return NextResponse.json({ state: result.state });
}