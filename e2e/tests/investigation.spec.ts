import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { AnomaliesPage } from "../pages/AnomaliesPage";
import { InvestigationPage } from "../pages/InvestigationPage";

test("el usuario puede revisar la investigación de M-109", async ({ page }) => {
  const email = process.env.QA_EMAIL;
  const password = process.env.QA_PASSWORD;

  // Verificar que las credenciales estén configuradas
  expect(email, "Falta configurar QA_EMAIL en .env").toBeTruthy();
  expect(password, "Falta configurar QA_PASSWORD en .env").toBeTruthy();

  const loginPage = new LoginPage(page);
  const anomaliesPage = new AnomaliesPage(page);
  const investigationPage = new InvestigationPage(page);

  // 1. Iniciar sesión
  await loginPage.open();
  await loginPage.login(email!, password!);

  // 2. Comprobar que el usuario llega a Despacho
  await expect(page.getByRole("heading", { name: "Despacho" })).toBeVisible();

  // 3. Abrir Anomalías IA y seleccionar el medidor M-109
  await anomaliesPage.open();
  await anomaliesPage.openInvestigationM109();

  // 4. Comprobar el encabezado de la investigación
  await expect(investigationPage.meterTitle).toBeVisible();

  // 5. Comprobar las seis secciones de la investigación
  await expect(investigationPage.findingsCard).toBeVisible();
  await expect(investigationPage.recommendedActionCard).toBeVisible();
  await expect(investigationPage.baselineCard).toBeVisible();
  await expect(investigationPage.changedVariablesCard).toBeVisible();
  await expect(investigationPage.evidenceCard).toBeVisible();
  await expect(investigationPage.relatedEventsCard).toBeVisible();

  // 6. Comprobar los enlaces para continuar la navegación
  await expect(investigationPage.openMeterLink).toBeVisible();
  await expect(investigationPage.backToOrdersLink).toBeVisible();
});
