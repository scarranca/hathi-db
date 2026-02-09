import { z } from "zod";
import { TodoStatus } from "@/db/types";

export const CreateNoteSchema = z.object({
    content: z.string().min(1, "content is required"),
    key_context: z.string().min(1, "key_context is required"),
    contexts: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    note_type: z
        .enum(["note", "todo", "ai-todo", "ai-note"])
        .nullable()
        .optional(),
    deadline: z.string().nullable().optional(),
    status: z.nativeEnum(TodoStatus).nullable().optional(),
});

export const UpdateNoteSchema = z.object({
    content: z.string().optional(),
    contexts: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    suggested_contexts: z.array(z.string()).optional(),
    note_type: z
        .enum(["note", "todo", "ai-todo", "ai-note"])
        .nullable()
        .optional(),
    deadline: z.string().nullable().optional(),
    status: z.nativeEnum(TodoStatus).nullable().optional(),
});

export const FetchNotesQuerySchema = z.object({
    keyContext: z.string().optional(),
    contexts: z.string().optional(), // comma-separated
    method: z.enum(["AND", "OR"]).optional(),
});

export const FilterNotesSchema = z.object({
    createdAfter: z.string().optional(),
    createdBefore: z.string().optional(),
    contexts: z.array(z.string()).optional(),
    hashtags: z.array(z.string()).optional(),
    noteType: z.string().optional(),
    deadlineAfter: z.string().optional(),
    deadlineBefore: z.string().optional(),
    deadlineOn: z.string().optional(),
    status: z.nativeEnum(TodoStatus).optional(),
    limit: z.number().min(1).max(50).optional(),
});

export const SemanticSearchSchema = z.object({
    query: z.string().min(1, "query is required"),
    similarityThreshold: z.number().min(0.3).max(0.9).optional(),
    limit: z.number().min(1).max(100).optional(),
});

export const ChatSchema = z.object({
    message: z.string().min(1, "message is required"),
});
