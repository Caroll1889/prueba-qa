# Pruebas E2E — EnergIA

Pruebas automatizadas de interfaz con Playwright y TypeScript para la plataforma EnergIA.

## Requisitos

- Node.js
- La aplicación levantada con Docker Compose desde la raíz del repositorio.
- Credenciales de un usuario de prueba.

## Configuración

Desde esta carpeta, instala las dependencias:

```powershell
npm install
npx playwright install chromium firefox
```

Crea un archivo `.env` en esta carpeta con las credenciales locales:

```text
QA_EMAIL=correo-del-usuario-de-prueba
QA_PASSWORD=contraseña-del-usuario-de-prueba
```

No subas `.env` al repositorio.

## Ejecutar las pruebas

```powershell
npm test
```

Para ejecutar las pruebas con el navegador visible:

```powershell
npx playwright test --headed
```

## Pruebas incluidas

- `investigation.spec.ts`: inicia sesión, abre Anomalías IA y verifica la investigación del medidor M-109. Se ejecuta en Chromium y Firefox.
- `pagination.spec.ts`: verifica la paginación cuando existen 12 medidores. Reproduce el defecto DEF-001, que impide acceder a la segunda página. Se ejecuta en Chromium y Firefox y utiliza `test.fail()` para registrar el fallo como esperado mientras el defecto siga presente.
- `api-meters.spec.ts`: se autentica mediante `POST /api/v1/auth/login` y consulta `POST /api/v1/meter/getAll`. Verifica el código HTTP, la paginación de la respuesta y los datos del medidor M-109, incluyendo estado, severidad, clasificación y valores de consumo, línea base y variación. Se ejecuta una sola vez en el proyecto `api`, independientemente de los navegadores.

La configuración también genera un reporte HTML y conserva trazas y capturas de pantalla cuando una prueba falla.

### Defecto conocido: DEF-001

La prueba de paginación está marcada con `test.fail()` porque se espera que falle mientras el defecto siga presente: el botón «Siguiente» está deshabilitado aunque hay 12 medidores y solo se muestran los primeros 10.

Un resultado clasificado como fallo esperado confirma el comportamiento conocido; no significa que el defecto esté corregido.
