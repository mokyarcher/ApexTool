#!/usr/bin/env python3
"""
Sketchfab 模型批量下载器
支持下载指定用户的免费模型，优先 glTF 格式

使用方法:
    1. 仅列出模型: python3 sketchfab_downloader.py LkblZ --list-only
    2. 下载所有模型: python3 sketchfab_downloader.py LkblZ
    3. 限制下载数量: python3 sketchfab_downloader.py LkblZ -n 10
    4. 指定输出目录: python3 sketchfab_downloader.py LkblZ -o ./my_models

注意:
    - Sketchfab 下载 API 需要登录认证
    - 本脚本使用多种策略尝试获取下载链接
    - 对于需要登录的模型，请使用 --cookies 参数提供登录状态
"""

import requests
import json
import os
import time
import re
import sys
from urllib.parse import urljoin, urlparse, unquote
from pathlib import Path


class SketchfabDownloader:
    BASE_URL = "https://sketchfab.com"
    API_URL = "https://api.sketchfab.com/v3"

    def __init__(self, output_dir="downloads", cookies_file=None):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Referer": "https://sketchfab.com/",
        })
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

        if cookies_file and Path(cookies_file).exists():
            self.load_cookies(cookies_file)

    def load_cookies(self, cookies_file):
        """从文件加载 cookies"""
        try:
            with open(cookies_file, 'r') as f:
                cookies = json.load(f)
                for cookie in cookies:
                    self.session.cookies.set(
                        cookie.get('name'),
                        cookie.get('value'),
                        domain=cookie.get('domain', '.sketchfab.com')
                    )
            print(f"已加载 cookies: {cookies_file}")
        except Exception as e:
            print(f"加载 cookies 失败: {e}")

    def save_cookies(self, cookies_file):
        """保存 cookies 到文件"""
        cookies = []
        for name, value in self.session.cookies.items():
            cookies.append({
                'name': name,
                'value': value,
                'domain': '.sketchfab.com'
            })
        with open(cookies_file, 'w') as f:
            json.dump(cookies, f, indent=2)
        print(f"Cookies 已保存到: {cookies_file}")

    def get_user_models(self, username, max_models=None):
        """
        获取指定用户的所有模型列表
        """
        models = []
        page = 1

        print(f"正在获取用户 {username} 的模型列表...")

        while True:
            search_url = f"{self.API_URL}/search"
            params = {
                "type": "models",
                "user": username,
                "downloadable": "true",
                "sort_by": "recent",
                "page": page,
                "per_page": 24,
            }

            try:
                resp = self.session.get(search_url, params=params, timeout=30)
                resp.raise_for_status()
                data = resp.json()

                results = data.get("results", [])
                if not results:
                    break

                for model in results:
                    models.append({
                        "uid": model.get("uid"),
                        "name": model.get("name", "unnamed"),
                        "uri": model.get("uri", ""),
                    })

                print(f"  第 {page} 页: 找到 {len(results)} 个模型")

                if max_models and len(models) >= max_models:
                    models = models[:max_models]
                    break

                if len(results) < 24:
                    break

                page += 1
                time.sleep(0.5)

            except requests.RequestException as e:
                print(f"请求失败: {e}")
                break

        print(f"总共找到 {len(models)} 个可下载模型")
        return models

    def get_download_url_api(self, model_uid):
        """
        通过 API 获取下载链接 (需要认证)
        """
        download_url = f"{self.API_URL}/models/{model_uid}/download"

        try:
            resp = self.session.get(download_url, timeout=30)

            if resp.status_code == 200:
                data = resp.json()

                for fmt in ["gltf", "glb", "usdz"]:
                    info = data.get(fmt, {})
                    if info and info.get("url"):
                        return {
                            "format": fmt,
                            "url": info["url"],
                            "size": info.get("size", 0),
                        }

            elif resp.status_code == 401:
                print(f"  API 返回 401: 需要登录认证")
            elif resp.status_code == 403:
                print(f"  API 返回 403: 没有下载权限")

        except requests.RequestException as e:
            print(f"  API 请求失败: {e}")

        return None

    def get_download_url_graphql(self, model_uid):
        """
        通过 GraphQL 获取下载链接 (需要 CSRF token)
        """
        graphql_url = f"{self.BASE_URL}/graphql"

        query = {
            "query": """
                query ModelArchives($uid: ID!) {
                    model(uid: $uid) {
                        archives {
                            gltf { url size }
                            glb { url size }
                            usdz { url size }
                        }
                    }
                }
            """,
            "variables": {"uid": model_uid}
        }

        try:
            resp = self.session.post(
                graphql_url,
                json=query,
                headers={
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                timeout=30
            )

            if resp.status_code == 200:
                data = resp.json()
                model_data = data.get("data", {}).get("model", {})
                archives = model_data.get("archives", {})

                for fmt in ["gltf", "glb", "usdz"]:
                    info = archives.get(fmt, {})
                    if info and info.get("url"):
                        return {
                            "format": fmt,
                            "url": info["url"],
                            "size": info.get("size", 0),
                        }

            elif resp.status_code == 403:
                print(f"  GraphQL 返回 403: CSRF 验证失败，需要有效的登录 session")

        except requests.RequestException as e:
            print(f"  GraphQL 请求失败: {e}")

        return None

    def get_download_url(self, model_uid):
        """
        获取模型的下载链接 (glTF 优先)
        依次尝试: API -> GraphQL
        """
        # 方法1: 直接 API
        result = self.get_download_url_api(model_uid)
        if result:
            return result

        # 方法2: GraphQL
        result = self.get_download_url_graphql(model_uid)
        if result:
            return result

        return None

    def download_file(self, url, filepath, model_name=""):
        """
        下载文件并显示进度
        """
        try:
            with self.session.get(url, stream=True, timeout=120) as resp:
                resp.raise_for_status()
                total_size = int(resp.headers.get("content-length", 0))

                downloaded = 0
                chunk_size = 8192

                with open(filepath, "wb") as f:
                    for chunk in resp.iter_content(chunk_size=chunk_size):
                        if chunk:
                            f.write(chunk)
                            downloaded += len(chunk)
                            if total_size > 0:
                                percent = downloaded / total_size * 100
                                bar_len = 30
                                filled = int(bar_len * percent / 100)
                                bar = "█" * filled + "░" * (bar_len - filled)
                                print(f"\r  [{bar}] {percent:.1f}%", end="", flush=True)
                            else:
                                print(f"\r  已下载: {downloaded / 1024 / 1024:.1f} MB", end="", flush=True)

                print(f"\r  下载完成: {filepath.name}")
                return True

        except Exception as e:
            print(f"\n  下载失败: {e}")
            if filepath.exists():
                filepath.unlink()
            return False

    def sanitize_filename(self, name):
        """
        清理文件名，移除非法字符
        """
        name = re.sub(r'[<>:"/\\|?*]', "_", name)
        name = name.strip(". ")
        return name or "unnamed"

    def download_user_models(self, username, max_models=None):
        """
        批量下载指定用户的模型
        """
        models = self.get_user_models(username, max_models)

        if not models:
            print("没有找到可下载的模型")
            return

        success_count = 0
        fail_count = 0
        need_auth_count = 0

        for i, model in enumerate(models, 1):
            print(f"\n[{i}/{len(models)}] 处理模型: {model['name']}")

            download_info = self.get_download_url(model["uid"])
            if not download_info:
                need_auth_count += 1
                fail_count += 1
                continue

            safe_name = self.sanitize_filename(model["name"])
            ext = download_info["format"]
            filename = f"{safe_name}_{model['uid']}.{ext}.zip"
            filepath = self.output_dir / filename

            if filepath.exists():
                print(f"  文件已存在，跳过: {filename}")
                success_count += 1
                continue

            size_str = f"{download_info.get('size', 0) / 1024 / 1024:.1f} MB" if download_info.get("size") else "未知大小"
            print(f"  格式: {ext}, 大小: {size_str}")
            print(f"  保存到: {filename}")

            if self.download_file(download_info["url"], filepath, model["name"]):
                success_count += 1
            else:
                fail_count += 1

            time.sleep(1)

        print(f"\n{'='*50}")
        print(f"下载完成: 成功 {success_count}, 失败 {fail_count}")
        if need_auth_count > 0:
            print(f"注意: {need_auth_count} 个模型需要 Sketchfab 登录认证才能下载")
            print(f"请使用浏览器登录 Sketchfab，然后导出 cookies 使用 --cookies 参数")
        print(f"文件保存目录: {self.output_dir.absolute()}")


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Sketchfab 模型批量下载器 - 自动优先下载 glTF 格式",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 仅列出模型
  python3 sketchfab_downloader.py LkblZ --list-only

  # 下载所有模型 (可能需要登录)
  python3 sketchfab_downloader.py LkblZ

  # 限制下载数量
  python3 sketchfab_downloader.py LkblZ -n 10

  # 指定输出目录
  python3 sketchfab_downloader.py LkblZ -o ./apex_models

  # 使用 cookies 文件 (从浏览器导出)
  python3 sketchfab_downloader.py LkblZ --cookies cookies.json

获取 Cookies 方法:
  1. 使用浏览器登录 sketchfab.com
  2. 安装 "Get cookies.txt LOCALLY" 或 "EditThisCookie" 扩展
  3. 导出 cookies 为 JSON 格式
  4. 使用 --cookies 参数指定文件路径
        """
    )
    parser.add_argument("username", help="Sketchfab 用户名 (例如: LkblZ)")
    parser.add_argument("-o", "--output", default="downloads", help="输出目录 (默认: downloads)")
    parser.add_argument("-n", "--max", type=int, help="最多下载数量")
    parser.add_argument("--list-only", action="store_true", help="仅列出模型，不下载")
    parser.add_argument("--cookies", help="Cookies JSON 文件路径 (用于登录认证)")

    args = parser.parse_args()

    downloader = SketchfabDownloader(output_dir=args.output, cookies_file=args.cookies)

    if args.list_only:
        models = downloader.get_user_models(args.username, args.max)
        print("\n模型列表:")
        for m in models:
            print(f"  - {m['name']} (UID: {m['uid']})")
    else:
        downloader.download_user_models(args.username, args.max)


if __name__ == "__main__":
    main()
