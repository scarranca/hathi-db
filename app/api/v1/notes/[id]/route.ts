import { NextResponse } from "next/server";
import { requireApiKey } from "@/app/api/v1/_lib/auth";
import { errorResponse, parseBody } from "@/app/api/v1/_lib/response";
import { UpdateNoteSchema } from "@/app/api/v1/_lib/schemas";
import { fetchNotesByIds, patchNote, deleteNote } from "@/app/actions/notes";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: RouteContext) {
    const auth = requireApiKey(req);
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;

    try {
        const notes = await fetchNotesByIds([id]);
        if (notes.length === 0) {
            return errorResponse("Note not found.", 404);
        }
        return NextResponse.json({ note: notes[0] });
    } catch (error) {
        console.error(`GET /api/v1/notes/${id} error:`, error);
        return errorResponse("Failed to fetch note.", 500);
    }
}

export async function PATCH(req: Request, ctx: RouteContext) {
    const auth = requireApiKey(req);
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;

    const body = await parseBody(req, UpdateNoteSchema);
    if (!body.ok) return body.response;

    try {
        const note = await patchNote({ noteId: id, patches: body.data });
        return NextResponse.json({ note });
    } catch (error) {
        console.error(`PATCH /api/v1/notes/${id} error:`, error);
        return errorResponse("Failed to update note.", 500);
    }
}

export async function DELETE(req: Request, ctx: RouteContext) {
    const auth = requireApiKey(req);
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;

    try {
        await deleteNote({ noteId: id });
        return NextResponse.json({ deleted: true, id });
    } catch (error) {
        console.error(`DELETE /api/v1/notes/${id} error:`, error);
        return errorResponse("Failed to delete note.", 500);
    }
}
