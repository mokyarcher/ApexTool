#!/usr/bin/env python3
"""
Sketchfab 模型批量下载器 (API Token 版本)
支持从文件读取 UID 列表批量下载

使用方法:
    # 从文件读取 UID 下载
    python3 sketchfab_bulk_downloader.py <API_TOKEN> --uid-file model_uids.txt

    # 下载指定用户的模型（只获取 API 返回的第一页）
    python3 sketchfab_bulk_downloader.py <API_TOKEN> <USERNAME>

示例:
    python3 sketchfab_bulk_downloader.py 55f568e43eb34102adc28754709f04b4 --uid-file model_uids.txt
    python3 sketchfab_bulk_downloader.py 55f568e43eb34102adc28754709f04b4 LkblZ
"""

import requests
import json
import os
import time
import re
import sys
import argparse
from pathlib import Path
from urllib.parse import unquote


class SketchfabBulkDownloader:
    API_URL = "https://api.sketchfab.com/v3"

    def __init__(self, api_token, output_dir="downloads"):
        self.api_token = api_token
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Token {api_token}",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
        })
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

    def test_auth(self):
        """测试 API Token 是否有效"""
        try:
            resp = self.session.get(f"{self.API_URL}/me")
            if resp.status_code == 200:
                data = resp.json()
                print(f"认证成功! 用户: {data.get('displayName', data.get('username', 'Unknown'))}")
                return True
            else:
                print(f"认证失败: HTTP {resp.status_code}")
                print(f"响应: {resp.text[:200]}")
                return False
        except Exception as e:
            print(f"认证请求失败: {e}")
            return False

    def get_user_models(self, username, max_models=None):
        """
        获取指定用户的所有可下载模型
        使用搜索 API，但只获取第一页（Sketchfab 搜索 API 的 user 过滤有 bug）
        """
        models = []

        print(f"\n正在获取用户 {username} 的模型列表...")

        # 使用搜索 API 获取用户模型
        # 注意：Sketchfab 搜索 API 似乎只返回第一页，且每页最多 24 个
        search_url = f"{self.API_URL}/search"
        params = {
            "type": "models",
            "user": username,
            "downloadable": "true",
            "sort_by": "recent",
            "page": 1,
            "per_page": 24,
        }

        try:
            resp = self.session.get(search_url, params=params, timeout=30)
            resp.raise_for_status()
            data = resp.json()

            results = data.get("results", [])
            for model in results:
                models.append({
                    "uid": model.get("uid"),
                    "name": model.get("name", "unnamed"),
                    "uri": model.get("uri", ""),
                })

            print(f"  找到 {len(models)} 个模型")

            if max_models:
                models = models[:max_models]

        except requests.RequestException as e:
            print(f"请求失败: {e}")

        print(f"总共找到 {len(models)} 个可下载模型")
        return models

    def get_model_info(self, model_uid):
        """获取模型信息（名称等）"""
        try:
            resp = self.session.get(f"{self.API_URL}/models/{model_uid}", timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "uid": model_uid,
                    "name": data.get("name", "unnamed"),
                    "uri": data.get("uri", ""),
                }
            else:
                return {"uid": model_uid, "name": f"model_{model_uid}", "uri": ""}
        except Exception:
            return {"uid": model_uid, "name": f"model_{model_uid}", "uri": ""}

    def get_download_url(self, model_uid):
        """
        获取模型的下载链接，优先 glTF 格式
        """
        download_url = f"{self.API_URL}/models/{model_uid}/download"

        try:
            resp = self.session.get(download_url, timeout=30)

            if resp.status_code == 200:
                data = resp.json()

                # 优先 glTF
                for fmt in ["gltf", "glb", "usdz"]:
                    info = data.get(fmt, {})
                    if info and info.get("url"):
                        return {
                            "format": fmt,
                            "url": info["url"],
                            "size": info.get("size", 0),
                        }

                print(f"  模型 {model_uid} 没有可用的下载格式")
                return None

            elif resp.status_code == 401:
                print(f"  API Token 无效或已过期")
                return None
            elif resp.status_code == 403:
                print(f"  没有下载权限 (模型可能需要购买或作者未开放下载)")
                return None
            elif resp.status_code == 404:
                print(f"  模型不存在")
                return None
            else:
                print(f"  获取下载链接失败: HTTP {resp.status_code}")
                return None

        except requests.RequestException as e:
            print(f"  请求失败: {e}")
            return None

    def download_file(self, url, filepath):
        """
        下载文件并显示进度条
        S3 签名链接需要用独立的 session，不带 Authorization header
        """
        try:
            # S3 签名链接不能用带 Authorization 的 session
            # 创建独立的请求
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
            }
            with requests.get(url, headers=headers, stream=True, timeout=120) as resp:
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
                                mb = downloaded / 1024 / 1024
                                print(f"\r  已下载: {mb:.1f} MB", end="", flush=True)

                print(f"\r  下载完成: {filepath.name}")
                return True

        except Exception as e:
            print(f"\n  下载失败: {e}")
            if filepath.exists():
                filepath.unlink()
            return False

    def sanitize_filename(self, name):
        """清理文件名"""
        name = re.sub(r'[<>:"/\\|?*]', "_", name)
        name = name.strip(". ")
        return name or "unnamed"

    def download_models(self, models):
        """
        批量下载模型列表
        """
        if not models:
            print("没有要下载的模型")
            return

        success_count = 0
        fail_count = 0

        print(f"\n开始下载 {len(models)} 个模型...")
        print("=" * 60)

        for i, model in enumerate(models, 1):
            print(f"\n[{i}/{len(models)}] {model['name']}")

            # 获取下载链接
            download_info = self.get_download_url(model["uid"])
            if not download_info:
                fail_count += 1
                continue

            # 准备文件路径
            safe_name = self.sanitize_filename(model["name"])
            ext = download_info["format"]
            filename = f"{safe_name}_{model['uid']}.{ext}.zip"
            filepath = self.output_dir / filename

            # 检查是否已存在
            if filepath.exists():
                print(f"  文件已存在，跳过: {filename}")
                success_count += 1
                continue

            # 显示信息
            size_mb = download_info.get("size", 0) / 1024 / 1024
            size_str = f"{size_mb:.1f} MB" if size_mb > 0 else "未知大小"
            print(f"  格式: {ext.upper()}, 大小: {size_str}")

            # 下载
            if self.download_file(download_info["url"], filepath):
                success_count += 1
            else:
                fail_count += 1

            # 间隔，避免请求过快
            time.sleep(1)

        # 总结
        print(f"\n{'=' * 60}")
        print(f"下载完成!")
        print(f"  成功: {success_count}")
        print(f"  失败: {fail_count}")
        print(f"  总计: {len(models)}")
        print(f"  保存目录: {self.output_dir.absolute()}")

    def download_user_models(self, username, max_models=None):
        """
        批量下载指定用户的所有模型
        """
        # 先测试认证
        if not self.test_auth():
            return

        # 获取模型列表
        models = self.get_user_models(username, max_models)
        self.download_models(models)

    def download_from_uid_file(self, uid_file):
        """
        从文件读取 UID 列表并下载
        """
        # 先测试认证
        if not self.test_auth():
            return

        # 读取 UID 列表
        uid_file = Path(uid_file)
        if not uid_file.exists():
            print(f"文件不存在: {uid_file}")
            return

        uids = []
        with open(uid_file, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    uids.append(line)

        print(f"\n从文件读取到 {len(uids)} 个 UID")

        # 获取模型信息
        models = []
        for i, uid in enumerate(uids, 1):
            print(f"  获取模型信息 {i}/{len(uids)}: {uid}", end="\r")
            model_info = self.get_model_info(uid)
            models.append(model_info)
            time.sleep(0.3)

        print()
        self.download_models(models)


def main():
    parser = argparse.ArgumentParser(
        description="Sketchfab 批量下载器 - 使用 API Token 下载模型",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 从文件读取 UID 下载
  python3 sketchfab_bulk_downloader.py YOUR_TOKEN --uid-file model_uids.txt

  # 下载用户模型（API 只返回第一页）
  python3 sketchfab_bulk_downloader.py YOUR_TOKEN LkblZ

  # 限制下载数量
  python3 sketchfab_bulk_downloader.py YOUR_TOKEN LkblZ -n 10

  # 指定输出目录
  python3 sketchfab_bulk_downloader.py YOUR_TOKEN LkblZ -o ./my_models

  # 仅列出模型
  python3 sketchfab_bulk_downloader.py YOUR_TOKEN LkblZ --list-only
        """
    )
    parser.add_argument("token", help="Sketchfab API Token")
    parser.add_argument("username", nargs="?", help="要下载的 Sketchfab 用户名（可选，与 --uid-file 二选一）")
    parser.add_argument("--uid-file", help="包含模型 UID 的文件路径（每行一个 UID）")
    parser.add_argument("-o", "--output", default="downloads", help="输出目录 (默认: downloads)")
    parser.add_argument("-n", "--max", type=int, help="最多下载数量")
    parser.add_argument("--list-only", action="store_true", help="仅列出模型，不下载")

    args = parser.parse_args()

    if not args.username and not args.uid_file:
        parser.error("请提供用户名或 --uid-file 参数")

    downloader = SketchfabBulkDownloader(api_token=args.token, output_dir=args.output)

    if args.uid_file:
        if args.list_only:
            print("--list-only 与 --uid-file 不能同时使用")
            return
        downloader.download_from_uid_file(args.uid_file)
    else:
        if args.list_only:
            if not downloader.test_auth():
                return
            models = downloader.get_user_models(args.username, args.max)
            print("\n模型列表:")
            for m in models:
                print(f"  - {m['name']} (UID: {m['uid']})")
        else:
            downloader.download_user_models(args.username, args.max)


if __name__ == "__main__":
    main()
