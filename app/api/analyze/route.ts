import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message, securityAnalysis } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "A message is required." },
        { status: 400 }
      );
    }

    const prompt = `
You are ScamShield, a cybersecurity analysis assistant.

Analyze the suspicious message below using ALL of the security signals detected by our rule-based security engine. Explain the most important signals in the message and do not ignore relevant detected evidence.

MESSAGE:
${message}

DETECTED SECURITY ANALYSIS:
${JSON.stringify(securityAnalysis, null, 2)}

IMPORTANT:
The rule-based risk score is the authoritative risk assessment.
Use these thresholds:
- 0-29 = LOW
- 30-59 = MEDIUM
- 60-100 = HIGH

Your "riskLevel" MUST match the risk score. Do not choose a different risk level.

Return ONLY valid JSON with this exact structure:

{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "summary": "A short explanation of the overall risk.",
  "warningSigns": [
    {
      "title": "Short warning sign",
      "explanation": "Why this is suspicious."
    }
  ],
  "recommendedActions": [
    "Safe action the user should take."
  ]
}

Rules:
- Do not claim certainty that a message or domain is fraudulent unless the evidence clearly supports it. Prefer phrases such as "suspicious", "potentially malicious", or "not verified" when certainty is not established.
- Do not say the risk score represents a probability.
- Explain the evidence in simple language.
- Give safe, practical recommendations.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const text = response.text ?? "";

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const result = JSON.parse(cleanedText);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Gemini analysis error:", error);

return NextResponse.json(
  {
    error: error instanceof Error ? error.message : String(error),
  },
  { status: 500 }
);
  }
}