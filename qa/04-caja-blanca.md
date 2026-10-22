# 04. Revisión de caja blanca

## 1. Alcance y método

Se revisaron módulos del backend relacionados con la detección de cambios en el consumo y la clasificación de anomalías. El objetivo fue evaluar si las pruebas existentes cubren los escenarios críticos del negocio y señalar riesgos que requieren pruebas adicionales.

La revisión se realizó mediante lectura del código y de las pruebas existentes, junto con la ejecución de la suite de pruebas del backend y frontend. No se modificó el código de la aplicación.

## 2. Ejecución de las pruebas existentes

### Backend

**Comando ejecutado:**

`go test ./...`

Como Go no estaba instalado localmente, se ejecutó dentro de un contenedor temporal de Go, montando la carpeta `backend` del repositorio.

**Resultado:** el comando `go test ./...` finalizó correctamente dentro de un contenedor temporal de Go. Las pruebas pasaron en los paquetes que contienen tests; varios paquetes no tienen archivos de prueba. Este resultado confirma la ejecución satisfactoria de las pruebas existentes, pero no demuestra cobertura completa de la lógica del negocio.

**Limitación:** no se midió cobertura porcentual; por tanto, no se puede afirmar qué porcentaje del código está cubierto.

### Frontend

**Comando ejecutado:**

`corepack pnpm@10.8.1 test`

**Resultado:** 3 archivos de prueba y 11 tests pasaron.

Las pruebas existentes cubren formato de datos, filtros de medidores y componentes de interfaz. Sin embargo, el resultado exitoso no garantiza que todos los comportamientos estén cubiertos: durante la prueba manual se identificó un defecto de paginación que no fue detectado por esta suite.

## 3. Módulos revisados

### 3.1. `backend/internal/analysis/changes`

Este módulo detecta cambios sostenidos en el consumo.

**Cobertura observada:**
- Ignora una secuencia de solo tres horas.
- Detecta una secuencia de seis horas.
- Maneja una secuencia que continúa hasta el final de los datos.
- Verifica escenarios de medidores reales, incluidos M-104, M-106 y M-109.

**Valor:** las pruebas cubren escenarios relevantes para la duración mínima de un cambio y validan resultados con los datos del producto.

**Riesgo residual:** conviene añadir pruebas de límites exactos para la duración mínima, así como para cambios que terminan justo antes o después del umbral.

### 3.2. `backend/internal/analysis/classify`

Este módulo clasifica cambios y problemas de calidad de datos, asigna severidad y genera recomendaciones.

**Reglas observadas en el código:**
- Un cambio sin un evento explicativo se clasifica como anomalía real.
- Un evento explicativo junto con un cambio que ya no continúa puede clasificarse como falso positivo.
- Un evento explicativo junto con un cambio todavía activo puede clasificarse como anomalía explicable.
- Los problemas de calidad de datos consideran señales como voltaje fuera del rango esperado, factor de potencia incoherente y horas marcadas.
- La severidad de un cambio real depende del porcentaje de cambio y de si continúa activo.

**Cobertura observada:** existen pruebas de eventos explicativos y pruebas de integración que validan las clasificaciones esperadas de M-109, M-112, M-104 y M-106.

**Riesgo residual:** según la implementación revisada, la función `realSeverity` asigna severidad alta cuando la variación absoluta es ≥ 50 % y el cambio continúa activo; severidad media cuando la variación es ≥ 20 % y no se cumple la condición anterior; y severidad baja cuando la variación es inferior al 20 %. No se encontraron pruebas unitarias directas de esta función en el paquete `classify`. Se recomienda verificar los límites y sus condiciones con pruebas de frontera y contrastarlos con las reglas de negocio documentadas. Esta observación representa una brecha de cobertura, no un defecto funcional confirmado.

## 4. Pruebas unitarias adicionales recomendadas

| ID | Escenario | Resultado esperado |
|---|---|---|
| WB-01 | Cambio real con magnitud inferior al 20% | Severidad baja |
| WB-02 | Cambio real exactamente en el límite del 20% | Severidad media, según la condición implementada |
| WB-03 | Cambio real exactamente en el límite del 50%, sostenido | Severidad alta |
| WB-04 | Cambio de gran magnitud que ya no continúa | Verificar la clasificación y severidad aplicables |
| WB-05 | Evento explicativo con cambio activo | Anomalía explicable |
| WB-06 | Evento explicativo con cambio no activo | Falso positivo |
| WB-07 | Consumo estable y señales eléctricas incoherentes durante menos de 12 horas | Verificar la severidad esperada |
| WB-08 | Señales de calidad de datos durante exactamente 12 horas | Severidad alta, según la condición implementada |
| WB-09 | Cambio de consumo y corriente en direcciones opuestas | La corroboración no debe producir una confianza engañosa |
| WB-10 | Datos vacíos o insuficientes | Resultado controlado y sin errores inesperados |

Estos son escenarios propuestos, no resultados de pruebas ejecutadas. Antes de convertirlos en tests definitivos, debe verificarse la regla de negocio correspondiente y establecerse el resultado esperado.

## 5. Evaluación y conclusión

Las pruebas existentes verifican escenarios importantes del análisis y la clasificación de anomalías, y todas las pruebas ejecutadas pasaron. No obstante, existen oportunidades de mejora en la cobertura de límites y ramas específicas.

La revisión estática permitió identificar el origen técnico de DEF-001, el defecto de paginación documentado en `qa/05-defectos.md`: el cálculo del número de páginas utiliza división entera hacia abajo. Con 12 elementos y un tamaño de página de 10, calcula una página en lugar de dos. Este hallazgo de código es consistente con el fallo reproducido mediante las pruebas funcionales.

**Recomendación:** ampliar las pruebas unitarias de los límites de negocio, agregar una prueba de regresión para la paginación y medir la cobertura antes de emitir conclusiones cuantitativas sobre ella.