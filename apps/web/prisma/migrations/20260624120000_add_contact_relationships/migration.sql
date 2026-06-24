CREATE TABLE "ContactRelationship" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "fromContactId" UUID NOT NULL,
  "toContactId" UUID,
  "relatedName" TEXT,
  "relationType" TEXT NOT NULL,
  "inverseRelationType" TEXT,
  "category" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContactRelationship_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContactRelationship_no_self_link_check" CHECK ("toContactId" IS NULL OR "fromContactId" <> "toContactId"),
  CONSTRAINT "ContactRelationship_relation_type_check" CHECK (length(btrim("relationType")) > 0),
  CONSTRAINT "ContactRelationship_category_check" CHECK (length(btrim("category")) > 0),
  CONSTRAINT "ContactRelationship_related_name_check" CHECK ("relatedName" IS NULL OR length(btrim("relatedName")) > 0),
  CONSTRAINT "ContactRelationship_inverse_relation_type_check" CHECK ("inverseRelationType" IS NULL OR length(btrim("inverseRelationType")) > 0),
  CONSTRAINT "ContactRelationship_note_check" CHECK ("note" IS NULL OR length(btrim("note")) > 0)
);

CREATE INDEX "ContactRelationship_userId_fromContactId_idx" ON "ContactRelationship"("userId", "fromContactId");

CREATE INDEX "ContactRelationship_userId_toContactId_idx" ON "ContactRelationship"("userId", "toContactId");

CREATE INDEX "ContactRelationship_userId_category_idx" ON "ContactRelationship"("userId", "category");

ALTER TABLE "ContactRelationship" ADD CONSTRAINT "ContactRelationship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactRelationship" ADD CONSTRAINT "ContactRelationship_fromContactId_fkey" FOREIGN KEY ("fromContactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactRelationship" ADD CONSTRAINT "ContactRelationship_toContactId_fkey" FOREIGN KEY ("toContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
