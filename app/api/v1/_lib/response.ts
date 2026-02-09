import { NextResponse } from "next/server";
import type { z } from "zod";

export function errorResponse(message: string, status: number): NextResponse {
    return NextResponse.json({ error: message }, { status });
}

type ParseSuccess<T> = { ok: true; data: T };
type ParseFailure = { ok: false; response: NextResponse };

export async function parseBody<T>(
    req: Request,
    schema: z.ZodSchema<T>
): Promise<ParseSuccess<T> | ParseFailure> {
    let raw: unknown;
    try {
        raw = await req.json();
    } catch {
        return {
            ok: false,
            response: errorResponse("Invalid JSON body.", 400),
        };
    }

    const result = schema.safeParse(raw);
    if (!result.success) {
        const issues = result.error.issues.map(
            (i) => `${i.path.join(".")}: ${i.message}`
        );
        return {
            ok: false,
            response: errorResponse(`Validation failed: ${issues.join("; ")}`, 422),
        };
    }

    return { ok: true, data: result.data };
}
