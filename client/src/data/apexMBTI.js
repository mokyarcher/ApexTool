// Apex Legends 竞技场人格测试数据
// 4 维度: combat(战斗) / coop(协作) / strategy(策略) / risk(冒险)
// 每个维度 0-100，初始 50，答题时加减

export const QUESTIONS = [
  {
    id: 1,
    question: '跳伞时你最可能选择——',
    options: [
      { text: '直接扎热点！人多的地方最刺激', scores: { combat: 2, risk: 2 } },
      { text: '跟着跳伞大师走，三个人降在同一个点', scores: { coop: 2 } },
      { text: '选一个中等热度的区域，有人打但不至于太乱', scores: { strategy: 1, risk: -1 } },
      { text: '先落偏远地方搜好装备再说', scores: { combat: -2, risk: -2, strategy: 1 } },
    ],
  },
  {
    id: 2,
    question: '落地后你的第一反应是——',
    options: [
      { text: '抢最近的枪，看到人就干', scores: { combat: 2, risk: 1 } },
      { text: '先报点！"左边有人！右边也有！"', scores: { coop: 2, strategy: 1 } },
      { text: '先搜完一栋楼，没甲没枪打什么', scores: { strategy: 1, risk: -1 } },
      { text: '确保三个人不分散，抱团搜', scores: { coop: 2, risk: -1 } },
    ],
  },
  {
    id: 3,
    question: '你和对面都残血了，你会——',
    options: [
      { text: '直接冲！残血对面肯定比我慌', scores: { combat: 2, risk: 2 } },
      { text: '先拉掩体回血再说', scores: { strategy: 1, risk: -2 } },
      { text: '丢个手雷或技能逼他出来', scores: { strategy: 2 } },
      { text: '喊队友过来夹他', scores: { coop: 2, strategy: 1 } },
    ],
  },
  {
    id: 4,
    question: '队友被击倒了，你会——',
    options: [
      { text: '先把打倒他的人干掉再说', scores: { combat: 2, risk: 1 } },
      { text: '立刻拉人，队友活着比什么都重要', scores: { coop: 2, risk: 1 } },
      { text: '看情况，确认安全再拉', scores: { strategy: 1, risk: -1 } },
      { text: '扔烟或技能掩护再拉', scores: { coop: 1, strategy: 2 } },
    ],
  },
  {
    id: 5,
    question: '搜物资时你的风格是——',
    options: [
      { text: '金色就拿！背包永远不够大', scores: { risk: 1, strategy: -1 } },
      { text: '需要什么拿什么，多的给队友', scores: { coop: 2, strategy: 1 } },
      { text: '快速扫一眼够用就走，时间比物资重要', scores: { strategy: 2, combat: 1 } },
      { text: '仔细搜每个角落，不放过任何一个箱子', scores: { risk: -1, strategy: -1 } },
    ],
  },
  {
    id: 6,
    question: '听到远处有激烈枪声，你会——',
    options: [
      { text: '冲过去！三方收割是日常', scores: { combat: 2, risk: 2 } },
      { text: '和队友商量一下要不要去', scores: { coop: 2, strategy: 1 } },
      { text: '先过去侦查，看完情况再决定', scores: { strategy: 2 } },
      { text: '不关我事，继续搜我的东西', scores: { combat: -2, risk: -2 } },
    ],
  },
  {
    id: 7,
    question: '关于选择传奇角色，你更看重——',
    options: [
      { text: '技能能打伤害！进攻就是最好的防守', scores: { combat: 2 } },
      { text: '辅助型角色也很香，能帮到队伍才重要', scores: { coop: 2 } },
      { text: '侦查或机动型，信息和走位才是王道', scores: { strategy: 2 } },
      { text: '防御型优先，保命才是第一要务', scores: { risk: -2, strategy: 1 } },
    ],
  },
  {
    id: 8,
    question: '圈要缩了，你在圈外，你会——',
    options: [
      { text: '边跑边打，路上遇到人顺手干了', scores: { combat: 1, risk: 2 } },
      { text: '赶紧跑！命最重要', scores: { risk: -2 } },
      { text: '看地图选最安全的路线进圈', scores: { strategy: 2, risk: -1 } },
      { text: '和队友一起跑，互相掩护进圈', scores: { coop: 2, strategy: 1 } },
    ],
  },
  {
    id: 9,
    question: '你的理想武器搭配是——',
    options: [
      { text: '双冲锋/喷子，贴脸就是干', scores: { combat: 2, risk: 2 } },
      { text: '步枪+冲锋枪，远近都能打', scores: { strategy: 2 } },
      { text: '狙击+步枪，远距离先手制人', scores: { combat: -1, strategy: 1, risk: -1 } },
      { text: '随便有什么用什么，枪法才是核心', scores: { combat: 1, risk: 1 } },
    ],
  },
  {
    id: 10,
    question: '队友疯狂 ping 敌人位置要开打，但你觉得不该打——',
    options: [
      { text: '管他呢，跟着冲！队友要打就打', scores: { coop: 1, combat: 1, risk: 1 } },
      { text: '解释一下为什么不该打，说服队友', scores: { strategy: 2, coop: 1 } },
      { text: '不管了，我走我的路线', scores: { coop: -2, strategy: 1 } },
      { text: '跟着去但保持距离，看情况再说', scores: { strategy: 1, risk: -1 } },
    ],
  },
  {
    id: 11,
    question: '决赛圈，三队混战，你的策略是——',
    options: [
      { text: '趁他们打架直接冲进去收割！', scores: { combat: 2, risk: 2 } },
      { text: '让他们先打，等最佳时机出手', scores: { strategy: 2, risk: -1 } },
      { text: '占好地形守住，谁来打谁', scores: { strategy: 1, combat: -1 } },
      { text: '听指挥，队友说什么就什么', scores: { coop: 2 } },
    ],
  },
  {
    id: 12,
    question: '你打排位时的心态是——',
    options: [
      { text: '分不重要，杀人才爽', scores: { combat: 2, risk: 2, strategy: -1 } },
      { text: '分最重要，苟到最后就是胜利', scores: { risk: -2, strategy: 1 } },
      { text: '该打打该苟苟，随机应变', scores: { strategy: 2 } },
      { text: '跟队友配合最重要，有默契分自然来', scores: { coop: 2 } },
    ],
  },
  {
    id: 13,
    question: '刚灭了一队，周围可能还有敌人，你会——',
    options: [
      { text: '先把箱子舔了再说！', scores: { risk: 1, strategy: -1 } },
      { text: '一个人望风，让队友搜箱子', scores: { coop: 2, strategy: 1 } },
      { text: '快速拿补给品就走，别贪', scores: { strategy: 2, risk: -1 } },
      { text: '不舔了，继续找下一队打！', scores: { combat: 2, risk: 2 } },
    ],
  },
  {
    id: 14,
    question: '关于游戏中的语音/文字沟通——',
    options: [
      { text: '一般不怎么报点，打就完了', scores: { coop: -2, combat: 1 } },
      { text: '基本信息会报，但不废话', scores: { coop: 1, strategy: 1 } },
      { text: '话唠型，看到什么都要说', scores: { coop: 2 } },
      { text: '我喜欢当指挥，安排队友走位和战术', scores: { coop: 2, strategy: 2, combat: 1 } },
    ],
  },
  {
    id: 15,
    question: '转点路上遇到一个落单的敌人——',
    options: [
      { text: '必须干掉！送上门的不打白不打', scores: { combat: 2, risk: 1 } },
      { text: '不暴露位置更重要，装没看见', scores: { strategy: 2, risk: -1 } },
      { text: 'ping 一下让队友知道，一起决定', scores: { coop: 2, strategy: 1 } },
      { text: '绕路走，别节外生枝', scores: { combat: -2, risk: -2 } },
    ],
  },
  {
    id: 16,
    question: '你更喜欢哪类传奇角色——',
    options: [
      { text: '恶灵、动力小子——灵活走位，来去自如', scores: { combat: 1, risk: 1, coop: -1 } },
      { text: '直布罗陀、纽卡斯尔——大盾保护队友', scores: { coop: 2, risk: -1 } },
      { text: '寻血猎犬、密客——信息就是力量', scores: { strategy: 2 } },
      { text: '班加罗尔、暗影——攻守兼备万金油', scores: { strategy: 1, combat: 1 } },
    ],
  },
  {
    id: 17,
    question: '关于"舔包"这件事——',
    options: [
      { text: '杀人就是为了舔包，最爽的环节', scores: { risk: 1, combat: 1, strategy: -1 } },
      { text: '只拿需要的，换好弹药电池就够', scores: { strategy: 2 } },
      { text: '好东西让给队友，大家都强才是强', scores: { coop: 2 } },
      { text: '不舔了不舔了，又有人来了！', scores: { strategy: 1, risk: -2 } },
    ],
  },
  {
    id: 18,
    question: '开局搜了半天只有一把 P2020，你会——',
    options: [
      { text: 'P2020 也是枪！冲就完事', scores: { combat: 2, risk: 2 } },
      { text: '先猥琐发育，找到好枪再说', scores: { risk: -2, strategy: 1 } },
      { text: '跑到队友旁边让他们先打', scores: { coop: 2, risk: -1 } },
      { text: '找个角落蹲着，等别人送快递', scores: { combat: -1, strategy: 1 } },
    ],
  },
  {
    id: 19,
    question: '你的队友是个萌新，经常犯错误——',
    options: [
      { text: '无所谓，我自己打自己的', scores: { coop: -2, combat: 1 } },
      { text: '教他几招，大家一起进步', scores: { coop: 2 } },
      { text: '帮他 cover 就好，不指望太多', scores: { coop: 1, strategy: 1 } },
      { text: '有点烦但还是会带着他', scores: { coop: 1 } },
    ],
  },
  {
    id: 20,
    question: '关于看小地图这件事——',
    options: [
      { text: '从来不看，跟着感觉走', scores: { strategy: -2, risk: 1 } },
      { text: '偶尔看看，主要靠听声辨位', scores: { strategy: 1 } },
      { text: '经常看，提前规划路线和圈的位置', scores: { strategy: 2, risk: -1 } },
      { text: '我就是队伍的导航员，走哪我说了算', scores: { strategy: 2, coop: 1 } },
    ],
  },
  {
    id: 21,
    question: '你使用终极技能的时机通常是——',
    options: [
      { text: '有就用！技能不用就是浪费', scores: { combat: 1, risk: 1, strategy: -1 } },
      { text: '关键时刻再放，比如被围的时候', scores: { strategy: 2, risk: -1 } },
      { text: '配合队友的技能一起放', scores: { coop: 2, strategy: 1 } },
      { text: '留着跑路或者自保用', scores: { risk: -2, combat: -1 } },
    ],
  },
  {
    id: 22,
    question: '你捡到两把狙击枪，队友刚好缺枪——',
    options: [
      { text: '我先挑，剩下的随便', scores: { coop: -2 } },
      { text: '先让队友选，剩下的我用', scores: { coop: 2 } },
      { text: '商量一下谁用什么更合理', scores: { coop: 1, strategy: 2 } },
      { text: '两把都要！双持狙击是浪漫', scores: { risk: 1, coop: -2, strategy: -1 } },
    ],
  },
  {
    id: 23,
    question: '你在游戏中最享受的时刻是——',
    options: [
      { text: '一个人灭一整队的极限操作', scores: { combat: 2, coop: -1, risk: 1 } },
      { text: '队伍完美配合拿下冠军', scores: { coop: 2 } },
      { text: '精准的战术判断带来逆风翻盘', scores: { strategy: 2 } },
      { text: '安全撤离混战全员存活', scores: { risk: -2, strategy: 1 } },
    ],
  },
  {
    id: 24,
    question: '如果你是跳伞大师——',
    options: [
      { text: '直接扎最热的区域，就要刺激', scores: { combat: 2, risk: 2 } },
      { text: '听队友意见再决定', scores: { coop: 2 } },
      { text: '分析航线，选物资多但人少的地方', scores: { strategy: 2, risk: -1 } },
      { text: '让给别人当，我懒得选', scores: { coop: 1, strategy: -1 } },
    ],
  },
  {
    id: 25,
    question: '用一句话形容你的 Apex 风格——',
    options: [
      { text: '"干就完了，犹豫就会败北"', scores: { combat: 2, risk: 2, strategy: -1 } },
      { text: '"稳如老狗，活到最后才是赢"', scores: { risk: -2, strategy: 1, combat: -2 } },
      { text: '"团队配合，一个都不能少"', scores: { coop: 2 } },
      { text: '"运筹帷幄，决胜千里"', scores: { strategy: 2, combat: 1 } },
    ],
  },
];

