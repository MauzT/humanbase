-- Imported provider identities must be unique per Humanbase user so repeated
-- read-only imports update the existing local contact instead of duplicating it.
DROP INDEX "Contact_userId_externalProvider_externalId_idx";

CREATE UNIQUE INDEX "Contact_userId_externalProvider_externalId_key"
ON "Contact"("userId", "externalProvider", "externalId");
