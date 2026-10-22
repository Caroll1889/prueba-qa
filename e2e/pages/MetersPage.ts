import { type Page } from "@playwright/test";

export class MetersPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open() {
    await this.page.goto("/medidores");
  }
}
