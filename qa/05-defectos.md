# 05 — Reporte de defectos

## DEF-001 — La paginación no permite acceder a todos los medidores

**Estado:** Reproducido; causa técnica probable identificada.

**Severidad:** Media.  
**Prioridad:** Alta.

### Entorno
- Aplicación: EnergIA · AI Energy Management Platform.
- Ejecución: local, mediante Docker.
- Sistema operativo: Windows 11.
- Navegador: Google Chrome.
- Zona horaria de referencia: America/Bogota.
- Versión o commit: 15765d9.

### Precondiciones
- El usuario inició sesión correctamente.
- Hay 12 medidores disponibles.
- La página de medidores está configurada para mostrar 10 resultados por página.

### Pasos para reproducir
1. Abrir la aplicación y acceder a la pestaña «Medidores».
2. Seleccionar el filtro Estado «Todos».
3. Dejar vacía la búsqueda por identificador.
4. Comprobar que el contador muestra «1–10 de 12 medidores».
5. Intentar utilizar el botón «Siguiente».

### Resultado esperado
El botón «Siguiente» debe estar habilitado porque existen resultados adicionales. Al pulsarlo, la tabla debe mostrar los medidores restantes (11–12). El botón «Anterior» debe permanecer deshabilitado en la primera página.

### Resultado actual
La tabla muestra «1–10 de 12 medidores», pero tanto «Anterior» como «Siguiente» aparecen deshabilitados. No es posible acceder a los dos medidores restantes desde la interfaz.

### Evidencia funcional

- **Contador visible:** «1–10 de 12 medidores».
- **Botón Siguiente:** muestra el indicador de bloqueo y no responde al clic.
- **Botón Anterior:** está deshabilitado en la primera página, comportamiento esperado.
- **Archivo:** `qa/evidencias/DEF-001-paginacion-bloqueada.mp4`
- **Formato:** grabación de pantalla MP4.
- **Qué demuestra:** aunque el listado indica que existen 12 medidores, la interfaz no permite avanzar para consultar los registros 11 y 12.

### Análisis técnico
Archivo: `frontend/src/features/meters/components/Pagination.tsx`

Código observado:

```tsx
const pages = Math.max(1, Math.floor(count / size))
```

Con `count = 12` y `size = 10`, `Math.floor(12 / 10)` devuelve `1`. Por ello, la condición `page >= pages` deshabilita «Siguiente» cuando `page = 1`.

La causa probable es el uso de `Math.floor` en lugar de un cálculo que contemple cualquier resultado parcial de página.

`frontend/src/app/routes/MetersRoute.tsx` pasa al componente `Pagination` los valores `page`, `size` y `count` devueltos por la consulta de medidores.

### Impacto
El usuario no puede consultar todos los medidores desde el libro de medidores. Esto limita la inspección de datos y puede dificultar la identificación de equipos que requieren atención.

### Prueba automatizada

La prueba de Playwright está implementada en `e2e/tests/pagination.spec.ts`. Comprueba que el botón «Siguiente» esté habilitado cuando hay 12 medidores y el tamaño de página es 10. Actualmente, la aserción falla porque el botón aparece deshabilitado. La prueba utiliza `test.fail()` para registrar este resultado como un fallo esperado mientras DEF-001 siga presente.

La ejecución de la prueba no significa que el defecto esté corregido: sirve como prueba de regresión para verificarlo después de una futura corrección.

### Estado de la investigación

Defecto reproducido manualmente y causa técnica probable identificada mediante inspección estática. La prueba automatizada de Playwright reproduce el comportamiento y está configurada como fallo esperado mientras el defecto siga presente. El código de la aplicación no se ha modificado.

### Clasificación
La severidad y prioridad son evaluaciones iniciales de QA y pueden ajustarse a los criterios formales del proyecto.

## DEF-002 — La hora de detección de M-109 se muestra cinco horas antes de la hora de planta

**Estado:** Causa técnica identificada; discrepancia visual pendiente de confirmar nuevamente.

**Severidad:** Media.  
**Prioridad:** Alta.

### Entorno
- Aplicación: EnergIA · AI Energy Management Platform.
- Ejecución: local, mediante Docker.
- Sistema operativo: Windows 11.
- Zona horaria del entorno: `America/Bogota` (UTC-5).
- Versión o commit: `15765d9`.

### Precondiciones
- El usuario inició sesión correctamente.
- El medidor M-109 tiene una anomalía registrada.
- La aplicación se ejecuta en un entorno con zona horaria `America/Bogota`.

### Pasos para reproducir
1. Abrir la vista **Anomalías IA**.
2. Localizar la anomalía correspondiente al medidor M-109.
3. Consultar el campo `detected_at` de M-109 en la respuesta de la API.
4. Comparar la marca de tiempo recibida con la hora de detección mostrada en la interfaz.

### Resultado esperado
La interfaz debe conservar la hora de planta indicada por la API. Para la marca de tiempo `2026-09-12T14:00:00Z`, la hora esperada es **12/09 14:00**, según la prueba unitaria de `formatPlantTime`.

### Resultado actual

La función utiliza métodos de fecha locales, por lo que la hora obtenida depende de la zona horaria del entorno de ejecución. En `America/Bogota`, la marca de tiempo `2026-09-12T14:00:00Z` corresponde a las 09:00 de hora local.

Durante la revisión se observó una discrepancia entre la hora de 09:00 mostrada en el campo «Duración» y la hora de 14:00 mostrada en «Qué encontró la IA». La discrepancia visual específica debe confirmarse nuevamente y relacionarse con el campo exacto de la API antes de cerrar la reproducción funcional.

### Evidencia técnica
- **Archivo:** `frontend/src/lib/format.ts`.
- **Función:** `formatPlantTime`.
- **Código observado:**
  ```ts
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  ```
- **Prueba relacionada:** `frontend/src/lib/format.test.ts`, que espera `12/09 14:00` para `2026-09-12T14:00:00Z`.
- **Comprobación de zona horaria:** `America/Bogota`; hora local `9`, hora UTC `14`.

### Análisis técnico
La función `formatPlantTime` utiliza `getDate()`, `getMonth()` y `getHours()`, que obtienen los componentes de la fecha según la zona horaria local. Esto contradice el comentario de la función, que indica que deben utilizarse las partes UTC para evitar convertir la hora de planta.

### Impacto
La hora de detección puede mostrarse cinco horas antes de la registrada por la API. Esto puede confundir al investigar anomalías y relacionarlas con otros eventos de la planta.

### Prueba automatizada

Existe una prueba unitaria de `formatPlantTime` en `frontend/src/lib/format.test.ts` que valida el formato esperado para una marca de tiempo UTC. Sin embargo, no se ha confirmado que esta prueba detecte el problema cuando el entorno utiliza `America/Bogota`, ni que exista una prueba automatizada que valide la hora mostrada en la interfaz.

Se recomienda verificar la prueba unitaria bajo esa zona horaria y añadir una prueba de integración si es necesario. Estas validaciones están pendientes.

### Clasificación
La causa técnica está respaldada por la inspección estática y la comprobación de zona horaria. Falta confirmar nuevamente la discrepancia en la interfaz para cerrar la reproducción funcional. No se ha modificado el código de la aplicación.