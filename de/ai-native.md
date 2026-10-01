---
title: Gebaut für KI-gestützte Entwicklung
order: 3
icon: phosphor-duotone:robot
summary: Warum der Start mit cbGenesis nachweislich weniger Tokens kostet und konsistenteren Code liefert, als einen KI-Agenten Auth, RBAC und das Admin-Panel aus einem leeren Repository bauen zu lassen.
tags: [ai, agents, skills, productivity]
---

# Gebaut für KI-gestützte Entwicklung

Jede ernsthafte App wird heute mit einem KI-Coding-Agenten irgendwo im Prozess gebaut. Die Frage ist nicht, ob du einen einsetzt - sondern ob dieser Agent von einem leeren Repository startet und jede Sitzung deine Konventionen *erraten* muss, oder von einer Codebasis startet, die ihm bereits genau sagt, wie die Dinge hier gemacht werden.

cbGenesis ist für den zweiten Fall gebaut.

## Die wahren Kosten von "einfach mit KI bauen"

Einem Agenten eine leere ColdBox-App zu geben und um Auth, RBAC, ein Admin-Panel, CSRF-Schutz und eine Testsuite zu bitten, kostet nicht nur die Zeit des Agenten - es kostet Tokens, und es kostet Konsistenz. Ohne eine Codebasis als Anker tut ein Agent Folgendes:

- Er erkundet das (leere) Projekt, findet nichts und erfindet entweder eigene Konventionen oder stellt dir ein Dutzend Rückfragen.
- Er leitet dieselbe sicherheitskritische Grundinfrastruktur - Session-Auth, CSRF-Verifizierung, Berechtigungsprüfungen - jedes Mal neu her, ohne Garantie, dass er die subtilen Teile richtig hinbekommt (Rotationsfenster, Deny-by-default-Prüfungen, Schutz vor Selbst-Aktionen), die hier erst durch echte Vorfälle entdeckt wurden.
- Er hat nichts zum Nachahmen, sodass jede Datei, die er schreibt, ein Stück weiter von der letzten abdriften kann - zwei Features, die zwei Wochen auseinander gebaut wurden, sehen aus, als kämen sie aus unterschiedlichen Codebasen.

cbGenesis liefert all das bereits fertig gebaut, getestet und - entscheidend für einen KI-Agenten - **als maschinenlesbare Skills dokumentiert**, nicht nur als Prosa, die ein Mensch erst in Anweisungen übersetzen muss.

## Was speziell für Agenten mitgeliefert wird

- **`AGENTS.md`** im Repository-Root - die eine Datei, die die meisten Agenten-Tools (Claude Code, Copilot, Cursor und andere) automatisch laden und die die Struktur, Handler, Interceptoren und Konventionen der App beschreibt, bevor der Agent eine Zeile Code schreibt.
- **90+ Framework-Skills**, automatisch von der ColdBox-CLI installiert, die BoxLang, ColdBox, CommandBox, TestBox, WireBox und jedes mitgelieferte Modul (cbSecurity, cbORM, qb, cbMailServices) abdecken - Schritt-für-Schritt-Implementierungsmuster, die ein Agent bei Bedarf lädt, statt aus Trainingsdaten zu raten, die älter als die aktuelle API sein können.
- **Sechs cbGenesis-spezifische Skills** (`.agents/skills-custom/`), die festhalten, was die Framework-Skills *nicht* wissen können - das eigene `resource:action`-Berechtigungsmodell dieser App, ihren `fetchWithCsrf()`-Frontend-Vertrag, die genaue Entity/Service/Handler/Route/Komponenten-Form, der ein neues Feature hier folgt, ihren echten Test-Isolationsmechanismus und ihre Aufteilung zwischen Umgebungsvariable und Datenbank-Einstellung. Siehe [Die App erweitern](guides/extending.md) für die vollständige Liste.
- **Live-MCP-Dokumentationsserver** für jedes Framework und Modul im Stack, sodass ein Agent aktuelle Dokumentation prüft, statt sich auf einen Trainings-Cutoff zu verlassen.

Nichts davon ist ein "Prompt-Engineering"-Trick. Es ist dasselbe, was einen neuen menschlichen Mitarbeiter schneller produktiv macht: eine Codebasis mit Konventionen, die es wert sind, kopiert zu werden, und eine Karte, wo man sie findet.

## Wir haben es gemessen, nicht nur behauptet

Behauptungen über KI-Produktivität sind billig. Also haben wir stattdessen einen echten, reproduzierbaren Test durchgeführt, statt nur eine Zahl zu behaupten.

**Die Aufgabe:** eine vollständige CRUD-Ressource ("Tags") zu genau dieser cbGenesis-Codebasis hinzufügen - eine ORM-Entität, einen Service, einen berechtigungsgeschützten JSON-Handler, eine Route und eine Alpine.js-Frontend-Komponente mit korrekter CSRF-Behandlung. Dieselbe klar definierte Aufgabe, gegeben an zwei unabhängige Agenten, auf demselben Commit, mit demselben Modell.

