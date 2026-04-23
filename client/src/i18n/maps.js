// Apex 地图 / 模式中文名
const MAP_CN = {
  // Battle Royale 地图
  "Kings Canyon": "国王峡谷",
  "World's Edge": "世界尽头",
  "Olympus": "奥林匹斯",
  "Storm Point": "风暴点",
  "Broken Moon": "残月",
  "E-District": "电力区域",
  // Mixtape / Arenas 地图
  "Thunderdome": "雷霆穹顶",
  "Party Crasher": "派对破坏者",
  "Encore": "安可",
  "Hammond Labs": "哈蒙德实验室",
  "Lava Siphon": "熔岩虹吸",
  "Production Yard": "生产车间",
  "Barometer": "晴雨表",
  "Habitat": "栖息地 4",
  "Habitat 4": "栖息地 4",
  "Drop-Off": "下沉区",
  "Estates": "庄园",
  "Skull Town": "骷髅镇",
  "Zeus Station": "宙斯站",
  "Monument": "纪念碑",
  "Fragment": "碎片",
  "Caustic Treatment": "毒气房",
  "Salvage": "废料场",
  "Overflow": "外溢",
  "Phase Runner": "相位运输",
  "Dome": "穹顶",
  "Oasis": "绿洲",
  "The Core": "核心"
};

// 事件 / 模式中文名
const EVENT_CN = {
  "Control": "控制模式",
  "Gun Run": "军备竞赛",
  "TDM": "团队死斗",
  "Team Deathmatch": "团队死斗",
  "Mixtape": "混合模式",
  "Lockdown": "锁定模式",
  "Winter Express": "冬日特快",
  "Armed and Dangerous": "狙击对决",
  "Duos": "双人组队",
  "Trios": "三人组队",
  "Ranked": "排位",
  "Ranked Leagues": "排位联赛"
};

export function zhMap(name) {
  if (!name) return name;
  return MAP_CN[name] || name;
}

export function zhEvent(name) {
  if (!name) return name;
  return EVENT_CN[name] || name;
}

// 地图名 → 图片文件名(不含扩展名),约定放在 /public/maps/<slug>.(jpg|png|webp)
// 返回 null 表示没这张地图的图,前端会回退到渐变色
export function mapSlug(name) {
  if (!name) return null;
  const key = name.trim();
  if (!(key in MAP_CN)) return null; // 只给已知地图生成 slug,避免无效请求
  return key
    .toLowerCase()
    .replace(/['']/g, '')        // 去掉撇号:World's Edge → worlds edge
    .replace(/[^a-z0-9]+/g, '-') // 非字母数字转 -
    .replace(/^-+|-+$/g, '');    // 去首尾 -
}
