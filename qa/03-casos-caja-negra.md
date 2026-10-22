# 03. Casos de prueba de caja negra — EnergIA

## 1. Objetivo y enfoque

Verificar el comportamiento observable de EnergIA desde la interfaz y la API, sin depender de su implementación interna para definir los resultados esperados.

Los casos se diseñaron a partir de `PRUEBA_QA.md`, `frontend/PRODUCT.md` y la documentación de la API.

### Técnicas utilizadas

- **Particiones de equivalencia:** estados de medidores, tipos de anomalía y entradas válidas o inválidas.
- **Análisis de límites:** paginación con 0, 1, 10, 11 y 12 registros; duración y magnitud de cambios.
- **Tablas de decisión:** relación entre eventos operacionales, persistencia del cambio, tipo de anomalía y acción recomendada.
- **Pruebas negativas:** credenciales incorrectas, parámetros inválidos y solicitudes no autorizadas.
- **Pruebas de consistencia:** comparación entre la información presentada en UI y la respuesta de API.

## 2. Entorno

- Aplicación local mediante Docker Compose.
- Sistema operativo: Windows 11 x64.
- Navegador: Google Chrome.
- Frontend: `http://localhost:3000`.
- API: `http://localhost:8080/docs`.
- Zona horaria de referencia: `America/Bogota`.
- Cuenta de prueba: `admin@energia.local`.
- Fecha de evaluación: 21 de octubre de 2026.

## 3. Casos de prueba

Los estados significan:
- **Passed:** ejecutado y cumple el resultado esperado.
- **Failed:** ejecutado y no cumple el resultado esperado.
- **Not Run:** pendiente de ejecución.

### A. Autenticación y disponibilidad

#### TC-001 — Inicio de sesión con credenciales válidas

- **Precondición:** aplicación disponible y usuario de prueba existente.
- **Pasos:** abrir la aplicación, introducir las credenciales válidas y enviar el formulario.
- **Datos:** `admin@energia.local` / `admin123`.
- **Resultado esperado:** el usuario accede a la aplicación y puede consultar las funciones autorizadas.
- **Resultado obtenido:** el inicio de sesión se completó correctamente durante la exploración manual.
- **Estado:** Passed.

#### TC-002 — Inicio de sesión con contraseña incorrecta

- **Precondición:** aplicación disponible.
- **Pasos:** introducir el correo válido con una contraseña incorrecta e intentar iniciar sesión.
- **Datos:** `admin@energia.local` / contraseña incorrecta.
- **Resultado esperado:** se rechaza el acceso y se presenta un mensaje de error comprensible; no se muestra información protegida.
- **Resultado obtenido:** el sistema rechazó el inicio de sesión y mostró el mensaje: «Email o contraseña incorrectos. Revisa los datos e inténtalo de nuevo». Permaneció en la pantalla de login.
- **Estado:** Passed.

#### TC-003 — Acceso a la documentación de la API

- **Precondición:** backend en ejecución.
- **Pasos:** abrir `http://localhost:8080/docs`.
- **Datos:** ninguno.
- **Resultado esperado:** Swagger carga y permite consultar los endpoints documentados.
- **Resultado obtenido:** Swagger cargó correctamente en http://localhost:8080/docs durante la comprobación manual.
- **Estado:** Passed.

### B. Libro de medidores

#### TC-004 — Carga del libro de medidores

- **Precondición:** sesión autenticada.
- **Pasos:** abrir la sección Medidores.
- **Datos:** conjunto de datos incluido en el entorno.
- **Resultado esperado:** se presenta el listado con identificador, estado, consumo, baseline, variación y datos relacionados disponibles.
- **Resultado obtenido:** la tabla se mostró con registros, filtros y controles de ordenamiento.
- **Estado:** Passed.

#### TC-005 — Filtro por estado crítico

- **Precondición:** sesión autenticada y medidores cargados.
- **Pasos:** seleccionar el filtro Críticas.
- **Datos:** estado `CRITICAL`.
- **Resultado esperado:** se muestran únicamente los medidores cuyo estado corresponde a crítico.
- **Resultado obtenido:** se observaron M-109 y M-112 en el listado filtrado.
- **Estado:** Passed.

#### TC-006 — Filtro por estado normal

- **Precondición:** sesión autenticada.
- **Pasos:** seleccionar Normales y revisar los estados de todos los registros devueltos.
- **Datos:** estado `NORMAL`.
- **Resultado esperado:** todos los registros visibles cumplen el filtro y no se muestran medidores en alerta o estado crítico.
- **Resultado obtenido:** el filtro «Normales» mostró 8 medidores: M-101, M-102, M-103, M-105, M-107, M-108, M-110 y M-111. Todos aparecen con estado «Normal»; no se observaron medidores con estado `ALERT` o `CRITICAL`.
- **Estado:** Passed.

