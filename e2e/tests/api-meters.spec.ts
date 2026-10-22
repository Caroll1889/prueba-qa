import { test, expect } from "@playwright/test";

const API_URL = "http://localhost:8080/api/v1";

test("API: consulta de medidores con filtros y paginación", async ({
  request,
}) => {
  const email = process.env.QA_EMAIL;
  const password = process.env.QA_PASSWORD;

  expect(email, "Falta QA_EMAIL en e2e/.env").toBeTruthy();
  expect(password, "Falta QA_PASSWORD en e2e/.env").toBeTruthy();

  const loginResponse = await request.post(`${API_URL}/auth/login`, {
    data: { email, password },
  });

  expect(
    loginResponse.status(),
    "La autenticación debe responder correctamente",
  ).toBe(200);

  const loginData = await loginResponse.json();
  expect(loginData.access_token).toBeTruthy();

  const metersResponse = await request.post(`${API_URL}/meter/getAll`, {
    headers: {
      Authorization: `Bearer ${loginData.access_token}`,
    },
    data: {
      filter: {
        meter_id: "M-109",
        sort_by: "meter_id",
        sort_order: "ASC",
        status: "CRITICAL",
      },
      pagination: {
        page: 1,
        size: 10,
      },
    },
  });

  expect(
    metersResponse.status(),
    "La consulta de medidores debe responder correctamente",
  ).toBe(200);

  const responseBody = await metersResponse.json();

  expect(responseBody.page).toBe(1);
  expect(responseBody.size).toBe(10);
  expect(responseBody.count).toBe(1);

  const meter = responseBody.rows[0];

  expect(meter.meter_id).toBe("M-109");
  expect(meter.status).toBe("CRITICAL");
  expect(meter.severity).toBe("HIGH");
  expect(meter.anomaly_type).toBe("REAL_ANOMALY");
  expect(meter.priority).toBe(1);
  expect(meter.consumption_kwh).toBe(2207.6);
  expect(meter.baseline_kwh).toBe(1052.15);
  expect(meter.variation_pct).toBe(109.82);
});