// 16 种竞技场人格
// dims: combat(A/D) + coop(T/S) + strategy(P/I) + risk(R/C)
// A=Aggressive(>=50), D=Defensive(<50)
// T=Team(>=50), S=Solo(<50)
// P=Planned(>=50), I=Instinct(<50)
// R=Risk(>=50), C=Cautious(<50)

export const PERSONALITIES = [
  {
    code: 'APEX',
    name: '狩猎本能',
    dims: 'ASIR',
    legend: '恶灵',
    legendEN: 'Wraith',
    tagline: '我即是竞技场本身',
    color: '#EF4444',
    description: '你是竞技场上最纯粹的掠食者。当其他人还在犹豫要不要开枪时，你已经踢开了门。不需要队友指引方向，不需要精密计划——你的直觉就是最强的武器。落点必选热区，残血必追到底，三方必然参加。你可能是队友口中的"又冲了"，但更多时候你是对手噩梦的代名词。在你眼里，竞技场只有两种状态：正在战斗，和即将战斗。',
    strengths: ['超强的近战压制力', '关键时刻的爆发力极强', '永远不会因为犹豫而错失击杀'],
    weaknesses: ['容易陷入孤军深入的困境', '队友可能跟不上你的节奏', '有时候活不到决赛圈'],
  },
  {
    code: 'FADE',
    name: '暗影独行',
    dims: 'ASIC',
    legend: '亡灵',
    legendEN: 'Revenant',
    tagline: '消失在虚空，出现在你身后',
    color: '#A855F7',
    description: '你是竞技场的幽灵杀手。激进但不莽撞，独行但知道何时消失。你喜欢近距离交战的快感，但永远会给自己留一条退路。你不是不敢冲，而是冲完之后还能活着出来——这才是你和 APEX 型最大的区别。你擅长在混乱中寻找安全的缝隙，在危险中找到生存的可能。队友眼中你神出鬼没，敌人眼中你防不胜防。',
    strengths: ['进退自如的节奏感', '独自作战的生存能力极强', '知道什么时候该撤退'],
    weaknesses: ['过于依赖个人操作', '有时候会错过该拼的时机', '队友觉得你不太靠谱'],
  },
  {
    code: 'HAWK',
    name: '猎鹰之眼',
    dims: 'ASPR',
    legend: '密客',
    legendEN: 'Crypto',
    tagline: '看见你了，而你永远看不到我',
    color: '#06B6D4',
    description: '你是竞技场上最危险的猎手。你不会盲目冲锋——你会先看清战场全貌，找到敌人的弱点，然后一击致命。你是那种会提前绕后、卡好角度、算好伤害再开枪的玩家。独行是因为你相信自己的判断力，冒险是因为你的计划需要大胆执行。你的战斗不是赌博，而是精心设计的狩猎。每一颗子弹都有它的目的地。',
    strengths: ['出色的战场预判能力', '独自行动时效率极高', '善于发现并利用敌人的破绽'],
    weaknesses: ['计划被打乱时容易手忙脚乱', '过于自信有时反而是弱点', '团队配合不是你的强项'],
  },
  {
    code: 'EDGE',
    name: '刀锋行者',
    dims: 'ASPC',
    legend: '班加罗尔',
    legendEN: 'Bangalore',
    tagline: '在刀尖上跳舞，从不失足',
    color: '#64748B',
    description: '你是竞技场上的精密机器。进攻性十足但绝不冒进，独立作战但每一步都有计算。你就像一把经过反复打磨的刀刃——锋利、精确、致命，但从不会伤到自己。你不需要队友的保护，也不需要运气的眷顾。你信赖的只有自己的判断和技术。你是那种能在枪林弹雨中冷静分析局势、做出最优选择的人。别人说你冷血，你说这叫专业。',
    strengths: ['极度稳定的发挥', '冷静分析局势的能力', '很少犯低级错误'],
    weaknesses: ['过于理性可能错失机会', '不太愿意配合队友的冒险计划', '被认为太"独"'],
  },
  {
    code: 'RUSH',
    name: '突击先锋',
    dims: 'ATIR',
    legend: '动力小子',
    legendEN: 'Octane',
    tagline: '等待是弱者的事，冲就完了',
    color: '#22C55E',
    description: '你是每支队伍都想要（又害怕拥有）的那个人——永远的第一个冲进去的人。你不是不在乎队友，恰恰相反，你冲锋就是为了给队伍打开局面。只是你的行动速度永远比沟通快那么一拍。"我上了！""等等我还没——""已经倒了两个，快来补！"这可能是你最常见的对话模式。你相信气势和速度可以碾压一切犹豫。',
    strengths: ['极强的突破能力和节奏带动', '敢于在关键时刻第一个上', '团队因你而充满激情'],
    weaknesses: ['经常比队友快太多导致脱节', '有时候冲得太快变成送人头', '不太擅长等待和苟'],
  },
  {
    code: 'BOLT',
    name: '闪电战术',
    dims: 'ATIC',
    legend: '探路者',
    legendEN: 'Pathfinder',
    tagline: '快如闪电，稳如磐石',
    color: '#3B82F6',
    description: '你是团队中最可靠的战斗核心。你有着进攻型玩家的果断和反应力，但比大多数激进玩家多了一份团队意识和稳定性。你不会盲目冲锋，但该出手时绝不犹豫。你的战斗风格像闪电——迅速、精准、而且总是在正确的时机出现在正确的位置。队友可以放心把后背交给你，因为你既能打又能撑，是团队最值得信赖的战斗伙伴。',
    strengths: ['攻守平衡的战斗力', '优秀的团队配合意识', '关键时刻不掉链子'],
    weaknesses: ['有时太稳反而不够爆', '在极端局面下可能缺少那股"疯劲"', '偶尔会被更激进的队友带偏节奏'],
  },
  {
    code: 'LEAD',
    name: '风暴指挥',
    dims: 'ATPR',
    legend: '瓦尔基里',
    legendEN: 'Valkyrie',
    tagline: '跟我冲，我有计划',
    color: '#F59E0B',
    description: '你天生就是竞技场的指挥官。你不仅敢打，更重要的是你知道什么时候打、怎么打、打完之后去哪里。你是那种会在战斗前就喊出"我们从左边绕，你架枪掩护，他丢烟"的人。进攻性十足的你从不满足于被动防守——最好的防守就是把敌人打到没有还手之力。你敢于承担风险，因为你相信你的计划能应对一切。队友跟着你有安全感，即使是往火坑里跳。',
    strengths: ['出色的团队指挥和战术规划', '在混乱中保持清醒头脑', '让队伍的战斗力成倍提升'],
    weaknesses: ['有时候过于强势不听别人意见', '计划太多可能错过时机', '当队友不配合时会非常焦虑'],
  },
  {
    code: 'WALL',
    name: '铁壁统帅',
    dims: 'ATPC',
    legend: '直布罗陀',
    legendEN: 'Gibraltar',
    tagline: '在我身后，你们是安全的',
    color: '#F97316',
    description: '你是竞技场里最让人安心的存在。进攻型的你有着充足的战斗力，但你从不会让激情冲昏头脑。你是那种会在冲锋前确认所有人都准备好、战斗中不忘给队友报点掩护、结束后还会指挥大家赶紧换甲前进的人。你的字典里没有"莽"字，只有"稳步推进"。你可能不是杀敌最多的人，但你一定是让队伍活到最后的关键人物。有你在的队伍，永远不会崩盘。',
    strengths: ['极强的团队凝聚力', '稳如泰山的心态', '让队伍发挥远超个人实力之和'],
    weaknesses: ['过于谨慎可能导致打不出伤害', '遇到极端压力时决策变慢', '很难适应队友的莽夫打法'],
  },
  {
    code: 'LOOT',
    name: '搜刮行者',
    dims: 'DSIR',
    legend: '罗芭',
    legendEN: 'Loba',
    tagline: '装备到位方可出击…但总觉得还差一点',
    color: '#EC4899',
    description: '你对竞技场有着独特的理解——装备就是一切。在你看来，拿着白甲冲锋不是勇敢，而是愚蠢。你是那种会把每个物资点搜到干净、背包里永远塞满消耗品、看到金甲两眼放光的玩家。你不是不会打，只是你觉得先装备满了再打效率更高。虽然你经常被队友催"快走啦别搜了"，但当你一身金装站在战场上时，所有人都知道谁才是真正的赢家。',
    strengths: ['装备管理达人，总是全队最肥', '对地图物资分布了如指掌', '全副武装时战斗力爆表'],
    weaknesses: ['搜物资的时间可能让队伍失去时机', '过于执着于装备会忽略局势', '经常在搜包时被偷袭'],
  },
  {
    code: 'MIST',
    name: '迷雾幽灵',
    dims: 'DSIC',
    legend: '变幻',
    legendEN: 'Alter',
    tagline: '你永远不知道我在哪',
    color: '#6366F1',
    description: '你是竞技场里最难被抓到的存在。你不喜欢正面硬刚，也不依赖队友——你更喜欢像一缕迷雾一样，在敌人察觉不到的地方悄然移动。你的生存本能极强，几乎不会把自己置于危险之中。你不是怯懦，而是深谙"活着才能赢"的道理。你擅长在混乱中找到安全的缝隙，在所有人厮杀时默默存活。等硝烟散去，你还站着——这就够了。',
    strengths: ['极强的生存能力和走位意识', '几乎不会被围杀', '总能活到决赛圈'],
    weaknesses: ['输出贡献可能不足', '队友觉得你不太参与战斗', '遇到被针对时缺乏反击能力'],
  },
  {
    code: 'HUNT',
    name: '暗影猎手',
    dims: 'DSPR',
    legend: '寻血猎犬',
    legendEN: 'Bloodhound',
    tagline: '猎物总会露出破绽',
    color: '#DC2626',
    description: '你是竞技场里最有耐心的猎手。你不会像 APEX 型那样见人就冲，而是先观察、分析、等待——等到猎物露出最大的破绽，然后一击毙命。你喜欢独自行动，因为团队会打乱你的狩猎节奏。你敢于冒险，但只在你认为值得的时候。你的每一次出手都经过深思熟虑，每一次转移都有明确目的。你是竞技场的影子杀手——看不见，但致命。',
    strengths: ['极高的作战效率，一击一杀', '出色的耐心和时机把握', '独自行动时的战术水平很高'],
    weaknesses: ['节奏太慢可能被圈逼或三方', '不擅长混战中的即时反应', '队友经常不知道你在哪'],
  },
  {
    code: 'SAFE',
    name: '安全区域',
    dims: 'DSPC',
    legend: '侵蚀',
    legendEN: 'Catalyst',
    tagline: '活着就是胜利',
    color: '#78716C',
    description: '你把"生存"二字刻在了 DNA 里。在你的游戏哲学中，活到最后比杀了多少人重要得多。你会选最安全的航线、搜最偏远的区域、走最稳妥的路线。你不冲锋、不冒险、不舔包——你只是安安静静地活着，然后在决赛圈用最好的装备和最冷静的心态收割胜利。别人嘲笑你是"苟王"，但你笑到了最后。排位分在你手里，永远只会涨不会跌。',
    strengths: ['排位场的终极赢家', '几乎不会打不必要的仗', '心态极其稳定'],
    weaknesses: ['游戏体验可能略显枯燥', '近战能力因为缺少锻炼而偏弱', '遇到专门搜边的队伍容易翻车'],
  },
  {
    code: 'HEAL',
    name: '战地天使',
    dims: 'DTIR',
    legend: '命脉',
    legendEN: 'Lifeline',
    tagline: '队友在，我就在',
    color: '#F472B6',
    description: '你是每支队伍都梦寐以求的那个人——永远把队友的安全放在第一位的守护者。当队友倒下时，你是第一个冲过去拉的人，哪怕要冒生命危险。你的直觉告诉你：只要队伍活着，就有翻盘的可能。你不是最能打的，但你是最能让队伍活下来的人。你的背包里永远有给队友准备的电池和医疗包，你的第一反应永远是"队友还好吗"而不是"敌人在哪"。',
    strengths: ['极强的团队守护意识', '关键时刻的救援直觉', '让队伍的容错率大大提升'],
    weaknesses: ['过于关注队友可能忽视自己', '在需要冷血取舍时会犹豫', '个人战斗力提升空间大'],
  },
  {
    code: 'SAGE',
    name: '战场贤者',
    dims: 'DTIC',
    legend: '沃特森',
    legendEN: 'Wattson',
    tagline: '冷静是最强的武器',
    color: '#2DD4BF',
    description: '你是竞技场上最冷静的头脑。当所有人因为突然的枪声而心跳加速时，你的呼吸还是那么平稳。你不靠肾上腺素打游戏，你靠的是沉着冷静的判断力。你会在最混乱的局面中找到最安全的角落，用最小的代价帮助队伍度过危机。你不追求击杀数，不追求刺激感——你追求的是每一场游戏都能让队伍稳稳地走到最后。你是暴风雨中的灯塔，是队伍永远的定海神针。',
    strengths: ['极度冷静不会慌乱', '优秀的防守和支援能力', '心态稳定让队伍不会崩'],
    weaknesses: ['过于被动可能错失进攻机会', '极端局面下可能显得优柔寡断', '个人carry能力有限'],
  },
  {
    code: 'KING',
    name: '棋局掌控',
    dims: 'DTPR',
    legend: '地平线',
    legendEN: 'Horizon',
    tagline: '竞技场就是我的棋盘',
    color: '#8B5CF6',
    description: '你是竞技场的终极策略大师。在你眼中，每一场游戏都是一盘棋，而你就是那个下棋的人。你能看到大多数人看不到的全局——圈会刷在哪、敌人会从哪来、什么时候该打什么时候该跑。你是团队的大脑，你的队友们可能在打，但是方向是你定的。你敢于在关键时刻做出大胆的决定——绕后、卡毒、阴人——因为你的计划里已经考虑了所有变量。',
    strengths: ['顶级的全局观和战术规划', '团队决策能力极强', '善于在劣势中找到翻盘点'],
    weaknesses: ['当计划全部被打乱时可能陷入混乱', '有时过于依赖计划忽视即时反应', '可能因为想太多而行动迟缓'],
  },
  {
    code: 'FORT',
    name: '堡垒守护',
    dims: 'DTPC',
    legend: '纽卡斯尔',
    legendEN: 'Newcastle',
    tagline: '任凭风暴肆虐，堡垒岿然不动',
    color: '#0EA5E9',
    description: '你是竞技场上最坚不可摧的存在。你的字典里没有"莽"和"冲"——你信奉的是绝对的团队配合和滴水不漏的防守。你会在最好的地形上筑起堡垒，让队友在你的保护下安全输出。你的每一步移动都经过计算，每一个决策都考虑了队伍的安全。你可能不是最亮眼的那个人，但你是让整支队伍变成钢铁堡垒的核心。有你在，队伍就像有了一面永远不会倒下的盾牌。',
    strengths: ['团队防守的终极大师', '极其稳定可靠的队友', '排位分的永动机'],
    weaknesses: ['进攻性不足可能被强队碾压', '遇到快节奏打法时适应困难', '过于保守可能让队伍丧失主动权'],
  },
];

