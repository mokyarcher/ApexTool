#!/usr/bin/env python3
"""
Sketchfab 模型批量下载器 v2
使用 Playwright 浏览器自动化来点击下载按钮

需要安装:
    pip install playwright
    playwright install chromium

使用方法:
    python3 sketchfab_downloader_v2.py LkblZ --cookies cookies.json
"""

import asyncio
import json
import re
from pathlib import Path
from urllib.parse import unquote

from playwright.async_api import async_playwright


class SketchfabBrowserDownloader:
    def __init__(self, output_dir="downloads", cookies_file=None):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.cookies_file = cookies_file
        self.cookies = []

        if cookies_file and Path(cookies_file).exists():
            with open(cookies_file) as f:
                self.cookies = json.load(f)

    async def get_user_models(self, username, max_models=None):
        """获取用户模型列表"""
        models = []
        page_num = 1

        print(f"正在获取用户 {username} 的模型列表...")

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()

            if self.cookies:
                await context.add_cookies(self.cookies)

            page = await context.new_page()

            while True:
                url = f"https://sketchfab.com/{username}/models"
                if page_num > 1:
                    url = f"{url}?page={page_num}"

                try:
                    await page.goto(url, wait_until="networkidle", timeout=30000)
                    await asyncio.sleep(2)

                    # 提取模型信息
                    model_cards = await page.query_selector_all('.model-card, [data-model-uid]')

                    if not model_cards:
                        # 尝试从页面脚本中提取
                        content = await page.content()
                        uids = re.findall(r'"uid":"([a-f0-9]{32})"', content)
                        names = re.findall(r'"name":"([^"]+)"', content)

                        for uid, name in zip(uids, names):
                            if uid not in [m['uid'] for m in models]:
                                models.append({'uid': uid, 'name': name})
                    else:
                        for card in model_cards:
                            uid_elem = await card.get_attribute('data-model-uid')
                            name_elem = await card.query_selector('.model-name, .title')
                            name = await name_elem.inner_text() if name_elem else 'unnamed'

                            if uid_elem and uid_elem not in [m['uid'] for m in models]:
                                models.append({'uid': uid_elem, 'name': name})

                    print(f"  第 {page_num} 页: 找到 {len(models)} 个模型")

                    if max_models and len(models) >= max_models:
                        models = models[:max_models]
                        break

                    # 检查是否有下一页
                    next_btn = await page.query_selector('.next-page, .pagination__next')
                    if not next_btn or await next_btn.get_attribute('disabled'):
                        break

                    page_num += 1

                except Exception as e:
                    print(f"获取页面失败: {e}")
                    break

            await browser.close()

        print(f"总共找到 {len(models)} 个模型")
        return models

    async def download_model(self, model_uid, model_name):
        """通过浏览器获取下载链接并下载"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()

            if self.cookies:
                await context.add_cookies(self.cookies)

            page = await context.new_page()

            download_url = None
            download_format = "gltf"

            try:
                # 访问模型页面
                model_page = f"https://sketchfab.com/3d-models/placeholder-{model_uid}"
                await page.goto(model_page, wait_until="networkidle", timeout=30000)
                await asyncio.sleep(2)

                # 点击下载按钮
                download_btn = await page.query_selector('.download-btn, [data-action="download"]')
                if download_btn:
                    await download_btn.click()
                    await asyncio.sleep(1)

                    # 选择 glTF 格式
                    gltf_option = await page.query_selector('text=gltf, text=glTF')
                    if gltf_option:
                        await gltf_option.click()
                        await asyncio.sleep(1)

                # 监听下载请求
                # 方法: 拦截网络请求获取下载链接
                async with page.expect_request(lambda req: 'sketchfab-prod-media.s3.amazonaws.com' in req.url and req.method == 'GET') as request_info:
                    # 触发下载
                    confirm_btn = await page.query_selector('.confirm-download, [data-action="confirm-download"]')
                    if confirm_btn:
                        await confirm_btn.click()

                    request = await request_info.value
                    download_url = request.url
                    print(f"  获取到下载链接: {download_url[:80]}...")

            except Exception as e:
                print(f"  获取下载链接失败: {e}")

            await browser.close()

            if download_url:
                return await self.download_file(download_url, model_uid, model_name, download_format)

            return False

    async def download_file(self, url, model_uid, model_name, fmt):
        """下载文件"""
        import aiohttp

        safe_name = re.sub(r'[<>:"/\\|?*]', "_", model_name).strip(". ") or "unnamed"
        filename = f"{safe_name}_{model_uid}.{fmt}.zip"
        filepath = self.output_dir / filename

        if filepath.exists():
            print(f"  文件已存在，跳过: {filename}")
            return True

        print(f"  正在下载: {filename}")

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as resp:
                    if resp.status == 200:
                        with open(filepath, 'wb') as f:
                            async for chunk in resp.content.iter_chunked(8192):
                                f.write(chunk)
                        print(f"  下载完成: {filename}")
                        return True
                    else:
                        print(f"  下载失败: HTTP {resp.status}")
                        return False
        except Exception as e:
            print(f"  下载失败: {e}")
            return False

    async def download_user_models(self, username, max_models=None):
        """批量下载"""
        models = await self.get_user_models(username, max_models)

        if not models:
            print("没有找到模型")
            return

        success = 0
        failed = 0

        for i, model in enumerate(models, 1):
            print(f"\n[{i}/{len(models)}] 处理: {model['name']}")
            if await self.download_model(model['uid'], model['name']):
                success += 1
            else:
                failed += 1
            await asyncio.sleep(2)

        print(f"\n{'='*50}")
        print(f"完成: 成功 {success}, 失败 {failed}")
        print(f"保存目录: {self.output_dir.absolute()}")


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Sketchfab 浏览器自动化下载器")
    parser.add_argument("username", help="Sketchfab 用户名")
    parser.add_argument("-o", "--output", default="downloads", help="输出目录")
    parser.add_argument("-n", "--max", type=int, help="最多下载数量")
    parser.add_argument("--cookies", default="cookies.json", help="Cookies 文件")
    parser.add_argument("--list-only", action="store_true", help="仅列出")

    args = parser.parse_args()

    downloader = SketchfabBrowserDownloader(
        output_dir=args.output,
        cookies_file=args.cookies
    )

    if args.list_only:
        models = asyncio.run(downloader.get_user_models(args.username, args.max))
        for m in models:
            print(f"  - {m['name']} (UID: {m['uid']})")
    else:
        asyncio.run(downloader.download_user_models(args.username, args.max))


if __name__ == "__main__":
    main()
