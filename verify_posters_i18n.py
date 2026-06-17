import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # English
        await page.goto("http://localhost:3000")
        await page.wait_for_selector("text=Global AI Poster")
        await page.screenshot(path="verification_en.png")
        print("Saved verification_en.png")

        # Spanish
        await page.select_option("select", "es")
        await page.wait_for_selector("text=Estudio Global")
        await page.screenshot(path="verification_es.png")
        print("Saved verification_es.png")

        # Arabic (RTL check)
        await page.select_option("select", "ar")
        await page.wait_for_selector("text=استوديو")
        await page.screenshot(path="verification_ar.png")
        print("Saved verification_ar.png")

        # Posters Mode button check
        await page.select_option("select", "en")
        await page.click("button:has-text('Posters AI')")
        await page.screenshot(path="verification_posters_mode.png")
        print("Saved verification_posters_mode.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
