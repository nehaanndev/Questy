import { readFile } from "node:fs/promises";
import path from "node:path";
import { POST } from "@/app/api/generate-questions/route";
import type { QuestionPack } from "@/lib/types";

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("Usage: npm run smoke:upload -- /absolute/path/to/notes.pdf");
    process.exit(2);
  }

  const bytes = await readFile(filePath);
  const file = new File([bytes], path.basename(filePath), { type: "application/pdf" });
  const body = new FormData();
  body.append("file", file);

  const response = await POST(
    new Request("http://localhost/api/generate-questions", {
      method: "POST",
      body,
    }),
  );

  const payload = (await response.json()) as { pack?: QuestionPack; error?: string; detail?: string };

  if (!response.ok || !payload.pack) {
    console.error(JSON.stringify({ status: response.status, ...payload }, null, 2));
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        status: response.status,
        title: payload.pack.title,
        source: payload.pack.sourceName,
        generatedBy: payload.pack.generatedBy,
        topics: payload.pack.topics,
        questions: payload.pack.questions.map((question) => ({
          prompt: question.prompt,
          answer: question.choices[question.correctIndex],
          page: question.evidence.pageLabel,
          quote: question.evidence.quote,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
