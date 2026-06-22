import type { NoteTemplate } from "@/types/humanbase";

export function formatNoteTemplateContent(
  template: Pick<NoteTemplate, "questions">,
) {
  return template.questions
    .map((question) => {
      const trimmedQuestion = question.trim();
      const label = /[:?]$/.test(trimmedQuestion)
        ? trimmedQuestion
        : `${trimmedQuestion}:`;

      return `${label}\n`;
    })
    .join("\n");
}
