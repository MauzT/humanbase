import "server-only";

import { prisma } from "@/lib/prisma";

const PEOPLE_API_CONNECTIONS_URL =
  "https://people.googleapis.com/v1/people/me/connections";

type GooglePersonField = {
  value?: string | null;
  metadata?: {
    primary?: boolean;
  };
};

export type GooglePerson = {
  resourceName?: string | null;
  names?: Array<{
    displayName?: string | null;
    metadata?: {
      primary?: boolean;
    };
  }> | null;
  emailAddresses?: GooglePersonField[] | null;
  phoneNumbers?: GooglePersonField[] | null;
  photos?: Array<
    GooglePersonField & {
      default?: boolean;
    }
  > | null;
};

type GoogleConnectionsResponse = {
  connections?: GooglePerson[];
  nextPageToken?: string;
};

export type ImportedGoogleContact = {
  externalId: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
};

export type GoogleContactsImportResult = {
  imported: number;
  skipped: number;
};

function selectPrimaryValue<T extends GooglePersonField>(
  fields: T[] | null | undefined,
): string | null {
  const selected =
    fields?.find(({ metadata }) => metadata?.primary) ?? fields?.[0];
  const value = selected?.value?.trim();

  return value || null;
}

export function toImportedGoogleContact(
  person: GooglePerson,
): ImportedGoogleContact | null {
  const externalId = person.resourceName?.trim();

  if (!externalId) {
    return null;
  }

  const primaryName =
    person.names?.find(({ metadata }) => metadata?.primary) ?? person.names?.[0];
  const email = selectPrimaryValue(person.emailAddresses);
  const phone = selectPrimaryValue(person.phoneNumbers);
  const avatarUrl = selectPrimaryValue(
    person.photos?.filter(({ default: isDefault }) => !isDefault),
  );
  const displayName =
    primaryName?.displayName?.trim() || email || phone || "Unbenannter Kontakt";

  return {
    externalId,
    displayName,
    email,
    phone,
    avatarUrl,
  };
}

export async function fetchGooglePeopleConnections(
  accessToken: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<GooglePerson[]> {
  const people: GooglePerson[] = [];
  let pageToken: string | undefined;
  let pageCount = 0;

  do {
    const url = new URL(PEOPLE_API_CONNECTIONS_URL);
    url.searchParams.set(
      "personFields",
      "names,emailAddresses,phoneNumbers,photos",
    );
    url.searchParams.set("pageSize", "1000");

    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetchImplementation(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      let details = "";

      try {
        const body = (await response.json()) as {
          error?: { message?: string };
        };
        details = body.error?.message ? ` ${body.error.message}` : "";
      } catch {
        // The status code still provides a useful, token-free error.
      }

      throw new Error(
        `Google People API request failed (${response.status}).${details}`,
      );
    }

    const body = (await response.json()) as GoogleConnectionsResponse;
    people.push(...(body.connections ?? []));
    pageToken = body.nextPageToken;
    pageCount += 1;

    if (pageCount > 100) {
      throw new Error("Google People API returned too many pages.");
    }
  } while (pageToken);

  return people;
}

export async function importGooglePeopleForUser(
  userId: string,
  people: GooglePerson[],
  syncedAt = new Date(),
): Promise<GoogleContactsImportResult> {
  const contacts = people
    .map(toImportedGoogleContact)
    .filter((contact): contact is ImportedGoogleContact => contact !== null);
  const uniqueContacts = [
    ...new Map(contacts.map((contact) => [contact.externalId, contact])).values(),
  ];

  for (let index = 0; index < uniqueContacts.length; index += 25) {
    const batch = uniqueContacts.slice(index, index + 25);

    await Promise.all(
      batch.map((contact) =>
        prisma.contact.upsert({
          where: {
            userId_externalProvider_externalId: {
              userId,
              externalProvider: "google",
              externalId: contact.externalId,
            },
          },
          create: {
            userId,
            displayName: contact.displayName,
            email: contact.email,
            phone: contact.phone,
            avatarUrl: contact.avatarUrl,
            source: "google",
            externalProvider: "google",
            externalId: contact.externalId,
            lastSyncedAt: syncedAt,
          },
          update: {
            displayName: contact.displayName,
            email: contact.email,
            phone: contact.phone,
            avatarUrl: contact.avatarUrl,
            source: "google",
            lastSyncedAt: syncedAt,
          },
        }),
      ),
    );
  }

  return {
    imported: uniqueContacts.length,
    skipped: people.length - contacts.length,
  };
}

export async function importGoogleContactsForUser(
  userId: string,
  accessToken: string,
): Promise<GoogleContactsImportResult> {
  const people = await fetchGooglePeopleConnections(accessToken);

  return importGooglePeopleForUser(userId, people);
}
