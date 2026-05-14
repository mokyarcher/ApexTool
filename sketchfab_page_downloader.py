#!/usr/bin/env python3
"""
Sketchfab 模型下载器 - 通过网页获取下载链接
使用浏览器 Cookie 或直接从模型页面获取下载链接

使用方法:
    python3 sketchfab_page_downloader.py <模型页面URL>

示例:
    python3 sketchfab_page_downloader.py "https://sketchfab.com/3d-models/apex-legends-r99-multitool-2f45634986234b4e9ff22132d6e963b6"
"""

import requests
import re
import sys
import os
import time
import json
from pathlib import Path
from urllib.parse import urljoin

class SketchfabPageDownloader:
    def __init__(self, output_dir="downloads"):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
        })
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

    def extract_uid_from_url(self, url):
        """从 URL 中提取模型 UID"""
        # 匹配 https://sketchfab.com/3d-models/name-uid 或 https://sketchfab.com/3d-models/name-uid#download
        match = re.search(r'/3d-models/[^/]+-([a-f0-9-]+)(?:#|$)', url)
        if match:
            return match.group(1)
        return None

    def get_model_info_from_page(self, url):
        """从模型页面获取信息"""
        try:
            print(f"正在获取页面: {url}")
            resp = self.session.get(url, timeout=30)
            resp.raise_for_status()
            html = resp.text

            # 提取模型名称
            title_match = re.search(r'<title>(.*?) - Sketchfab</title>', html)
            name = title_match.group(1) if title_match else "unnamed"

            # 提取 UID
            uid = self.extract_uid_from_url(url)

            # 尝试从页面中提取模型数据
            # Sketchfab 页面中通常有 window.__INITIAL_STATE__ 或类似的 JSON 数据
            json_match = re.search(r'window\.__INITIAL_STATE__\s*=\s*({.+?});', html)
            if json_match:
                try:
                    data = json.loads(json_match.group(1))
                    # 尝试从 JSON 中提取下载链接
                    model_data = data.get('model', {}).get('data', {})
                    if model_data:
                        name = model_data.get('name', name)
                        uid = model_data.get('uid', uid)
                except:
                    pass

            return {
                "uid": uid,
                "name": name,
                "url": url,
            }
        except Exception as e:
            print(f"获取页面失败: {e}")
            return None

    def get_download_url_api(self, model_uid):
        """使用 API 获取下载链接（不需要 token，用于公开模型）"""
        try:
            # 尝试使用公开 API 获取下载链接
            url = f"https://api.sketchfab.com/v3/models/{model_uid}/download"
            resp = self.session.get(url, timeout=30)

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
                print("  需要登录才能下载")
            elif resp.status_code == 403:
                print("  没有下载权限")

            return None
        except Exception as e:
            print(f"  API 请求失败: {e}")
            return None

    def download_file(self, url, filepath):
        """下载文件"""
        try:
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

    def download_model(self, url):
        """下载单个模型"""
        # 获取模型信息
        model_info = self.get_model_info_from_page(url)
        if not model_info:
            return False

        print(f"模型: {model_info['name']} (UID: {model_info['uid']})")

        # 获取下载链接
        download_info = self.get_download_url_api(model_info['uid'])
        if not download_info:
            print("  无法获取下载链接")
            return False

        # 准备文件路径
        safe_name = self.sanitize_filename(model_info['name'])
        ext = download_info["format"]
        filename = f"{safe_name}_{model_info['uid']}.{ext}.zip"
        filepath = self.output_dir / filename

        # 检查是否已存在
        if filepath.exists():
            print(f"  文件已存在，跳过: {filename}")
            return True

        # 显示信息
        size_mb = download_info.get("size", 0) / 1024 / 1024
        size_str = f"{size_mb:.1f} MB" if size_mb > 0 else "未知大小"
        print(f"  格式: {ext.upper()}, 大小: {size_str}")

        # 下载
        return self.download_file(download_info["url"], filepath)


def main():
    if len(sys.argv) < 2:
        print("用法: python3 sketchfab_page_downloader.py <模型页面URL>")
        print("示例: python3 sketchfab_page_downloader.py 'https://sketchfab.com/3d-models/apex-legends-r99-multitool-2f45634986234b4e9ff22132d6e963b6'")
        sys.exit(1)

    url = sys.argv[1]
    downloader = SketchfabPageDownloader()
    success = downloader.download_model(url)

    if success:
        print("\n下载成功!")
    else:
        print("\n下载失败!")


if __name__ == "__main__":
    main()
