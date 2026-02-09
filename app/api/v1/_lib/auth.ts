import { NextResponse } from "next/server";

type AuthSuccess = { ok: true };
type AuthFailure = { ok: false; response: NextResponse };
type AuthResult = AuthSuccess | AuthFailure;

export function requireApiKey(req: Request): AuthResult {
    const apiKey = process.env.HATHI_API_KEY;

    if (!apiKey) {
        return {
            ok: false,
            response: NextResponse.json(
                { error: "Agent API is disabled. Set HATHI_API_KEY to enable it." },
                { status: 503 }
            ),
        };
    }

    const header = req.headers.get("authorization");
    if (!header || !header.startsWith("Bearer ")) {
        return {
            ok: false,
            response: NextResponse.json(
                { error: "Missing or malformed Authorization header. Expected: Bearer <key>" },
                { status: 401 }
            ),
        };
    }

    const token = header.slice(7);
    if (token !== apiKey) {
        return {
            ok: false,
            response: NextResponse.json(
                { error: "Invalid API key." },
                { status: 403 }
            ),
        };
    }

    return { ok: true };
}