#### TC-007 — Búsqueda por identificador existente

- **Precondición:** libro de medidores disponible.
- **Pasos:** introducir el identificador completo de un medidor en el campo de búsqueda.
- **Datos:** `M-109`.
- **Resultado esperado:** se muestra el medidor coincidente y los resultados no relacionados se excluyen.
- **Resultado obtenido:** en la pestaña «Todos», la búsqueda de `M-109` mostró el medidor esperado. También se probaron las búsquedas parciales `10`, `M-10`, `M-11`, `9`, `M`, `109`, `0` y `1`; todas devolvieron resultados coherentes con el texto ingresado.
- **Estado:** Passed.

#### TC-008 — Búsqueda sin coincidencias

- **Precondición:** libro de medidores disponible.
- **Pasos:** buscar un identificador que no exista.
- **Datos:** `XYZ-999`.
- **Resultado esperado:** se presenta un estado vacío claro, sin resultados incorrectos ni errores inesperados.
- **Resultado obtenido:** al buscar `XYZ-999`, la tabla no mostró medidores y presentó el mensaje «Ningún medidor coincide con los filtros» junto con «No hay medidores que contengan "XYZ-999"».
- **Estado:** Passed.

#### TC-009 — Ordenamiento por consumo

- **Precondición:** existen varios medidores en el listado.
- **Pasos:** ordenar por consumo ascendente y luego descendente.
- **Datos:** ordenamiento por consumo.
- **Resultado esperado:** los valores aparecen en el orden solicitado y los extremos corresponden a los valores mínimo y máximo del conjunto filtrado.
- **Resultado obtenido:** se verificaron ambos sentidos del ordenamiento por consumo. En orden ascendente, los primeros resultados fueron M-107 (474,7 kWh), M-103 (602,4 kWh) y M-112 (662,7 kWh). En orden descendente, fueron M-109 (2.207,6 kWh), M-104 (1.725,6 kWh) y M-106 (1.362,1 kWh). Ambos órdenes fueron correctos.
- **Estado:** Passed.

#### TC-010 — Paginación con más registros que el tamaño de página

- **Precondición:** listado con 12 medidores, filtro Todos y búsqueda vacía.
- **Pasos:** abrir Medidores, verificar el contador y pulsar Siguiente.
- **Datos:** total esperado de 12 medidores; tamaño de página de 10.
- **Resultado esperado:** se puede avanzar a la segunda página para consultar los registros 11 y 12. En la primera página, Anterior debe estar deshabilitado y Siguiente habilitado.
- **Resultado obtenido:** el contador muestra `1–10 de 12`, pero Anterior y Siguiente aparecen deshabilitados. No es posible acceder a los dos registros restantes.
- **Estado:** Failed.
- **Defecto relacionado:** DEF-001.

#### TC-011 — Paginación cuando el total es exactamente el tamaño de página

- **Precondición:** disponer de exactamente 10 resultados mediante datos o filtros controlados.
- **Pasos:** consultar el listado y revisar el contador y los botones de navegación.
- **Datos:** total 10; tamaño de página 10.
- **Resultado esperado:** se muestra `1–10 de 10`; no es necesaria una segunda página y los botones de navegación están deshabilitados.
- **Resultado obtenido:** al buscar `10` con el filtro «Todos», se obtuvieron exactamente 10 medidores. El contador mostró «1–10 de 10» y los botones «Anterior» y «Siguiente» estaban deshabilitados.
- **Estado:** Passed.

#### TC-012 — Paginación con cero resultados

- **Precondición:** aplicar una búsqueda o filtro que no produzca resultados.
- **Pasos:** consultar el listado y revisar el contador, el estado vacío y los botones.
- **Datos:** total 0.
- **Resultado esperado:** no se muestran registros; el contador y la navegación representan correctamente la ausencia de resultados.
- **Resultado obtenido:** al buscar `XYZ-999` con el filtro «Todos», la tabla mostró el mensaje «Ningún medidor coincide con los filtros» y «No hay medidores que contengan "XYZ-999"». No se mostró contador ni botones de paginación.
- **Estado:** Passed.

### C. Detalle de medidores y anomalías

#### TC-013 — Detalle de M-109, anomalía real

