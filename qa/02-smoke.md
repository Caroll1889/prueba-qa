# 02. Pruebas Smoke — EnergIA

## 1. Objetivo

Verificar rápidamente que los componentes y flujos esenciales de EnergIA están disponibles y permiten continuar con las pruebas funcionales. El smoke test no pretende cubrir todas las reglas de negocio.

## 2. Entorno

- Sistema operativo: Windows 11 x64.
- Ejecución: Docker Compose local.
- Frontend: `http://localhost:3000`.
- Backend / Swagger: `http://localhost:8080/docs`.
- Navegador: Google Chrome.
- Zona horaria de referencia: `America/Bogota`.
- Fecha de ejecución: 20 de octubre de 2026.

## 3. Resultados

| ID | Comprobación | Resultado esperado | Resultado observado | Estado |
|---|---|---|---|---|
| SM-01 | Iniciar servicios con Docker Compose | Backend y frontend quedan disponibles | Los dos contenedores del proyecto aparecieron en estado `Up` | Passed |
| SM-02 | Abrir el frontend | La aplicación carga y permite acceder a la interfaz | La aplicación abrió correctamente | Passed |
| SM-03 | Iniciar sesión | El usuario de prueba puede acceder a la aplicación | Se inició sesión correctamente con las credenciales proporcionadas | Passed |
| SM-04 | Abrir el libro de medidores | Se presenta la tabla con datos y controles de consulta | Se mostraron medidores, filtros y opciones de ordenamiento | Passed |
| SM-05 | Consultar las anomalías de IA | Se muestran las anomalías detectadas con tipo, severidad y confianza | Se mostraron cuatro anomalías, incluidas M-109, M-112, M-104 y M-106 | Passed |
| SM-06 | Abrir el detalle de una anomalía | Se presentan explicación, evidencia y recomendación | El detalle de M-109 mostró explicación, comparación con baseline y recomendación | Passed |
| SM-07 | Comprobar navegación por páginas del libro de medidores | Con 12 medidores y 10 por página, debe ser posible acceder a los 12 | El pie de tabla indicó `1–10 de 12`, pero los botones Anterior y Siguiente estaban deshabilitados | Failed |
| SM-08 | Verificar disponibilidad de la documentación Swagger | La documentación de la API se puede consultar | Swagger carga en `http://localhost:8080/docs` y permite visualizar los endpoints | Passed |
| SM-09 | Ejecutar las pruebas unitarias del backend | Todos los tests existentes pasan | `go test ./...` pasó en los paquetes con pruebas; algunos paquetes no tienen tests | Passed |
| SM-10 | Ejecutar las pruebas del frontend | Todos los tests existentes pasan | 3 archivos de prueba y 11 tests pasaron | Passed |

## 4. Defecto bloqueante para la consulta completa

**Referencia:** DEF-001 — La paginación impide acceder a los últimos medidores.

Con el filtro de estado en `Todos`, sin texto de búsqueda y con 12 medidores, la interfaz presenta los registros 1–10 de 12. Sin embargo, ambos botones de paginación están deshabilitados. Por tanto, no es posible navegar a los registros 11–12 desde esta pantalla.

El defecto se documenta en `qa/05-defectos.md`.

## 5. Conclusión del smoke test

Los componentes principales se levantaron y la interfaz permitió iniciar sesión, consultar medidores y revisar anomalías. Las pruebas unitarias existentes de backend y frontend también pasaron.

Sin embargo, el flujo de consulta completa de medidores no supera el smoke test debido al defecto de paginación. Se recomienda corregirlo y repetir la comprobación antes de aprobar una liberación.

**Limitación:** se comprobó la disponibilidad de Swagger y se realizó una consulta puntual a la API para revisar el campo `detected_at` de M-109. Esta comprobación no equivale a una validación funcional exhaustiva de todos los endpoints, parámetros y casos negativos. Los resultados corresponden al entorno local y no certifican el funcionamiento en producción.