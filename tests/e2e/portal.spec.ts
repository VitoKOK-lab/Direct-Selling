import { expect, test } from "@playwright/test";

const roles = [
  ["member01", "member", "會員總覽"],
  ["vendor01", "vendor", "廠商總覽"],
  ["admin01", "admin", "營運總覽"],
  ["finance01", "finance", "財務總覽"],
] as const;

for (const [username, role, title] of roles) {
  test(`${role} 可以登入且只進入自己的工作台`, async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("測試帳號").fill(username);
    await page.getByLabel("測試密碼").fill("Demo1234!");
    await page.getByRole("button", { name: /進入示範系統/ }).click();
    await expect(page).toHaveURL(new RegExp(`/${role}$`));
    await expect(page.locator("header").getByText(title, { exact: true })).toBeVisible();
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.getByText("示範資料／非正式交易", { exact: false }).first()).toBeVisible();
  });
}

test("會員可在手機尺寸操作商城與頁面標註", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByLabel("測試帳號").fill("member01");
  await page.getByLabel("測試密碼").fill("Demo1234!");
  await page.getByRole("button", { name: /進入示範系統/ }).click();
  await page.getByRole("button", { name: "開啟選單" }).click();
  await page.getByRole("link", { name: "會員商城" }).click();
  await expect(page.getByRole("heading", { name: "會員商城" })).toBeVisible();
  await page.getByRole("button", { name: "新增頁面標註" }).click();
  await expect(page.getByRole("dialog", { name: "新增頁面標註" })).toBeVisible();
});

test("會員越權頁面會導回會員端且財務 API 回傳 403", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("測試帳號").fill("member01");
  await page.getByLabel("測試密碼").fill("Demo1234!");
  await page.getByRole("button", { name: /進入示範系統/ }).click();
  await expect(page).toHaveURL(/\/member$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/member$/);
  const response = await page.request.get("/api/v1/settlements");
  expect(response.status()).toBe(403);
});

test("鍵盤使用者可跳至主要內容", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "行動 WebKit 使用觸控巡覽，不模擬桌面 Tab 鍵行為。");
  await page.goto("/login");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "跳至主要內容" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/login#main-content$/);
});
