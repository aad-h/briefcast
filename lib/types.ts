export type Source = { id: number; url: string; title: string; text: string };
export type Segment = { speaker: string; text: string; sourceIds: number[] };
export type Episode = { title: string; summary: string; segments: Segment[]; sources: Pick<Source, "id" | "url" | "title">[]; audioBase64?: string };
