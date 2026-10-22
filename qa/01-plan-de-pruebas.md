# 01. Plan de pruebas — EnergIA

## 1. Resumen ejecutivo

EnergIA es una plataforma de gestión energética que permite consultar medidores eléctricos, detectar anomalías de consumo mediante un motor de análisis explicable y recomendar acciones a los operadores de planta.

La evaluación combina pruebas funcionales de interfaz y API, pruebas de humo, revisión de código y pruebas automatizadas. Se priorizan la clasificación de anomalías, la integridad de las lecturas, la coherencia entre interfaz y API y el acceso a todos los medidores.

**Recomendación de liberación: no aprobaría todavía una liberación a producción.** Durante la exploración manual se reprodujo un defecto de paginación que impide acceder a los medidores posteriores a los primeros diez, aunque la aplicación informa que existen doce. Esto limita la visibilidad de los operadores y puede ocultar información necesaria para tomar decisiones. La recomendación es corregir y verificar este defecto antes de liberar, y completar las comprobaciones funcionales y de regresión pendientes.

La suite de Playwright con TypeScript incluye una prueba E2E que confirma el flujo de consulta de la investigación de M-109 desde la interfaz, una prueba de API que valida la autenticación y los datos devueltos para M-109, y una prueba que reproduce el defecto DEF-001 de paginación. Esta última utiliza `test.fail()` para registrar el fallo como esperado mientras el defecto siga presente. Por tanto, que la suite termine con un resultado global satisfactorio no significa que la funcionalidad de paginación esté correcta. La prueba de API valida una consulta específica y no representa una cobertura exhaustiva de los endpoints. La revisión de los demás resultados, defectos y limitaciones se presenta en los documentos correspondientes. La cobertura porcentual del backend no se midió.

## 2. Objetivos

- Verificar que los operadores puedan consultar medidores y sus lecturas.
- Validar la clasificación de anomalías y la severidad asignada.
- Comprobar que las recomendaciones sean coherentes con las evidencias y los eventos operacionales.
- Detectar errores de filtrado, búsqueda, ordenamiento, paginación y validación de entradas.
- Evaluar la coherencia entre la interfaz, la API y las reglas del producto.
- Identificar riesgos de código y oportunidades para ampliar las pruebas automatizadas.

## 3. Alcance

### Incluido

- Inicio de sesión y acceso autenticado.
- Libro de medidores: listado, filtros, búsqueda, ordenamiento y paginación.
- Detalle de medidores, historial y variables eléctricas.
- Anomalías de IA: tipo, severidad, confianza, evidencia y recomendación.
- Comportamiento de casos representativos:
  - M-109: anomalía real de alta severidad.
  - M-112: problema de calidad de datos.
  - M-104: anomalía explicable por un evento operacional.
  - M-106: falso positivo que no debe escalarse.
- Validación de respuestas de API y manejo de entradas inválidas.
- Pruebas unitarias existentes y revisión de módulos de análisis.
- Automatización E2E con Playwright y TypeScript.

### Fuera de alcance

- Validación de la precisión estadística del modelo de IA con un conjunto independiente de datos.
- Pruebas de carga a gran escala y certificación formal de seguridad.
- Validación de infraestructura productiva, dispositivos eléctricos físicos e integraciones externas no disponibles en el entorno de prueba.

Estas exclusiones no implican que dichos riesgos sean irrelevantes; requieren evaluaciones separadas antes de una liberación real.

## 4. Entorno de pruebas

- Aplicación ejecutada localmente mediante Docker Compose.
- Sistema operativo: Windows 11 x64.
- Navegador de exploración: Google Chrome.
- Zona horaria de referencia del negocio: `America/Bogota`.
- Frontend: `http://localhost:3000`.
- API y documentación Swagger: `http://localhost:8080/docs`.
- Cuenta de prueba: `admin@energia.local`.
- Datos: conjunto de medidores y eventos incluido en el entorno proporcionado.

La versión y el commit exactos deben registrarse antes de cerrar el informe. Para validar los timestamps, se debe identificar el formato y la zona horaria definidos por el contrato de la aplicación y comprobar que la interfaz presente la hora esperada según la regla de negocio. No debe asumirse que la hora recibida de la API y la hora mostrada en pantalla son equivalentes sin verificar la conversión aplicada.

## 5. Estrategia y niveles de prueba

