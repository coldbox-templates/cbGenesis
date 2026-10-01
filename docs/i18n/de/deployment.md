---
title: Deployment
order: 5
icon: phosphor-duotone:cloud-arrow-up
summary: Produktions-Build, Docker, BoxLang MiniServer und eine Go-Live-Checkliste.
tags: [deployment]
---

# Deployment

## Produktions-Build

```bash frame="terminal" title="Terminal"
npm run build
```

Kompiliert und versieht das Frontend mit Fingerprints nach `public/includes/` - siehe [Frontend](guides/frontend.md#vite-configuration).

## Docker

Ein `Dockerfile` und datenbankspezifische Compose-Dateien liegen in `resources/docker/`. MySQL ist der Standard; PostgreSQL- und MSSQL-Alternativen werden für die anderen CI-getesteten Ziele bereitgestellt. MariaDB kann die MySQL-Konfiguration und den `mysql`-JDBC-Treiber nutzen. `box.json` definiert außerdem die Skripte `docker:build`, `docker:run`, `docker:bash` und `docker:stack` (ausführen mit `box run-script <name>`) als Abkürzungen für die unten stehenden Einzel-Argument-Befehle - sie ersetzen nicht die erforderliche BoxLang-CLI-Installation für lokale `box`-Befehle und stehen in keinem Zusammenhang mit `npm run` (es gibt kein `npm run docker:*`).

### Lokale Entwicklung mit Docker Compose

`resources/docker/docker-compose.yml` führt die App (gebaut aus `resources/docker/Dockerfile.dev`, das CommandBox nativ auf dem offiziellen `ortussolutions/boxlang:cli`-Image installiert, damit die Engine-Version zu `.bvmrc` passt) zusammen mit einem MySQL-8-Container aus, wobei das gesamte Repo in den App-Container gemountet wird, sodass Änderungen auf dem Host ohne Rebuild wirksam werden - keine lokale BoxLang/MySQL-Installation erforderlich. Führe `docker compose` direkt aus (statt über das `docker:stack`-Paketskript), damit mehrteilige Befehle wie `up -d` korrekt durchgereicht werden:

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.yml up -d
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box migrate seed run
```

Besuche `http://127.0.0.1:8080`. MySQL ist vom Host aus unter `127.0.0.1:3406` erreichbar (gewählt, um Kollisionen mit einem bereits auf `3306` laufenden MySQL/MariaDB zu vermeiden); der App-Container spricht über das interne Docker-Netzwerk mit MySQLs echtem Port `3306`.

Die Compose-Datei startet Vite nicht - starte es separat auf dem Host für HMR:

```bash frame="terminal" title="Terminal"
npm install
npm run dev
```

Eine MSSQL-spezifische Compose-Datei ist ebenfalls verfügbar zum Testen gegen SQL Server 2022. Sie installiert den `bx-mssql`-Treiber im App-Container, erstellt die `cbgenesis`-Datenbank und hält ihre Daten unter `resources/docker/.db/mssql/`:

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.mssql.yml up -d
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box migrate seed run
```

Die Anwendung bleibt unter `http://127.0.0.1:8080` erreichbar; SQL Server ist vom Host aus unter `127.0.0.1:1434` erreichbar. Das Standard-Passwort für `sa` ist nur für lokale Tests gedacht. Setze `MSSQL_SA_PASSWORD`, bevor du den Stack startest, um es zu überschreiben. Stoppe diesen Stack mit:

```bash frame="terminal" title="Terminal"
docker compose -f resources/docker/docker-compose.mssql.yml down
```

Die PostgreSQL-Alternative verwendet PostgreSQL 16, veröffentlicht den Host-Port `5433` und installiert `bx-postgresql` automatisch:

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.postgresql.yml up -d
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box migrate seed run
```

Die Standard-MySQL-Compose-Datei bleibt unverändert. Stoppe jede der beiden Alternativen mit ihrer jeweiligen Compose-Datei und `down`.

```bash frame="terminal" title="Terminal"
docker compose -f resources/docker/docker-compose.yml down
```

### Produktions-Image

```bash frame="terminal" title="Terminal"
box run-script docker:build
box run-script docker:run
```

Baue das Frontend, bevor du ein Produktions-Image erstellst:

```bash linenums="1"
npm run build
```

## BoxLang MiniServer

Eine Alternative zum `bx-cli`-Entwicklungsserver, um die kompilierte App direkt auszuführen:

```bash frame="terminal" title="Terminal"
cd my-app
boxlang-miniserver --port 8080 --webroot ./public --dev
```

Der MiniServer bietet kein `box install`, keine Migrationen und keine TestBox-Befehle. Verwende dafür die erforderliche [BoxLang CLI](guides/command-line.md).

## Produktions-Checkliste

::: stepper
::: step "Umgebung festlegen"
`ENVIRONMENT=production` und `BOXLANG_DEBUG=false` in `.env`.
:::
::: step "Echte E-Mail konfigurieren"
Richte `app/config/modules/cbmailservices.bx` auf einen echten SMTP-/Postmark-/SendGrid-Treiber aus - siehe [E-Mail](guides/email.md#protocol-by-environment).
:::
::: step "Das eingesäte Admin-Passwort rotieren" color="warning"
Der Seeder erstellt `admin@cbgenesis.com` / `test`, als reset-pending markiert. Die Anmeldung damit gewährt keine Session: Du wirst direkt zum Formular für die Passwort-Zurücksetzung weitergeleitet und musst zuerst ein neues Passwort setzen. Der Bootstrap-Hash ist öffentlich (er wird im Repo mitgeliefert), also niemals diese Markierung löschen, um weiterhin `test` zu verwenden. Siehe [Erste Schritte](getting-started.md#scaffold-your-app).
:::
::: step "Entscheiden, wer das Framework reinitialisieren darf"
`reinitPassword` liest `COLDBOX_REINIT_PASSWORD` aus der Umgebung. Lass es in der Produktion **nicht gesetzt**, dann fällt jeder Boot auf eine frische zufällige UUID zurück, die niemand kennt, was `?fwreinit` vollständig schließt. Setze es nur, wenn du eine laufende Instanz reinitialisieren musst, und behandle es wie ein Credential. Es auf einen leeren String zu setzen, lässt die Reinitialisierung für jeden offen, weshalb `development()` genau das tut und die Produktion es nicht darf.
:::
::: step "HTTPS aktivieren"
Über SSL-Konfiguration in `server.json` oder deinen Reverse-Proxy/Load-Balancer der Wahl.
:::
::: step "Entscheiden, ob Proxy-Headern vertraut wird" color="warning"
`cbTrustProxyHeaders` ist standardmäßig **aktiviert**, passend zu einem typischen Deployment hinter einem Reverse-Proxy oder Load-Balancer. Falls die App stattdessen direkt am Internet hängt, schalte es aus - siehe [Deployment hinter einem Reverse-Proxy](#deploying-behind-a-reverse-proxy). Dies falsch herum zu haben, hebelt entweder das Rate-Limiting aus oder bricht es für alle hinter dem Proxy.
:::
::: step "Die Relying-Party-Konfiguration für Passkeys aktualisieren" color="warning"
`app/config/modules/cbsecurity-passkeys.bx` wird mit reinen Entwicklungs-Platzhaltern ausgeliefert (`relyingPartyId: "localhost"`, `allowedOrigins: ["http://localhost:8080"]`). Setze diese vor dem Go-Live auf deine echte Produktionsdomain, sonst schlägt die Passkey-Registrierung fehl - siehe [Sicherheit & Berechtigungen](guides/security.md#known-issues).
:::
::: step "Das Frontend bauen"
`npm run build` für minifizierte, mit Fingerprints versehene Assets.
:::
::: step "/healthcheck absichern" color="danger"
Entferne oder beschränke den öffentlichen `/healthcheck`-Endpunkt, falls er von außerhalb deiner Infrastruktur nicht erreichbar sein sollte.
:::
:::

## Deployment hinter einem Reverse-Proxy

`RateLimiter`, der Audit-Trail und die "Zurücksetzung angefordert von IP"-Sicherheits-E-Mails lesen die IP des Aufrufers alle über cbsecuritys `getRealIP()`. Diese Funktion hat zwei mögliche Quellen für die IP, und nur du - die Person, die diese App deployt - weißt, welche für dein Setup korrekt ist:

- **Die rohe Socket-Adresse** (`cgi.remote_addr`) - korrekt, wenn die App direkt am Internet hängt. Sitzt ein Reverse-Proxy davor, ist dies immer die Adresse des Proxys, nicht die des Besuchers.
- **Die Request-Header `X-Forwarded-For` / `X-Cluster-Client-IP`** - korrekt nur, wenn etwas vor der App (nginx, ein Load-Balancer, ein CDN) jeden vom Client gesendeten Wert entfernt und den Header selbst setzt. Tut das nichts, kann jeder Aufrufer diesen Header auf beliebige Werte setzen, sogar auf einen anderen bei jedem Request.

Die Einstellung `cbTrustProxyHeaders` (Standard `true`, editierbar unter `/settings`) wählt zwischen beiden. Sie eingeschaltet zu lassen, wenn du gar nicht hinter einem Proxy sitzt, der den Header bereinigt, öffnet genau die Rate-Limit-Umgehung wieder, die sie eigentlich schließen soll - ein Aufrufer kann bei jedem Login-Versuch einen neuen `X-Forwarded-For`-Wert fälschen und nie blockiert werden. Sie auszuschalten, wenn du *tatsächlich* hinter einem solchen Proxy sitzt, bedeutet, dass jeder Besucher sich die IP des Proxys teilt - ein blockierter Aufrufer blockiert alle dahinter, und der Audit-Trail zeichnet für jede Aktion die Adresse des Proxys auf.

Wenn du direkt am Internet hängend deployst, ohne irgendetwas vor der App, schalte das aus. Wenn du hinter einem Reverse-Proxy deployst, bestätige, dass er `X-Forwarded-For` tatsächlich überschreibt (statt einen vom Client gelieferten Wert anzuhängen oder durchzureichen), bevor du dies eingeschaltet lässt.

::: cards
::: card title="Konfiguration" icon="phosphor-duotone:gear-six" href="guides/configuration.md"
Jede oben erwähnte Umgebungsvariable und Moduleinstellung.
:::
::: card title="Sicherheit & Berechtigungen" icon="phosphor-duotone:shield-check" href="guides/security.md"
Überprüfe die Firewall- und CSRF-Konfiguration, bevor du live gehst.
:::
:::
