from playwright.sync_api import Page, expect, sync_playwright
import time
import os

def verify_finetuning_ui(page: Page):
    # 1. Arrange: Go to the DesignAI Studio page
    page.goto("http://localhost:3000")

    # Wait for the page to load
    page.wait_for_selector("text=DesignAI Studio")

    # 2. Act: Click on the "Fine Tuning" mode button
    finetuning_btn = page.locator('button.mode-btn.enhancement:has-text("Fine Tuning")')
    finetuning_btn.scroll_into_view_if_needed()
    finetuning_btn.click()

    # 3. Assert: Check if the Fine-Tuning Manager is visible
    expect(page.locator("text=AI Fine-Tuning Manager")).to_be_visible()
    expect(page.locator("text=Upload Training Data (.jsonl)")).to_be_visible()
    expect(page.locator("text=Select Custom Model")).to_be_visible()

    # Take a screenshot
    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/finetuning_ui.png", full_page=True)
    print("Screenshot saved to /home/jules/verification/finetuning_ui.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_finetuning_ui(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
