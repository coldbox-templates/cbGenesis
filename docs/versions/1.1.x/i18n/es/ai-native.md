---
title: Diseñado para el desarrollo asistido por IA
order: 3
icon: phosphor-duotone:robot
summary: Por qué empezar desde cbGenesis cuesta, de forma medible, menos tokens y produce código más consistente que hacer que un agente de IA construya tu autenticación, RBAC y panel de administración desde un repositorio vacío.
tags: [ai, agents, skills, productivity]
---

# Diseñado para el desarrollo asistido por IA

Hoy en día, toda aplicación seria se construye con un agente de codificación de IA en algún punto del proceso. La pregunta no es si vas a usar uno, sino si ese agente parte de un repositorio vacío y tiene que *adivinar* tus convenciones en cada sesión, o parte de un código base que ya le indica exactamente cómo se hacen las cosas aquí.

cbGenesis está construido para el segundo caso.

## El costo real de "simplemente constrúyelo con IA"

Entregarle a un agente una aplicación ColdBox vacía y pedirle autenticación, RBAC, un panel de administración, protección CSRF y una suite de pruebas no solo te cuesta el tiempo del agente: cuesta tokens, y cuesta consistencia. Sin un código base al cual anclarse, un agente:

- Explora el proyecto (vacío), no encuentra nada, y o bien inventa sus propias convenciones o te hace una docena de preguntas de aclaración.
- Vuelve a derivar la misma infraestructura sensible a la seguridad - autenticación de sesión, verificación CSRF, comprobaciones de permisos - cada vez, sin garantía de que acierte en los detalles sutiles (ventanas de rotación, comprobaciones de denegación por defecto, protecciones contra auto-acciones) que aquí costaron incidentes reales descubrir.
- No tiene nada que imitar, así que cada archivo que escribe puede alejarse un poco más del anterior - dos funcionalidades construidas con dos semanas de diferencia terminan pareciendo salidas de código bases distintos.

cbGenesis viene con todo eso ya construido, probado y -de forma crítica para un agente de IA- **documentado como skills legibles por máquina**, no solo prosa que un humano tiene que traducir en instrucciones.

## Qué se incluye específicamente para agentes

- **`AGENTS.md`** en la raíz del repositorio - el único archivo que la mayoría de las herramientas de agentes (Claude Code, Copilot, Cursor y otras) cargan automáticamente, describiendo la estructura de la aplicación, los handlers, los interceptores y las convenciones antes de que el agente escriba una línea de código.
- **Más de 90 skills de framework**, instaladas automáticamente por el CLI de ColdBox, que cubren BoxLang, ColdBox, CommandBox, TestBox, WireBox y cada módulo incluido (cbSecurity, cbORM, qb, cbMailServices) - patrones de implementación paso a paso que un agente carga bajo demanda en lugar de adivinar a partir de datos de entrenamiento que pueden ser anteriores a la API actual.
- **Seis skills específicas de cbGenesis** (`.agents/skills-custom/`) que capturan lo que las skills del framework *no pueden* saber - el modelo de permisos propio `resource:action` de esta aplicación, su contrato de frontend `fetchWithCsrf()`, la forma exacta de entidad/servicio/handler/ruta/componente que sigue una nueva funcionalidad aquí, su mecanismo real de aislamiento de pruebas, y su división entre variables de entorno y ajustes en base de datos. Consulta [Extendiendo la aplicación](guides/extending.md) para la lista completa.
- **Servidores de documentación MCP en vivo** para cada framework y módulo del stack, para que un agente consulte la documentación actual en lugar de depender de una fecha de corte de entrenamiento.

Nada de esto es un truco de "prompt engineering". Es lo mismo que hace productiva más rápido a una nueva contratación humana: un código base con convenciones que vale la pena copiar, y un mapa de dónde encontrarlas.

## Lo medimos, no solo lo afirmamos

Las afirmaciones sobre productividad con IA son baratas. Así que hicimos una prueba real y reproducible en lugar de afirmar un número.

