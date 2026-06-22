"use client";

import { useEffect, useState } from "react";

import {
  createNoteTemplateForCurrentUser,
  deleteNoteTemplateForCurrentUser,
  updateNoteTemplateForCurrentUser,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import type { NoteTemplate } from "@/types/humanbase";

type NoteTemplateManagerProps = {
  templates: NoteTemplate[];
  onClose: () => void;
  onTemplateCreated: (template: NoteTemplate) => void;
  onTemplateUpdated: (template: NoteTemplate) => void;
  onTemplateDeleted: (templateId: string) => void;
};

const inputClasses =
  "min-h-12 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-base outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] sm:min-h-11 sm:text-sm";

function emptyQuestions() {
  return [""];
}

export function NoteTemplateManager({
  templates,
  onClose,
  onTemplateCreated,
  onTemplateUpdated,
  onTemplateDeleted,
}: NoteTemplateManagerProps) {
  const [editingTemplateId, setEditingTemplateId] = useState("");
  const [name, setName] = useState("");
  const [questions, setQuestions] = useState<string[]>(emptyQuestions);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving && !deletingTemplateId) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deletingTemplateId, isSaving, onClose]);

  function resetForm() {
    setEditingTemplateId("");
    setName("");
    setQuestions(emptyQuestions());
    setError("");
  }

  function editTemplate(template: NoteTemplate) {
    setEditingTemplateId(template.id);
    setName(template.name);
    setQuestions([...template.questions]);
    setError("");
  }

  function changeQuestion(index: number, value: string) {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, questionIndex) =>
        questionIndex === index ? value : question,
      ),
    );
  }

  function removeQuestion(index: number) {
    setQuestions((currentQuestions) => {
      const nextQuestions = currentQuestions.filter(
        (_, questionIndex) => questionIndex !== index,
      );
      return nextQuestions.length > 0 ? nextQuestions : emptyQuestions();
    });
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setQuestions((currentQuestions) => {
      const destination = index + direction;

      if (destination < 0 || destination >= currentQuestions.length) {
        return currentQuestions;
      }

      const nextQuestions = [...currentQuestions];
      [nextQuestions[index], nextQuestions[destination]] = [
        nextQuestions[destination],
        nextQuestions[index],
      ];
      return nextQuestions;
    });
  }

  async function saveTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const input = { name, questions };
      const result = editingTemplateId
        ? await updateNoteTemplateForCurrentUser({
            id: editingTemplateId,
            ...input,
          })
        : await createNoteTemplateForCurrentUser(input);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (editingTemplateId) {
        onTemplateUpdated(result.template);
      } else {
        onTemplateCreated(result.template);
      }

      resetForm();
    } catch {
      setError("Die Vorlage konnte nicht gespeichert werden.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteTemplate(template: NoteTemplate) {
    if (
      !window.confirm(
        `Vorlage "${template.name}" wirklich löschen? Bereits erstellte Notizen bleiben unverändert.`,
      )
    ) {
      return;
    }

    setError("");
    setDeletingTemplateId(template.id);

    try {
      const result = await deleteNoteTemplateForCurrentUser(template.id);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onTemplateDeleted(result.templateId);

      if (editingTemplateId === result.templateId) {
        resetForm();
      }
    } catch {
      setError("Die Vorlage konnte nicht gelöscht werden.");
    } finally {
      setDeletingTemplateId("");
    }
  }

  function handleBackdropPointerDown(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (
      event.target === event.currentTarget &&
      !isSaving &&
      !deletingTemplateId
    ) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-stretch justify-center bg-[rgba(30,41,37,0.45)] sm:items-center sm:px-4 sm:py-8"
      onPointerDown={handleBackdropPointerDown}
    >
      <section
        aria-labelledby="note-template-manager-title"
        aria-modal="true"
        role="dialog"
        className="flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden bg-[var(--card)] shadow-xl sm:h-auto sm:max-h-[calc(100dvh-4rem)] sm:rounded-2xl sm:border sm:border-[var(--border)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-5">
          <div>
            <h2
              id="note-template-manager-title"
              className="text-lg font-semibold"
            >
              Notizvorlagen
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Wiederkehrende Fragen einmal festlegen und beim Schreiben nutzen.
            </p>
          </div>
          <Button
            aria-label="Vorlagenverwaltung schließen"
            title="Schließen"
            variant="ghost"
            size="sm"
            disabled={isSaving || Boolean(deletingTemplateId)}
            onClick={onClose}
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </Button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)]">
          <form
            onSubmit={saveTemplate}
            className="flex flex-col gap-5 border-b border-[var(--border)] px-4 py-5 sm:px-5 lg:border-r lg:border-b-0"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-semibold">
                {editingTemplateId ? "Vorlage bearbeiten" : "Neue Vorlage"}
              </h3>
              {editingTemplateId ? (
                <button
                  type="button"
                  className="text-sm font-semibold text-[var(--accent)]"
                  onClick={resetForm}
                >
                  Neue anlegen
                </button>
              ) : null}
            </div>

            <label className="grid gap-2">
              <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                Name
              </span>
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Zum Beispiel: Arzttermin"
                maxLength={80}
                className={inputClasses}
              />
            </label>

            <fieldset className="flex flex-col gap-3">
              <legend className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                Fragen
              </legend>
              <p className="text-xs leading-5 text-[var(--muted)]">
                Die Reihenfolge wird später in die Notiz übernommen.
              </p>

              <div className="flex flex-col gap-2">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2"
                  >
                    <span className="w-5 text-center text-xs font-semibold text-[var(--muted)]">
                      {index + 1}
                    </span>
                    <input
                      aria-label={`Frage ${index + 1}`}
                      value={question}
                      onChange={(event) =>
                        changeQuestion(index, event.target.value)
                      }
                      placeholder={
                        index === 0
                          ? "Behandelnder Arzt"
                          : "Weitere Frage"
                      }
                      maxLength={200}
                      className={inputClasses}
                    />
                    <div className="flex">
                      <Button
                        aria-label={`Frage ${index + 1} nach oben`}
                        title="Nach oben"
                        variant="ghost"
                        size="sm"
                        disabled={index === 0}
                        onClick={() => moveQuestion(index, -1)}
                      >
                        ↑
                      </Button>
                      <Button
                        aria-label={`Frage ${index + 1} nach unten`}
                        title="Nach unten"
                        variant="ghost"
                        size="sm"
                        disabled={index === questions.length - 1}
                        onClick={() => moveQuestion(index, 1)}
                      >
                        ↓
                      </Button>
                      <Button
                        aria-label={`Frage ${index + 1} entfernen`}
                        title="Entfernen"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                disabled={questions.length >= 30}
                onClick={() =>
                  setQuestions((currentQuestions) => [
                    ...currentQuestions,
                    "",
                  ])
                }
                className="w-full sm:w-fit"
              >
                Frage hinzufügen
              </Button>
            </fieldset>

            {error ? (
              <p role="alert" className="text-sm text-[#9b4f4f]">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={
                isSaving ||
                !name.trim() ||
                !questions.some((question) => question.trim())
              }
              className="w-full sm:w-fit"
            >
              {isSaving
                ? "Wird gespeichert …"
                : editingTemplateId
                  ? "Änderungen speichern"
                  : "Vorlage erstellen"}
            </Button>
          </form>

          <div className="px-4 py-5 sm:px-5">
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h3 className="font-semibold">Vorhandene Vorlagen</h3>
              <span className="text-xs text-[var(--muted)]">
                {templates.length}
              </span>
            </div>

            {templates.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {templates.map((template) => (
                  <li
                    key={template.id}
                    className="rounded-xl border border-[var(--border)] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {template.name}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {template.questions.length}{" "}
                          {template.questions.length === 1
                            ? "Frage"
                            : "Fragen"}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          aria-label={`${template.name} bearbeiten`}
                          title="Bearbeiten"
                          variant="ghost"
                          size="sm"
                          disabled={Boolean(deletingTemplateId)}
                          onClick={() => editTemplate(template)}
                        >
                          ✎
                        </Button>
                        <Button
                          aria-label={`${template.name} löschen`}
                          title="Löschen"
                          variant="ghost"
                          size="sm"
                          disabled={Boolean(deletingTemplateId)}
                          onClick={() => deleteTemplate(template)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                    <ol className="mt-3 flex flex-col gap-1 text-xs leading-5 text-[var(--muted)]">
                      {template.questions.slice(0, 4).map((question, index) => (
                        <li key={`${template.id}-${index}`} className="truncate">
                          {index + 1}. {question}
                        </li>
                      ))}
                      {template.questions.length > 4 ? (
                        <li>… und {template.questions.length - 4} weitere</li>
                      ) : null}
                    </ol>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-center text-sm leading-6 text-[var(--muted)]">
                Noch keine Vorlagen vorhanden.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
