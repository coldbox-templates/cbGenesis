---
title: Die App erweitern
order: 8
icon: phosphor-duotone:puzzle-piece
summary: Ein neues CRUD-Modul, eine Berechtigung, eine Einstellung oder eine geplante Aufgabe hinzufügen, gemäß den eigenen Konventionen der App.
tags: [guides, extending]
---

# Die App erweitern

CBGenesis ist eine Startrampe, kein fertiges Produkt. Dies sind dieselben Schritte, denen die eigenen Users/Roles/Permissions/Settings-Module folgen - verwende sie als Vorlage für alles Neue.

## Bauen mit einem KI-Agenten

Wenn du cbGenesis mit einem KI-Coding-Agenten (Claude Code, Copilot, Cursor oder ähnlich) erweiterst, richte ihn auf `.agents/skills-custom/` aus, bevor er Code schreibt - diese Skills halten die untenstehenden Schritte als maschinenlesbare Anweisungen fest, mit echten Code-Ausschnitten aus dieser Codebasis, sodass der Agent sie nicht durch das Erkunden jedes Handlers reverse-engineeren muss:

| Skill | Deckt ab |
|---|---|
| `cbgenesis-crud-resource` | Die vollständige vertikale Slice unten - Entität, Service, Handler, Route, View, Komponente - Ende zu Ende. |
| `cbgenesis-rbac-permissions` | Das `resource:action`-Berechtigungsmodell, `@secured` und den Schutz vor Selbst-Aktionen. |
| `cbgenesis-csrf-frontend` | Das verpflichtende `fetchWithCsrf()`-Muster für jeden mutierenden Frontend-Request. |
| `cbgenesis-alpine-components` | Alpine.js-Komponentenform, Registrierung und die gemeinsame `utils/`-Bibliothek. |
| `cbgenesis-testing-conventions` | `BaseIntegrationSpec`, den echten Transaktions-Rollback-Isolationsmechanismus und Fixture-Helfer. |
| `cbgenesis-settings-config` | Wann eine Umgebungsvariable statt der DB-gestützten Einstellungsregistrierung zu verwenden ist. |

Eine neue Konvention, die es wert ist, dass ein Agent (oder ein Mensch) sie nicht durch Trial-and-Error neu entdecken muss? Füge sie hier als neuen Skill hinzu, statt sie als stilles Wissen in einer PR-Beschreibung zurückzulassen. Siehe [Gebaut für KI-gestützte Entwicklung](../ai-native.md) dafür, warum das wichtig ist, mit einem gemessenen Vorher-Nachher-Vergleich.

## Ein neues CRUD-Modul hinzufügen