**La tarea:** agregar un recurso CRUD completo ("Tags") a este mismo código base de cbGenesis - una entidad ORM, un servicio, un handler JSON protegido por permisos, una ruta y un componente de frontend en Alpine.js con manejo correcto de CSRF. La misma tarea bien definida, dada a dos agentes independientes, sobre el mismo commit, con el mismo modelo.

**Condición A - solo exploración.** Al agente se le indicó que no consultara ninguna de las skills personalizadas de cbGenesis y tuvo que hacer ingeniería inversa de las convenciones por sí mismo: qué archivos definen el formato de permisos, cómo dan forma los handlers existentes a una respuesta JSON, cómo se recupera el frontend de un token CSRF caducado, dónde se registran las rutas.

**Condición B - asistido por skills.** Al agente se le señalaron primero las tres skills personalizadas relevantes (`cbgenesis-crud-resource`, `cbgenesis-csrf-frontend`, `cbgenesis-rbac-permissions`) e implementó directamente a partir de lo que estas indicaban.

Ambos agentes produjeron una porción vertical completa y funcional. Esto es lo que costó:

| | Solo exploración | Asistido por skills |
|---|---|---|
| **Tokens** | 129,672 | **113,995** |
| **Llamadas a herramientas** | 38 | **22** |
| **Tiempo real** | 208s | **137s** |

Eso es **12% menos tokens**, **42% menos llamadas a herramientas** y **34% menos tiempo** para un alcance idéntico, en una única ejecución medida. La diferencia de tokens por sí sola subestima la ganancia: cada invocación de agente conlleva una gran sobrecarga fija (prompt del sistema, definiciones de herramientas) que es idéntica en ambas condiciones, así que casi toda esa reducción proviene del trabajo *específico de la tarea* - la parte que realmente es exploración frente a ejecución directa.

**Siendo honestos sobre la metodología:** esta fue una ejecución por condición, no un benchmark promediado, así que trata los porcentajes exactos como orientativos y no como una garantía - tu experiencia variará según la complejidad de la tarea y el modelo. Ambas condiciones seguían teniendo disponible el `AGENTS.md` base de cbGenesis (la mayoría de las herramientas de agentes lo cargan automáticamente y no hay una forma limpia de ocultarlo), así que incluso la condición "solo exploración" no partía de una oscuridad *total* - aun así tuvo que encontrar por sí misma los patrones de implementación específicos. Ejecuta la comparación tú mismo con una tarea que te importe; preferimos que lo verifiques a que confíes en nuestra palabra.

La diferencia en llamadas a herramientas es el dato más revelador: 38 frente a 22 no es "el agente pensó un poco menos", es la diferencia entre *leer la mitad del código base para encontrar el patrón* y *leer el patrón*.

## El argumento más allá de los tokens

Los tokens son lo fácil de medir. La ganancia más difícil de cuantificar es lo que no sucede: un agente que construye un flujo de inicio de sesión, una comprobación de permisos o un formulario protegido por CSRF sobre cbGenesis hereda patrones que ya fueron reforzados contra errores reales (un token CSRF caducado descartando silenciosamente la entrada de un usuario, una relación de permisos fallando silenciosamente al limpiarse, una protección contra auto-acciones aplicada de forma inconsistente) - errores que este proyecto realmente cometió, corrigió y luego codificó en una skill para que un agente no vuelva a cometerlos en tu proyecto.

Construir "desde cero con IA" significa que cada una de esas lecciones tiene que volver a aprenderse, por proyecto, de la manera difícil. Empezar desde cbGenesis significa que ya están pagadas.

## A dónde ir después

::: cards
::: card title="Primeros pasos" icon="phosphor-duotone:rocket-launch" href="getting-started.md"
Instala, configura, migra y ejecuta la aplicación localmente.
:::
::: card title="Extendiendo la aplicación" icon="phosphor-duotone:puzzle-piece" href="guides/extending.md"
Mira las skills personalizadas en contexto - qué cubren y cómo agregar las tuyas a medida que crece la aplicación.
:::
::: card title="Seguridad y permisos" icon="phosphor-duotone:shield-check" href="guides/security.md"
El modelo `resource:action`, CSRF y las convenciones que codifican las skills anteriores.
:::
:::
