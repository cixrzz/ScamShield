"use client";

import { useState } from "react";
import { analyzeSecurity } from "../src/lib/security";
import { extractTextFromImage } from "../src/lib/ocr";

export default function Home() {
  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeSecurity> | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12">
        {/* Header */}
        <header className="mb-16 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">
            SCAM<span className="text-cyan-400">SHIELD</span>
          </div>

          <div className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
            AI Security Assistant
          </div>
        </header>

        {/* Hero */}
        <section className="flex flex-1 flex-col items-center text-center">
          <div className="mb-5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            AI-Powered Scam Detection
          </div>

          <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
            Don't just wonder if it's a scam.
            <span className="block text-cyan-400">
              Find out why.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            ScamShield analyzes suspicious messages and screenshots,
            identifies security warning signs, and explains what you
            should do next.
          </p>

          {/* Message Input */}
          <div className="mt-12 w-full max-w-3xl">
            <div className="relative rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste a suspicious message here..."
                className="min-h-44 w-full resize-none bg-transparent p-4 text-base text-white outline-none placeholder:text-slate-600"
              />

              {loading && (
  <div className="absolute inset-x-0 top-0 z-10 flex h-44 items-center justify-center rounded-2xl bg-slate-950/60 backdrop-blur-sm">
    <div className="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900/90 px-5 py-3 shadow-xl">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
      <span className="text-sm font-medium text-slate-200">
        Analyzing...
      </span>
    </div>
  </div>
)}

              <div className="flex flex-col gap-3 border-t border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-slate-500">
                  Don't include passwords or private information.
                </span>

                <button
                  disabled={!message.trim() || loading}
                 onClick={async () => {
  setLoading(true);

  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const result = analyzeSecurity(message);
    setAnalysis(result);

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        securityAnalysis: result,
      }),
    });

    const data = await response.json();
    setAiAnalysis(data);
  } finally {
    setLoading(false);
  }
}}
                  className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                 {loading ? (
  <span className="flex items-center gap-2">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
    Analyzing...
  </span>
) : (
  "Analyze Message"
)}
                </button>
              </div>
            </div>
{analysis && (
  <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-6 text-left">
    <p className="text-sm text-slate-500">Risk Score</p>

    <p className="mt-1 text-4xl font-bold text-cyan-400">
      {analysis.riskScore}/100
    </p>

    <div className="mt-6">
      <h2 className="font-semibold">Warning Signs</h2>

      {analysis.signals.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">
          No obvious scam indicators were detected.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {analysis.signals.map((signal, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <p className="font-medium">{signal.title}</p>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                {signal.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
{aiAnalysis && (
  <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-slate-900 p-6 text-left">
    <p className="text-sm text-cyan-400">AI Analysis</p>
   

    <h2 className="mt-2 text-2xl font-bold">
      {aiAnalysis.riskLevel} Risk
    </h2>

    <p className="mt-3 text-sm leading-6 text-slate-400">
      {aiAnalysis.summary}
    </p>

    <div className="mt-6">
      <h3 className="font-semibold">AI Warning Signs</h3>

      <div className="mt-3 space-y-3">
        {aiAnalysis.warningSigns?.map(
          (
            warning: { title: string; explanation: string },
            index: number
          ) => (
            <div
              key={index}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <p className="font-medium">{warning.title}</p>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                {warning.explanation}
              </p>
            </div>
          )
        )}
      </div>
    </div>

    <div className="mt-6">
      <h3 className="font-semibold">Recommended Actions</h3>

      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
        {aiAnalysis.recommendedActions?.map(
          (action: string, index: number) => (
            <li key={index}>• {action}</li>
          )
        )}
      </ul>
    </div>
  </div>
)}
            {/* Screenshot */}
            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-8">
              <p className="font-medium">Have a screenshot instead?</p>

              <p className="mt-2 text-sm text-slate-500">
                Upload it and ScamShield will extract the text for analysis.
              </p>

              <label className="mt-4 inline-block cursor-pointer rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-medium transition hover:bg-slate-800">
  Upload Screenshot
  <input
  type="file"
  accept="image/*"
  className="hidden"
  onChange={async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setLoading(true);

    try {
  const extractedText = await extractTextFromImage(file);

  setMessage(extractedText);

  const result = analyzeSecurity(extractedText);
  setAnalysis(result);

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: extractedText,
      securityAnalysis: result,
    }),
  });

  const data = await response.json();

await new Promise((resolve) => setTimeout(resolve, 2000));

setAiAnalysis(data);

} catch (error) {
  console.error("OCR error:", error);
} finally {
  setLoading(false);
}
  }}
/>
</label>
            </div>
          </div>

          {/* Examples */}
          <div className="mt-10">
            <p className="mb-3 text-sm text-slate-500">
              Try an example
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              {["Amazon", "USPS", "Discord", "Bank"].map((example) => (
                <button
                  key={example}
                  onClick={() =>
                    setMessage(
                      `Example suspicious ${example} message`
                    )
                  }
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-400 transition hover:border-cyan-400 hover:text-cyan-300"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-slate-600">
          ScamShield is an educational security assistant. Always verify
          suspicious messages through official channels.
        </footer>
      </div>
    </main>
  );
}