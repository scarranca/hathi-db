import { NextResponse } from "next/server";
import { requireApiKey } from "@/app/api/v1/_lib/auth";
import { errorResponse, parseBody } from "@/app/api/v1/_lib/response";
import { FilterNotesSchema } from "@/app/api/v1/_lib/schemas";
import { filterNotes } from "@/app/agent_tools/filter-notes";

export async function POST(req: Request) {
    const auth = requireApiKey(req);
    if (!auth.ok) return auth.response;

    const body = await parseBody(req, FilterNotesSchema);
    if (!body.ok) return body.response;

    try {
        const result = await filterNotes(body.data);
        return NextResponse.json(result);
    } catch (error) {
        console.error("POST /api/v1/notes/filter error:", error);
        return errorResponse("Failed to filter notes.", 500);
    }
}