- **Precondición:** sesión autenticada y M-109 disponible.
- **Pasos:** abrir el detalle de M-109 y revisar la explicación, las variables y la recomendación.
- **Datos:** M-109.
- **Resultado esperado:** el detalle presenta la anomalía real, evidencia coherente con el cambio de consumo y una acción recomendada.
- **Resultado obtenido:** se observó un aumento de consumo superior al 100% frente al baseline, un cambio del factor de potencia y una recomendación de investigación en sitio.
- **Estado:** Passed.

#### TC-014 — M-112, calidad de datos

- **Precondición:** sesión autenticada y M-112 disponible.
- **Pasos:** abrir el detalle de M-112 y revisar el tipo, la severidad, las señales eléctricas y la acción recomendada.
- **Datos:** M-112.
- **Resultado esperado:** el medidor se identifica como problema de calidad de datos, con evidencia de lecturas eléctricas incoherentes y recomendación de validación.
- **Resultado obtenido:** M-112 aparece clasificado como «Calidad de datos», con severidad Alta. El hallazgo indica 16 horas de lecturas eléctricas incoherentes, voltaje entre 201,6 y 241,2 V frente a un valor normal de 221,0 V, y factor de potencia de hasta 0,58. La comparación con el baseline confirma 16 horas con voltaje fuera de ±5 % y 12 horas de factor de potencia incoherente con consumo normal. El consumo de las últimas 24 horas es 662,7 kWh, con variación de 0,0 % frente al baseline. La evidencia es coherente con la clasificación.
- **Estado:** Passed.

#### TC-015 — M-104, anomalía explicable por un evento

- **Precondición:** M-104 disponible.
- **Pasos:** abrir su detalle y consultar el evento operacional relacionado.
- **Datos:** M-104; evento de activación de una nueva línea de producción.
- **Resultado esperado:** la explicación relaciona el cambio de consumo con el evento y recomienda validar la operación y actualizar el baseline cuando corresponda.
- **Resultado obtenido:** M-104 aparece como «Anomalía explicable», descrita como un cambio sostenido que coincide con un evento operativo. En eventos relacionados se muestra «Cambio operativo · 10/09 19:00», con la descripción «New production line activated». La acción recomendada es «Validar operación» y propone confirmar el cambio con operación y actualizar el baseline de M-104. Los resultados son coherentes con la regla de negocio esperada.
- **Estado:** Passed.

#### TC-016 — M-106, falso positivo

- **Precondición:** M-106 disponible.
- **Pasos:** abrir el detalle y revisar el evento operacional, la clasificación y la recomendación.
- **Datos:** M-106; evento de parada programada de 12 horas.
- **Resultado esperado:** se reconoce el evento que explica la caída temporal del consumo y se recomienda no escalar innecesariamente.
- **Resultado obtenido:** M-106 aparece clasificado como «Falso positivo». La explicación indica que el cambio lo explica un evento y que el consumo volvió a la normalidad. En eventos relacionados se muestra «Parada programada · 07/09 19:00», con la descripción «Scheduled maintenance outage for 12 hours». La acción recomendada es «No escalar», coherente con la explicación.
- **Estado:** Passed.

#### TC-017 — Coherencia entre tipo de anomalía, severidad y acción

- **Precondición:** datos de referencia disponibles.
- **Pasos:** revisar los detalles de M-109, M-112, M-104 y M-106 y contrastarlos con las reglas documentadas del producto.
- **Datos:** los cuatro medidores de referencia.
- **Resultado esperado:** las clasificaciones y acciones coinciden con los escenarios definidos en `frontend/PRODUCT.md`.
- **Resultado obtenido:** se verificaron las cuatro anomalías principales en la interfaz:
  - M-109: Anomalía real, severidad Alta, prioridad 1, acción «Investigar».
  - M-112: Calidad de datos, severidad Alta, prioridad 2, acción «Validar medidor».
  - M-104: Anomalía explicable, severidad Media, prioridad 3, acción «Validar operación».
  - M-106: Falso positivo, severidad Baja, prioridad 4, acción «No escalar».
  Los cuatro casos coincidieron con las reglas de negocio y resultados esperados documentados para el producto.
- **Estado:** Passed.

### D. API y consistencia de datos

#### TC-018 — Autenticación por API con credenciales válidas e inválidas

- **Precondición:** backend disponible y endpoint de autenticación identificado en Swagger.
- **Pasos:** enviar una solicitud con credenciales válidas y otra con contraseña incorrecta.
- **Datos:** credenciales válidas y contraseña incorrecta.
- **Resultado esperado:** la solicitud válida obtiene la respuesta de autenticación definida por el contrato; la inválida se rechaza sin exponer credenciales.
- **Resultado obtenido:**con credenciales válidas, la API devolvió los campos access_token, token_type, expires_in y user. Con una contraseña incorrecta, devolvió HTTP 401. El valor del token no se registró en el informe.
- **Estado:** Passed.

