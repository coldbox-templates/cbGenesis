---
title: Notas de la versión
order: 3
icon: phosphor-duotone:note
summary: Cambios de la serie 1.1.x.
tags: [reference, releases]
---

# Notas de la versión

## 1.1.0

### Añadido

- **Administración de límites:** consulta contadores, historial y principales infractores; gestiona bloqueos y exclusiones de IP y modifica ajustes en Sistema > Rate Limiting.
- **Bloqueo automático e historial:** bloquea infractores reincidentes y conserva un historial horario acotado.
- **Controles de emergencia:** pausa los límites de intentos, usa `RATE_LIMITING_ENABLED` como excepción de emergencia y aplica un límite global por IP con modo de bloqueo.
- **Honeypot de registro:** rechaza registros automatizados que rellenan el campo oculto.

### Cambiado

- El middleware `AppThrottle` sustituye al limitador anterior con ventanas fijas para autenticación y SSO del perfil; también se limitan el callback de cbSSO y las URL de autenticación por convención.
- Se elevaron los mínimos a ColdBox 8.3 y cbSecurity 3.9 y se corrigieron las rutas de instalación del framework y TestBox.
- Se actualizaron el tema de documentación, la inicialización de la base de datos y la documentación sobre límites.

### Corregido

- El conteo de intentos es atómico y solo se audita la primera solicitud bloqueada de cada ventana.
- El formulario de inicio de sesión usa la ruta protegida por el limitador.
- Se mejoraron la instalación de dependencias y los informes de pruebas en CI.

Consulta [Limitación de tasa](../guides/security.md#rate-limiting) y el [registro de cambios](https://github.com/coldbox-templates/cbGenesis/blob/development/changelog.md).
