import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { MetersPage } from "../pages/MetersPage";

test("la paginación permite acceder a los 12 medidores", async ({ page }) => {
  const email = process.env.QA_EMAIL;
  const password = process.env.QA_PASSWORD;

  expect(email, "Falta configurar QA_EMAIL en .env").toBeTruthy();
  expect(password, "Falta configurar QA_PASSWORD en .env").toBeTruthy();

  const loginPage = new LoginPage(page);
  const metersPage = new MetersPage(page);

  // 1. Iniciar sesión
  await loginPage.open();
  await loginPage.login(email!, password!);

  await expect(page.getByRole("heading", { name: "Despacho" })).toBeVisible();

  // 2. Abrir la lista de medidores
  await metersPage.open();

  // 3. Comprobar que aparecen los 12 medidores
  const pagination = page.getByRole("navigation", {
    name: "Paginación",
  });

  await expect(pagination).toContainText("1–10 de 12 medidores");

  // 4. Comprobar que se puede avanzar a la siguiente página
  test.fail(
    true,
    "DEF-001: el botón Siguiente está deshabilitado aunque hay 12 medidores",
  );

  await expect(page.getByRole("button", { name: "Siguiente" })).toBeEnabled();
});