| Nivel o tipo | Propósito | Prioridad |
|---|---|---|
| Smoke | Confirmar que la aplicación inicia y que los flujos esenciales están disponibles | Crítica |
| Unitarias | Verificar cálculos, límites y reglas de clasificación de forma aislada | Alta |
| Integración/API | Validar autenticación, contratos, filtros, parámetros, errores y datos devueltos | Alta |
| Funcionales UI | Verificar flujos completos desde la perspectiva del operador | Alta |
| Regresión | Asegurar que cambios no rompan funcionalidades existentes | Alta |
| E2E | Automatizar el acceso y la consulta de la investigación de una anomalía representativa | Alta |
| Exploratorias | Buscar inconsistencias no cubiertas por casos predefinidos | Alta |
| Accesibilidad básica | Revisar navegación por teclado, etiquetas y estados que no dependan solo del color | Media |
| Rendimiento y seguridad | Identificar necesidades de evaluación adicional | Fuera del alcance de esta ejecución |

La selección de casos utilizará particiones de equivalencia, análisis de límites, tablas de decisión, escenarios negativos y comparación entre UI y API.
La estrategia define las actividades de prueba previstas; su inclusión en este plan no implica que todas se hayan ejecutado durante esta evaluación. El estado real de ejecución, los resultados obtenidos y las limitaciones se documentan en los archivos de smoke, casos de caja negra, caja blanca y defectos.

## 6. Análisis de riesgos

| Riesgo | Impacto | Prioridad | Mitigación |
|---|---|---|---|
| Medidores inaccesibles por paginación incorrecta | El operador no puede revisar todos los equipos | Alta | Probar 0, 1, 10, 11, 12 y múltiplos del tamaño de página |
| Clasificación o severidad incorrecta | Decisiones operacionales equivocadas | Alta | Verificar reglas y casos de referencia del producto |
| Datos eléctricos incoherentes no identificados | Diagnósticos basados en lecturas poco confiables | Alta | Validar rangos, señales y alertas de calidad |
| Eventos operacionales interpretados incorrectamente | Escalamiento innecesario o anomalías descartadas | Alta | Tabla de decisión por tipo de evento y persistencia del cambio |
| Diferencias entre API e interfaz | Información contradictoria para el operador | Alta | Comparaciones cruzadas UI/API |
| Pruebas existentes insuficientes | Defectos no detectados por regresión | Media-alta | Identificar brechas de cobertura y proponer pruebas de límites; medir cobertura cuando las herramientas y el alcance lo permitan |
| Timestamps interpretados con otra zona horaria | Confusión sobre cuándo ocurrió una anomalía | Media-alta | Verificar valores y presentación según el contrato del producto |
| Fallos de accesibilidad en filtros o tablas | Algunos operadores no pueden completar tareas | Media | Pruebas de teclado, etiquetas y semántica |

## 7. Criterios de entrada

- Aplicación levantada y accesible en el entorno local.
- Credenciales de prueba disponibles.
- Datos de prueba cargados.
- Reglas de negocio y comportamiento esperado identificados en la documentación del producto.
- Herramientas necesarias disponibles para ejecutar pruebas manuales y automatizadas.

## 8. Criterios de salida

- Todas las pruebas smoke críticas pasan.
- Los flujos prioritarios de autenticación, consulta de medidores y detalle cuentan con resultados documentados; las pruebas pendientes o bloqueadas se identifican explícitamente.
- Los defectos se documentan con pasos reproducibles, resultado esperado, resultado actual y evidencia disponible.
- No quedan defectos críticos o altos sin resolver ni aceptar explícitamente por el responsable del producto.
- Las pruebas de regresión relevantes pasan después de cualquier corrección.
- Los riesgos pendientes, las limitaciones de cobertura y las pruebas no ejecutadas quedan documentados.

Un resultado de pruebas satisfactorio no equivale por sí solo a una garantía de ausencia de defectos.

## 9. Enfoque de reporte

Cada defecto debe registrar identificador, título, entorno, severidad, prioridad, precondiciones, pasos de reproducción, datos utilizados, resultado esperado, resultado actual, evidencia y posible origen técnico cuando exista evidencia suficiente.

La severidad describe el impacto del defecto; la prioridad indica la urgencia de atenderlo. Los resultados se reportarán como Passed, Failed, Blocked o Not Run, sin presentar pruebas propuestas como si hubieran sido ejecutadas.

## 10. Limitaciones de la evaluación

La ejecución se realiza en un entorno local y con los datos incluidos en el repositorio. No se ha medido la cobertura porcentual del backend, no se han realizado pruebas de carga a gran escala y no se ha validado el comportamiento en una infraestructura productiva. Estas limitaciones deben considerarse al interpretar los resultados y tomar decisiones de liberación.