::: stepper
::: step "Die Entität erstellen"
In `app/models/<domain>/`, als Erweiterung von `BaseEntity` — siehe [Datenbank & ORM](database-orm.md#entity-hierarchy).
:::
::: step "Den Service erstellen"
Als Erweiterung von `BaseService`, markiert `singleton threadSafe` — siehe [das Service-Muster](database-orm.md#service-layer-pattern).
:::
::: step "Den Handler erstellen"
Als Erweiterung von `BaseSecureHandler`, mit einer `@secured`-Annotation — siehe [Handler & Routing](handlers-routing.md#basesecurehandler). Von dieser Basis zu erben bedeutet, dass jede `POST`/`PUT`/`DELETE`-Aktion, die du hinzufügst, [automatisch CSRF-verifiziert](handlers-routing.md#csrf-verification) wird; es gibt nichts, dem man sich anschließen muss, aber deine Formulare und Alpine-Komponenten müssen `rc.csrf` senden.
:::
::: step "Routen hinzufügen"
In `app/config/Router.bx`, nahe der Markierung `// @app_routes@`.
:::
::: step "Views erstellen"
In `app/views/<domain>/`, unter Wiederverwendung vorhandener `_components/ui/`-Partials.
:::
::: step "Eine Alpine-Komponente erstellen"
In `resources/assets/js/components/<domain>/`, dann registrieren in `App.js` — siehe [Frontend](frontend.md#alpinejs-architecture).
:::
::: step "SCSS hinzufügen"
In `resources/assets/scss/views/`, importiert aus `app.scss`.
:::
::: step "Tests schreiben" color="success"
Unit-Specs in `tests/specs/unit/<domain>/`, plus eine Integrations-Spec in `tests/specs/integration/` für die hinzugefügten Routen — siehe [Testing](testing.md#test-structure).
:::
:::

## Eine neue Berechtigung hinzufügen

::: stepper
::: step "Den Slug seeden"
Füge den `resource:action`-Slug zu `resources/database/seeds/AdminData.bx` hinzu und weise ihn der/den passenden Rolle(n) zu.
:::
::: step "Den Handler absichern"
`@secured( "resource:action,resource:admin" )` — Komma bedeutet ODER. Siehe [Sicherheit & Berechtigungen](security.md#permission-model).
:::
::: step "Die View absichern"
```html linenums="1"
<bx:if prc.authUser.hasPermission( "resource:action,resource:admin" )>
```
damit die UI niemals etwas anbietet, das der Handler ablehnen würde.
:::
::: step "Neu seeden" color="success"
`box migrate seed run` gegen eine bestehende Datenbank - oder die Berechtigung direkt über die Roles-Admin-Seite einer Rolle zuweisen.
:::
:::

## Eine Einstellung hinzufügen

Füge einen neuen Schlüssel zum `DEFAULTS`-Struct in `SettingService.bx` hinzu. `preFlightCheck()` sät ihn beim nächsten Boot automatisch ein, und er erscheint ohne weitere Verdrahtung auf der `/settings`-Admin-Seite — siehe [Konfiguration](configuration.md#app-settings-vs-framework-config).

## Layouts anpassen

Layouts liegen in `app/layouts/`. Die Auswahl erfolgt pro Handler, typischerweise in `preHandler`:

```boxlang title="app/handlers/BaseSecureHandler.bx" linenums="1"
function preHandler( event, rc, prc ){
    event.setLayout( "Admin" );
}
```

## Eine geplante Aufgabe hinzufügen

Registriere Aufgaben in `app/config/Scheduler.bx`, neben den drei, die dort bereits laufen - siehe [Architektur](../architecture.md#scheduled-tasks) für das, was sie tun:

```boxlang title="app/config/Scheduler.bx" linenums="1"
task( "My Task" )
    .call( () => getInstance( "MyService" ).doWork() )
    .everyDayAt( "03:45" )
    .onOneServer()
    .withNoOverlaps();
```

`onOneServer()` und `withNoOverlaps()` werden wichtig, sobald du mehr als eine Instanz deployst: Ohne sie führt jede Instanz die Aufgabe nach ihrem eigenen Zeitplan aus. Platziere die eigentliche Bereinigungslogik am Service (`doWork()` oben), nicht inline im Closure, damit sie unit-testbar bleibt.

## Modulkonfiguration überschreiben

Modulkonfigurationen in `app/config/modules/` erweitern die eigenen Standardwerte des Moduls. Überschreibe dort jeden Schlüssel — Änderungen wirken beim nächsten `?fwreinit`.

::: cards
::: card title="Gebaut für KI-gestützte Entwicklung" icon="phosphor-duotone:robot" href="../ai-native.md"
Warum die individuellen Skills existieren, und ein gemessener Token-/Tool-Aufruf-Vergleich.
:::
::: card title="Handler & Routing" icon="phosphor-duotone:signpost" href="handlers-routing.md"
Die vollständigen Handler-/Routen-Konventionen, auf denen dieser Abschnitt aufbaut.
:::
::: card title="Datenbank & ORM" icon="phosphor-duotone:database" href="database-orm.md"
Entitäts- und Service-Muster im Detail.
:::
::: card title="Deployment" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Bring aus, was du gebaut hast.
:::
:::