**Bedingung A - nur Exploration.** Der Agent wurde angewiesen, keinen der individuellen Skills von cbGenesis zu Rate zu ziehen, und musste die Konventionen selbst reverse-engineeren: welche Dateien das Berechtigungsformat definieren, wie die bestehenden Handler eine JSON-Antwort formen, wie sich das Frontend von einem veralteten CSRF-Token erholt, wo Routen registriert werden.

**Bedingung B - Skill-gestützt.** Der Agent wurde zuerst auf die drei relevanten individuellen Skills hingewiesen (`cbgenesis-crud-resource`, `cbgenesis-csrf-frontend`, `cbgenesis-rbac-permissions`) und implementierte direkt nach deren Vorgaben.

Beide Agenten produzierten eine vollständige, funktionierende vertikale Slice. Das hat sie gekostet:

| | Nur Exploration | Skill-gestützt |
|---|---|---|
| **Tokens** | 129.672 | **113.995** |
| **Tool-Aufrufe** | 38 | **22** |
| **Wandzeit** | 208s | **137s** |

Das sind **12 % weniger Tokens**, **42 % weniger Tool-Aufrufe** und **34 % weniger Zeit** für identischen Umfang, bei einem einzelnen gemessenen Durchlauf. Die Token-Lücke allein untertreibt den Gewinn: Jeder Agenten-Aufruf trägt einen großen, festen Overhead (System-Prompt, Tool-Definitionen), der in beiden Bedingungen identisch ist, sodass fast die gesamte Reduktion aus der *aufgabenspezifischen* Arbeit stammt - dem Teil, der tatsächlich Exploration gegenüber direkter Ausführung ist.

**Ehrlich zur Methodik:** Dies war ein Durchlauf pro Bedingung, kein gemittelter Benchmark, also behandle die genauen Prozentzahlen als richtungsweisend statt als Garantie - deine Ergebnisse werden je nach Aufgabenkomplexität und Modell variieren. Beide Bedingungen hatten weiterhin die Baseline-`AGENTS.md`-Projektübersicht von cbGenesis verfügbar (die meisten Agenten-Tools laden sie automatisch, und es gibt keine saubere Möglichkeit, sie zu verbergen), sodass selbst die Bedingung "nur Exploration" nicht *völlig* im Dunkeln tappte - sie musste die konkreten Implementierungsmuster trotzdem selbst finden. Führe den Vergleich selbst mit einer Aufgabe durch, die dir wichtig ist - wir würden lieber, dass du es verifizierst, als dass du uns einfach glaubst.

Die Lücke bei den Tool-Aufrufen ist die aussagekräftigere Zahl: 38 gegenüber 22 heißt nicht "der Agent hat ein bisschen weniger nachgedacht", sondern ist der Unterschied zwischen *die halbe Codebasis lesen, um das Muster zu finden* und *das Muster lesen*.

## Der Fall jenseits der Tokens

Tokens sind das Einfache, das man messen kann. Der schwerer zu quantifizierende Gewinn ist das, was nicht passiert: Ein Agent, der auf cbGenesis einen Login-Flow, eine Berechtigungsprüfung oder ein CSRF-geschütztes Formular baut, erbt Muster, die bereits gegen echte Fehler gehärtet wurden (ein veraltetes CSRF-Token, das stillschweigend die Eingabe eines Benutzers verwirft, eine Berechtigungsbeziehung, die stillschweigend nicht gelöscht wird, ein inkonsistent angewendeter Schutz vor Selbst-Aktionen) - Fehler, die dieses Projekt tatsächlich gemacht, behoben und dann in einem Skill festgehalten hat, damit ein Agent sie bei deinem Projekt nicht erneut macht.

"Von Grund auf mit KI" zu bauen bedeutet, dass jede dieser Lektionen pro Projekt auf die harte Tour neu gelernt werden muss. Mit cbGenesis zu starten bedeutet, dass sie bereits bezahlt sind.

## Wie es weitergeht

::: cards
::: card title="Erste Schritte" icon="phosphor-duotone:rocket-launch" href="getting-started.md"
Installieren, konfigurieren, migrieren und die App lokal ausführen.
:::
::: card title="Die App erweitern" icon="phosphor-duotone:puzzle-piece" href="guides/extending.md"
Die individuellen Skills im Kontext sehen - was sie abdecken und wie du eigene hinzufügst, während die App wächst.
:::
::: card title="Sicherheit & Berechtigungen" icon="phosphor-duotone:shield-check" href="guides/security.md"
Das `resource:action`-Modell, CSRF und die Konventionen, die die obigen Skills festhalten.
:::
:::