#### TC-019 — Filtro y paginación en el endpoint de medidores

- **Precondición:** sesión o token válido y endpoint de listado identificado en Swagger.
- **Pasos:**
  1. Consultar el listado con página 1 y tamaño 10.
  2. Consultar la página 2 con el mismo tamaño.
  3. Aplicar el filtro de estado `CRITICAL`.
- **Datos:** página 1, página 2, tamaño 10 y estado `CRITICAL`.
- **Resultado esperado:** la API aplica correctamente el filtro, devuelve metadatos coherentes y permite recuperar los registros de ambas páginas sin omisiones ni duplicados.
- **Resultado obtenido:** la página 1 devolvió 10 registros (M-101 a M-110), con un total de 12. La página 2 devolvió los 2 restantes (M-111 y M-112). El filtro `CRITICAL` devolvió 2 registros: M-109 y M-112, ambos con severidad `HIGH`.
- **Estado:** Passed.

#### TC-020 — Consistencia entre UI y API para un medidor

- **Precondición:** sesión autenticada y endpoint de detalle identificado en Swagger.
- **Pasos:** consultar M-109 en la interfaz y en la API; comparar identificador, consumo, baseline, variación, severidad y tipo de anomalía.
- **Resultado esperado:** los valores equivalentes coinciden, considerando diferencias de formato decimal, redondeo y traducción de etiquetas.
- **Resultado obtenido:** la API devolvió `meter_id: M-109`, `consumption_kwh: 2207.6`, `baseline_kwh: 1052.15`, `variation_pct: 109.82`, `status: CRITICAL`, `severity: HIGH` y `anomaly_type: REAL_ANOMALY`. La interfaz mostró M-109, consumo de 2.207,6 kWh, baseline de 1.052,2 kWh, variación de +109,8 %, severidad Alta y clasificación Anomalía real. Los campos comparados coinciden considerando el redondeo y la traducción de etiquetas. La discrepancia horaria observada para M-109 se documenta por separado en DEF-002.
- **Estado:** Passed.
- **Observación relacionada:** DEF-002 — discrepancia en la presentación de la hora de detección.

## 4. Tabla de decisión para reglas de clasificación

La siguiente tabla resume escenarios de negocio que deben verificarse contra las reglas documentadas. No sustituye la validación de todos los umbrales numéricos.

| Cambio de consumo | Evento explicativo | Cambio continúa activo | Clasificación esperada |
|---|---|---|---|
| Sostenido | No | Sí | Anomalía real |
| Sostenido | Sí | No | Falso positivo, si el evento explica el cambio y el consumo volvió a la normalidad |
| Sostenido | Sí | Sí | Anomalía explicable |
| Lecturas eléctricas incoherentes con consumo estable | Evento o señales de calidad de datos | No aplica | Calidad de datos |

Los límites exactos de duración, porcentaje de cambio y señales eléctricas deben validarse mediante casos específicos, contrastados con la regla implementada y la documentación del producto.

## 5. Resumen de ejecución

- **Passed:** 19 casos ejecutados y aprobados.
- **Failed:** 1 caso (TC-010).
- **Not Run:** 0 casos.
- **Defecto confirmado:** DEF-001, paginación que impide acceder a los medidores 11 y 12.

**Nota:** los resultados corresponden a comprobaciones manuales de la interfaz, consultas puntuales a la API y validaciones específicas documentadas en cada caso. No significa que exista una prueba automatizada para cada uno de los casos de caja negra. La prueba automatizada de paginación se documenta también en el proyecto Playwright y reproduce DEF-001 como fallo esperado mientras el defecto siga presente.

## 6. Limitaciones y siguientes acciones

1. Ejecutar los casos pendientes de búsqueda, ordenamiento, validación negativa y API.
2. Comparar las respuestas de la API con los valores mostrados en la interfaz.
3. Verificar las reglas exactas de severidad en los límites numéricos.
4. Adjuntar evidencia de los casos fallidos y de los resultados relevantes.
5. Repetir TC-010 después de una corrección y registrar el resultado de la nueva ejecución por separado.

Los casos marcados Not Run no deben considerarse aprobados. La decisión final de liberación debe considerar los resultados reales, los defectos abiertos y las limitaciones de esta evaluación.