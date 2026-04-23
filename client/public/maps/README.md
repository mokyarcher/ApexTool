# 地图缩略图目录

把地图图片丢到这里,**文件名必须与下方 slug 完全一致**(小写 + 短横线 + `.jpg`),前端自动加载。

## 文件名约定

- 格式:`.jpg`(统一用 jpg,体积小)
- 分辨率:**1600×900**(16:9 最佳),最小 800×450
- 体积:单张 < 300 KB,用 TinyPNG 压一下

## 大逃杀 / 排位 主图(必备)

| 地图 | 文件名 |
|---|---|
| Kings Canyon · 国王峡谷 | `kings-canyon.jpg` |
| World's Edge · 世界尽头 | `worlds-edge.jpg` |
| Olympus · 奥林匹斯 | `olympus.jpg` |
| Storm Point · 风暴点 | `storm-point.jpg` |
| Broken Moon · 残月 | `broken-moon.jpg` |
| E-District · 电力区域 | `e-district.jpg` |

## 混合模式 / LTM(可选)

| 地图 | 文件名 |
|---|---|
| Thunderdome · 雷霆穹顶 | `thunderdome.jpg` |
| Party Crasher · 派对破坏者 | `party-crasher.jpg` |
| Encore · 安可 | `encore.jpg` |
| Hammond Labs · 哈蒙德实验室 | `hammond-labs.jpg` |
| Lava Siphon · 熔岩虹吸 | `lava-siphon.jpg` |
| Production Yard · 生产车间 | `production-yard.jpg` |
| Barometer · 晴雨表 | `barometer.jpg` |
| Habitat · 栖息地 4 | `habitat.jpg` 或 `habitat-4.jpg` |
| Estates · 庄园 | `estates.jpg` |
| Skull Town · 骷髅镇 | `skull-town.jpg` |
| Zeus Station · 宙斯站 | `zeus-station.jpg` |
| Monument · 纪念碑 | `monument.jpg` |
| Fragment · 碎片 | `fragment.jpg` |
| Caustic Treatment · 毒气房 | `caustic-treatment.jpg` |
| Salvage · 废料场 | `salvage.jpg` |
| Overflow · 外溢 | `overflow.jpg` |
| Phase Runner · 相位运输 | `phase-runner.jpg` |
| Dome · 穹顶 | `dome.jpg` |
| Oasis · 绿洲 | `oasis.jpg` |
| The Core · 核心 | `the-core.jpg` |
| Drop-Off · 下沉区 | `drop-off.jpg` |

## 效果

- 有图 → 地图卡片上方显示 16:9 缩略图横幅,下方是地图名和倒计时
- 没图 → 自动隐藏缩略图区域,只显示文字(和原来一样),不会占空位
- 加载失败 → 同上,自动隐藏,不会显示破图

## 图片来源建议

- **游戏内截图**:进选图界面拍地图预览图,最高清
- **Apex 维基**:https://apexlegends.wiki.gg/wiki/Maps 每张地图页都有官方图
- **Respawn 官方推特**:新地图发布时官方会配高清渲染图

## 规则校对

前端按 `src/i18n/maps.js` 里 `mapSlug()` 规则生成文件名:
- 小写
- 撇号 `'` 去掉:`World's Edge` → `worlds-edge`
- 其他非字母数字字符转 `-`

所以 `World's Edge` 的文件名就是 `worlds-edge.jpg`,**不是** `world's-edge.jpg`。
