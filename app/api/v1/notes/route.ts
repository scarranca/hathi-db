import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireApiKey } from "@/app/api/v1/_lib/auth";
import { errorResponse, parseBody } from "@/app/api/v1/_lib/response";
import { CreateNoteSchema, FetchNotesQuerySchema } from "@/app/api/v1/_lib/schemas";
import { fetchNotes, addNote } from "@/app/actions/notes";

export async function GET(req: Request) {
    const auth = requireApiKey(req);
    if (!auth.ok) return auth.response;

    try {
        const url = new URL(req.url);
        const raw = {
            keyContext: url.searchParams.get("keyContext") ?? undefined,
            contexts: url.searchParams.get("contexts") ?? undefined,
            method: url.searchParams.get("method") ?? undefined,
        };

        const parsed = FetchNotesQuerySchema.safeParse(raw);
        if (!parsed.success) {
            const issues = parsed.error.issues.map(
                (i) => `${i.path.join(".")}: ${i.message}`
            );
            return errorResponse(`Validation failed: ${issues.join("; ")}`, 422);
        }

        const { keyContext, contexts, method } = parsed.data;
        const notes = await fetchNotes({
            keyContext,
            contexts: contexts ? contexts.split(",").map((c) => c.trim()) : undefined,
            method,
        });

        return NextResponse.json({ notes, count: notes.length });
    } catch (error) {
        console.error("GET /api/v1/notes error:", error);
        return errorResponse("Failed to fetch notes.", 500);
    }
}

export async function POST(req: Request) {
    const auth = requireApiKey(req);
    if (!auth.ok) return auth.response;

    const body = await parseBody(req, CreateNoteSchema);
    if (!body.ok) return body.response;

    try {
        const note = await addNote({ id: uuidv4(), ...body.data });
        return NextResponse.json({ note }, { status: 201 });
    } catch (error) {
        console.error("POST /api/v1/notes error:", error);
        return errorResponse("Failed to create note.", 500);
    }
}
