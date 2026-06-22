import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildDefaultDevelopmentUserJsonExport } from "../lib/export-data";
import { prisma } from "../lib/prisma";

function getTimestampForFilename(date: Date) {
  return date.toISOString().replaceAll(":", "-").replace(".", "-");
}

async function main() {
  const exportData = await buildDefaultDevelopmentUserJsonExport();
  const exportDirectory = path.join(process.cwd(), "exports");
  const exportPath = path.join(
    exportDirectory,
    `humanbase-export-${getTimestampForFilename(new Date())}.json`,
  );

  await mkdir(exportDirectory, { recursive: true });
  await writeFile(exportPath, `${JSON.stringify(exportData, null, 2)}\n`, {
    encoding: "utf8",
  });

  console.log(`Wrote Humanbase JSON export to ${exportPath}`);
  console.log(
    JSON.stringify(
      {
        notes: exportData.notes.length,
        noteTemplates: exportData.noteTemplates.length,
        contacts: exportData.contacts.length,
        tags: exportData.tags.length,
        noteContacts: exportData.noteContacts.length,
        noteTags: exportData.noteTags.length,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("Humanbase JSON export failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
