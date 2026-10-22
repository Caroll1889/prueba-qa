import { type Page, type Locator } from "@playwright/test";

export class InvestigationPage {
  readonly page: Page;
  readonly meterTitle: Locator;
  readonly findingsCard: Locator;
  readonly recommendedActionCard: Locator;
  readonly baselineCard: Locator;
  readonly changedVariablesCard: Locator;
  readonly evidenceCard: Locator;
  readonly relatedEventsCard: Locator;
  readonly openMeterLink: Locator;
  readonly backToOrdersLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.meterTitle = page.getByRole("heading", { name: "M-109" });
    this.findingsCard = page.getByText("Qué encontró la IA", { exact: true });
    this.recommendedActionCard = page.getByText("Acción recomendada", {
      exact: true,
    });
    this.baselineCard = page.getByText("Comparación contra baseline", {
      exact: true,
    });
    this.changedVariablesCard = page.getByText("Variables que cambiaron", {
      exact: true,
    });
    this.evidenceCard = page.getByText("Evidencia y confianza", {
      exact: true,
    });
    this.relatedEventsCard = page.getByText("Eventos relacionados", {
      exact: true,
    });
    this.openMeterLink = page.getByRole("link", {
      name: "Ver el medidor completo",
    });
    this.backToOrdersLink = page.getByRole("link", {
      name: "Volver a las órdenes",
    });
  }
}
