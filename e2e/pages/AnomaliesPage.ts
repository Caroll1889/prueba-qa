import { type Page, type Locator } from "@playwright/test";

export class AnomaliesPage {
  readonly page: Page;
  readonly meterM109Link: Locator;

  constructor(page: Page) {
    this.page = page;
    this.meterM109Link = page.getByRole("link", { name: "M-109" });
  }

  async open() {
    await this.page.goto("/anomalias");
  }

  async openInvestigationM109() {
    await this.meterM109Link.click();
  }
}
