# Humanbase Vision

## Kurzbeschreibung

Humanbase ist eine datumsbasierte Notiz-App mit Kontakt- und Themenbezug. Das Projekt ist zuerst ein langlebiges persönliches Notiz- und Wissenssystem, nicht ein hochskalierendes SaaS-Produkt.

Die App soll helfen, Gedanken, Gespräche, Aufgaben und Informationen so zu speichern, dass sie später über Datum, Kontakte, Tags und Themen wiedergefunden werden können.

Humanbase ist eine Mischung aus:

- Tagebuch
- Notiz-App
- persönlichem CRM
- Gesprächsprotokoll
- Wissensdatenbank
- Projektgedächtnis

## Problem

Viele Notiz-Apps organisieren Inhalte primär über Ordner oder lose Seiten.

Das passt nicht gut für Menschen, die wissen möchten:

- Wann habe ich etwas notiert?
- Mit wem habe ich darüber gesprochen?
- Welche Themen kamen in welchem Gespräch vor?
- Was habe ich mit einer bestimmten Person zuletzt besprochen?
- Welche offenen Punkte hängen mit einem Kontakt oder Thema zusammen?
- Wie entwickelt sich ein Thema über Zeit?

Klassische Ordnerstrukturen sind dafür oft zu starr.

## Lösung

Humanbase organisiert Notizen über mehrere Dimensionen:

1. Datum
2. Kontakte
3. Themen
4. Tags
5. Suche
6. Verknüpfungen zwischen Notizen

Die wichtigste Standardansicht ist eine Timeline.

Von dort aus können Nutzer in andere Perspektiven wechseln:

- Kontaktansicht
- Tagansicht
- Themenansicht
- Suchansicht
- Tagesansicht
- Notizdetailansicht

## Produktprinzipien

### 1. Datum zuerst

Jede Notiz hat ein Datum. Die Timeline ist die zentrale Ansicht.

### 2. Kontakte als Kontext

Notizen können mit Kontakten verknüpft werden. Google Kontakte ist die einzige
operative Kontaktquelle. Humanbase importiert Kontakte ausschließlich lesend,
hält dafür stabile interne IDs und bewahrt die Beziehungen zu Notizen. Eine
manuelle Kontaktverwaltung in Humanbase ist nicht vorgesehen.

Humanbase darf aber eigene Beziehungserinnerungen rund um diese Kontakte
speichern: Familie, Freunde, Kolleginnen und Kollegen, Mentoren, unbekannte
Angehörige oder andere Personen, die noch nicht als Google-Kontakt existieren.
Diese Beziehungsebene wird nicht zu Google zurückgeschrieben.

### 3. Tags statt Ordner

Notizen werden nicht in Ordner einsortiert. Mehrere Tags erlauben verschiedene Themen und Kontexte gleichzeitig.

### 4. Mehrere Ansichten auf dieselben Daten

Die gleiche Notiz soll in Timeline, Kontaktansicht, Tagansicht, Suchergebnissen und Themenansicht auftauchen können.

### 5. Einfachheit vor Vollständigkeit

Humanbase soll durch eine Person verständlich und wartbar bleiben. Funktionen werden nur ergänzt, wenn der Kern stabil ist.

### 6. Datenhoheit und Langlebigkeit

Persönliche Daten müssen gesichert, exportiert und zu einem anderen Anbieter migriert werden können. Das Kernmodell verwendet PostgreSQL, Prisma und normale SQL-Relationen. Proprietäre Plattformfunktionen dürfen den Wechsel des Datenbankanbieters nicht unnötig erschweren.

## Langfristige Vision

Humanbase soll zu einem persönlichen Beziehungsgedächtnis werden. Nutzer sollen auf einen Blick sehen können:

- wann sie mit einer Person zuletzt gesprochen haben
- welche Themen mit einer Person verbunden sind
- welche Aufgaben aus Gesprächen entstanden sind
- welche Ideen sich über Zeit entwickelt haben
- welche Menschen mit welchen Projekten, Themen oder Entscheidungen verbunden sind

Später sind optionale Funktionen wie Zusammenfassungen, semantische Suche, Erinnerungen und Gesprächsvorbereitung denkbar.

## Nicht-Ziele für den Anfang

Humanbase optimiert zunächst nicht für:

- Millionen von Nutzern
- Teamfunktionen und komplexe Rechte
- eine native Mobile App
- Offline-Sync
- KI-Auswertung
- automatische Zwei-Wege-Synchronisation mit Google Contacts
- tiefe Kopplung an einen proprietären Backend-Anbieter

Der Kern bleibt:

> Notizen langlebig nach Datum, Kontakten und Tags organisieren.