// 维度中文名和说明
export const DIMENSIONS = {
  combat:   { name: '战斗本能', high: '激进 (A)', low: '防守 (D)', highDesc: '你闻到硝烟就兴奋，见面就干是你的信条', lowDesc: '三思而后行，不到万不得已不会先开枪' },
  coop:     { name: '团队意识', high: '团队 (T)', low: '独行 (S)', highDesc: '你相信团队的力量大于个人', lowDesc: '你更信赖自己的判断和操作' },
  strategy: { name: '战术思维', high: '谋略 (P)', low: '直觉 (I)', highDesc: '你习惯提前规划每一步行动', lowDesc: '你更喜欢跟着感觉走，见招拆招' },
  risk:     { name: '风险偏好', high: '冒险 (R)', low: '稳健 (C)', highDesc: '高风险高回报是你的座右铭', lowDesc: '稳稳当当活到最后才是硬道理' },
};

// 根据四维度分数计算人格类型
export function calcPersonality(scores) {
  const c = scores.combat >= 50 ? 'A' : 'D';
  const o = scores.coop >= 50 ? 'T' : 'S';
  const s = scores.strategy >= 50 ? 'P' : 'I';
  const r = scores.risk >= 50 ? 'R' : 'C';
  const dims = c + o + s + r;
  return PERSONALITIES.find(p => p.dims === dims) || PERSONALITIES[0];
}
