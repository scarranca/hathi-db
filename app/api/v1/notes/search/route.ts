import { NextResponse } from "next/server";
import { requireApiKey } from "@/app/api/v1/_lib/auth";
import { errorResponse, parseBody } from "@/app/api/v1/_lib/response";
import { SemanticSearchSchema } from "@/app/api/v1/_lib/schemas";
import { searchNotesBySimilarity } from "@/app/agent_tools/semantic-search";

export async function POST(req: Request) {
    const auth = requireApiKey(req);
    if (!auth.ok) return auth.response;

    const body = await parseBody(req, SemanticSearchSchema);
    if (!body.ok) return body.response;

    try {
        const result = await searchNotesBySimilarity(body.data);
        return NextResponse.json(result);
    } catch (error) {
        console.error("POST /api/v1/notes/search error:", error);
        return errorResponse("Failed to perform semantic search.", 500);
    }
}
