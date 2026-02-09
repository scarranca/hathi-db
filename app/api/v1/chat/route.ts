import { NextResponse } from "next/server";
import { generateText, stepCountIs } from "ai";
import { requireApiKey } from "@/app/api/v1/_lib/auth";
import { errorResponse, parseBody } from "@/app/api/v1/_lib/response";
import { ChatSchema } from "@/app/api/v1/_lib/schemas";
import { agentSystemPrompt } from "@/lib/prompts/agent-prompt";
import { getAiService, getAiConfig } from "@/lib/ai";
import { tools } from "@/app/agent_tools";

export const maxDuration = 50;

export async function POST(req: Request) {
    const auth = requireApiKey(req);
    if (!auth.ok) return auth.response;

    const body = await parseBody(req, ChatSchema);
    if (!body.ok) return body.response;

    try {
        const aiService = await getAiService();
        const aiConfig = await getAiConfig();
        const model = aiService.getLanguageModel(aiConfig.agentModel.model);

        const result = await generateText({
            model,
            messages: [{ role: "user", content: body.data.message }],
            maxRetries: 2,
            system: agentSystemPrompt(),
            stopWhen: stepCountIs(5),
            toolChoice: "auto",
            tools,
        });

        // Extract the answer tool call result if present
        const answerCall = result.steps
            .flatMap((s) => s.toolCalls)
            .find((tc) => tc.toolName === "answer");

        const answerInput = answerCall?.input as
            | {
                  foundNotes?: string[];
                  answer?: string;
                  searchStrategy?: string;
                  summary?: string;
              }
            | undefined;

        return NextResponse.json({
            answer: answerInput?.answer ?? result.text ?? "",
            sources: answerInput?.foundNotes ?? [],
            searchStrategy: answerInput?.searchStrategy ?? null,
            toolCalls: result.steps.flatMap((s) =>
                s.toolCalls.map((tc) => ({
                    tool: tc.toolName,
                    input: tc.input,
                }))
            ),
        });
    } catch (error) {
        console.error("POST /api/v1/chat error:", error);
        return errorResponse("Failed to process chat request.", 500);
    }
}
