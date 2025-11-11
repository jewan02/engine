import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  let text: unknown;
  try {
    ({ text } = await req.json());
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json(
      { error: "Field 'text' must be a non-empty string" },
      { status: 400 }
    );
  }

  const prompt = `
You are a geometry interpreter for zoning envelopes.
Convert this text into a JSON command. Examples:
"make it 5 meters tall" → {"action":"resize","axis":"y","value":5}
"set front setback to 10m" → {"action":"setback","direction":"front","value":10}
"change color to red" → {"action":"color","value":"red"}
Return JSON only.
Command: "${text}"
`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const messageContent = result.choices[0].message?.content;
    if (!messageContent) {
      return NextResponse.json(
        { error: "Empty response from OpenAI" },
        { status: 502 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(messageContent);
    } catch {
      return NextResponse.json(
        { error: "Unable to parse OpenAI response" },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[interpret] OpenAI error", error);
    return NextResponse.json(
      { error: "Failed to interpret command" },
      { status: 500 }
    );
  }
}
