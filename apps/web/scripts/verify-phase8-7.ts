import { randomUUID } from "node:crypto";

import { buildUserJsonExport } from "../lib/export-data";
import { formatNoteTemplateContent } from "../lib/format-note-template-content";
import {
  JsonRestoreValidationError,
  restoreUserJsonExport,
  validateHumanbaseJsonExport,
} from "../lib/json-restore";
import {
  createNoteTemplateForUser,
  deleteNoteTemplateForUser,
  updateNoteTemplateForUser,
} from "../lib/note-template-service";
import { prisma } from "../lib/prisma";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const sourceUserId = randomUUID();
  const targetUserId = randomUUID();

  try {
    await prisma.user.createMany({
      data: [
        {
          id: sourceUserId,
          email: `phase8-7-source-${sourceUserId}@example.invalid`,
        },
        {
          id: targetUserId,
          email: `phase8-7-target-${targetUserId}@example.invalid`,
        },
      ],
    });

    const created = await createNoteTemplateForUser(sourceUserId, {
      name: "Arzttermin",
      questions: [
        "Behandelnder Arzt",
        "Beschwerden",
        "Diagnose",
        "Medikamente",
      ],
    });
    assert(created.ok, "A valid note template should be created.");

    const duplicate = await createNoteTemplateForUser(sourceUserId, {
      name: "arzttermin",
      questions: ["Andere Frage"],
    });
    assert(!duplicate.ok, "Template names should be unique per user.");

    const updated = await updateNoteTemplateForUser(sourceUserId, {
      id: created.template.id,
      name: "Arzttermin",
      questions: [
        "Behandelnder Arzt",
        "Beschwerden",
        "Diagnose",
        "Medikamente",
        "Nächster Termin?",
      ],
    });
    assert(updated.ok, "An owned template should be editable.");

    const formattedContent = formatNoteTemplateContent(updated.template);
    assert(
      formattedContent ===
        "Behandelnder Arzt:\n\nBeschwerden:\n\nDiagnose:\n\nMedikamente:\n\nNächster Termin?\n",
      "Template questions should produce the expected structured note content.",
    );

    const sourceExport = await buildUserJsonExport(sourceUserId);
    assert(
      sourceExport.noteTemplates.length === 1,
      "JSON export should include note templates.",
    );
    const invalidExport = structuredClone(sourceExport);
    invalidExport.noteTemplates[0].questions = [""];
    let invalidTemplateRejected = false;

    try {
      validateHumanbaseJsonExport(invalidExport);
    } catch (error) {
      invalidTemplateRejected = error instanceof JsonRestoreValidationError;
    }

    assert(
      invalidTemplateRejected,
      "JSON restore validation should reject empty template questions.",
    );

    const restoreResult = await restoreUserJsonExport(
      targetUserId,
      sourceExport,
    );
    const restoredTemplates = await prisma.noteTemplate.findMany({
      where: { userId: targetUserId },
    });
    assert(
      restoreResult.noteTemplates === 1 &&
        restoredTemplates.length === 1 &&
        restoredTemplates[0].questions.length === 5,
      "JSON restore should recreate note templates and their questions.",
    );
    assert(
      restoredTemplates[0].id !== created.template.id,
      "Restored template IDs should be remapped.",
    );

    const deleted = await deleteNoteTemplateForUser(
      sourceUserId,
      created.template.id,
    );
    assert(deleted.ok, "An owned template should be deletable.");

    console.log("Phase 8.7 verification passed:");
    console.log(
      JSON.stringify(
        {
          templateCrudVerified: true,
          caseInsensitiveNameUniquenessVerified: true,
          structuredContentVerified: true,
          invalidTemplateRestoreRejected: true,
          jsonExportAndRestoreVerified: true,
          restoredTemplateIdsRemapped: true,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.user.deleteMany({
      where: { id: { in: [sourceUserId, targetUserId] } },
    });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Phase 8.7 verification failed:");
  console.error(error);
  process.exitCode = 1;
});
