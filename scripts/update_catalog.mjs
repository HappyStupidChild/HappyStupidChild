import { readFile, writeFile } from "node:fs/promises";

const owner = process.env.GITHUB_REPOSITORY_OWNER || "HappyStupidChild";
const token = process.env.GITHUB_TOKEN || "";
const apiHeaders = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": `${owner}-profile-catalog`,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

const categories = [
  {
    name: "AI 智能体与开发工具",
    icon: "🤖",
    examples: "LangChain、OpenCode、OpenClaw、Agent Skills",
  },
  {
    name: "大模型、RAG 与生成式 AI",
    icon: "🧠",
    examples: "DeepSeek、RAG-Anything、Open WebUI",
  },
  {
    name: "计算机视觉与模型部署",
    icon: "👁️",
    examples: "YOLO、PaddleDetection、MNN、LiteRT",
  },
  {
    name: "数据集、论文与科研资料",
    icon: "📚",
    examples: "数据集、科研代码、论文与调优手册",
  },
  {
    name: "Android 与移动生态",
    icon: "📱",
    examples: "Shizuku、GKD、ADB、QtScrcpy",
  },
  {
    name: "网络代理、下载与自托管",
    icon: "🌐",
    examples: "Clash、v2ray、aria2、自托管服务",
  },
  {
    name: "Windows、系统与运维脚本",
    icon: "🖥️",
    examples: "Windows 脚本、ViVe、重装与运维工具",
  },
  {
    name: "自动化、爬虫与效率工具",
    icon: "⚙️",
    examples: "EasySpider、CLI、下载与归档自动化",
  },
  {
    name: "编程学习、设计与资源导航",
    icon: "🧩",
    examples: "Build Your Own X、设计与学习资源",
  },
  {
    name: "其他工具与兴趣项目",
    icon: "🎲",
    examples: "数据分析与实验性项目",
  },
];

const exceptions = new Map(Object.entries({
  "opendatalab/OHR-Bench": "数据集、论文与科研资料",
  "google-ai-edge/litert-torch": "计算机视觉与模型部署",
  "alibaba/MNN": "计算机视觉与模型部署",
  "jiarandiana0307/patch-edge-copilot": "Windows、系统与运维脚本",
  "namecallfilter/tiktokmodcloud": "自动化、爬虫与效率工具",
  "LewisGu/CSDNDownloader": "自动化、爬虫与效率工具",
  "bigintpro/csdn_downloader": "自动化、爬虫与效率工具",
  "winner158/SmartExpress": "数据集、论文与科研资料",
  "CUMT-AIPR-Lab/CUMT-AIPR-Lab": "数据集、论文与科研资料",
  "mit-acl/cadrl_ros": "数据集、论文与科研资料",
  "remember17/WHDebugTool": "Android 与移动生态",
  "camenduru/text2video-zero-colab": "大模型、RAG 与生成式 AI",
  "OptimalScale/DetGPT": "计算机视觉与模型部署",
  "zp19990818/tudui-pytorch": "编程学习、设计与资源导航",
  "unclecode/crawl4ai": "AI 智能体与开发工具",
  "ssm0801/ScriptAllTheThings": "自动化、爬虫与效率工具",
}));

function searchable(repo) {
  return [
    repo.full_name,
    repo.language,
    ...(repo.topics || []),
    repo.description,
  ].filter(Boolean).join(" ").toLowerCase();
}

function classifyStar(repo) {
  if (exceptions.has(repo.full_name)) return exceptions.get(repo.full_name);
  const text = searchable(repo);

  if (/(agent|agentic|claude|codex|opencode|skill|langgraph|langchain|openclaw|autogpt|jarvis|browser-use|warp|terminal-first|paperclip|superpowers|spec-driven|autoresearch)/.test(text)) return categories[0].name;
  if (/(llm|large.language|rag|chatgpt|deepseek|openai|ollama|prompt|text.to.video|generative|moss|bingai|bing gpt|chatall|langfuse|knowledge.base|weknora|open.webui)/.test(text)) return categories[1].name;
  if (/(yolo|object.detection|paddledetection|computer.vision|image.segmentation|faceforensics|license.plate|fruit.detection|ocr|ncnn|pruning|distillation|rt-detr|rotated|polygon|fire.smoke|crop|weed|insects|traffic.accident|kidney|tumor|fish|underwater|visual.emotion|defect.segmentation)/.test(text)) return categories[2].name;
  if (/(dataset|benchmark|paper|tutorial about machine|deep.learning.notebook|medical.nlp|rumor|ofdm|gpr|networkmodeling|tuning.playbook|cvpr|practice.in.paddle|neural.network|vasp|core50|cmedqa|diseases.detection|cnn-lstm)/.test(text)) return categories[3].name;
  if (/(android|adb|shizuku|kotlin|phone.agent|sim.card|scrcpy|mirai|qq)/.test(text)) return categories[4].name;
  if (/(proxy|v2ray|clash|vpn|aria2|download|self.hosted|selfhosted|network service|vnc|carrotvpn|go-proxy)/.test(text)) return categories[5].name;
  if (/(windows|kms|activation|reinstall|linux.distribution|driver|vivetool|vps|shell.script|batchfile|office|system APIs)/.test(text)) return categories[6].name;
  if (/(crawler|scraper|spider|automation|rpa|scriptall|csdn|tiktok|workflow|browser.extension|debug.tool|speed.modifier)/.test(text)) return categories[7].name;
  if (/(awesome|learn|tutorial|guide|design|ppt|presentation|build.your.own|resource|free.chatgpt|coding.cn|coder2gwy|tips|repository$)/.test(text)) return categories[8].name;
  return categories[9].name;
}

function classifyRepo(repo) {
  const repoExceptions = {
    skillhub: "AI、智能体与研究",
    "claw-code": "AI、智能体与研究",
    "claw-code-parity": "AI、智能体与研究",
    "Deep_Learning-Notebook": "AI、智能体与研究",
    "iflow-cli": "AI、智能体与研究",
    gkd: "Android 与移动生态",
    Nrfr: "Android 与移动生态",
    Shizuku: "Android 与移动生态",
    v2rayNG: "Android 与移动生态",
    FlClash: "网络、代理与下载",
    v2rayN: "网络、代理与下载",
    "clash-verge-rev": "网络、代理与下载",
    "aria2.sh": "网络、代理与下载",
    "Aria2-Explorer": "网络、代理与下载",
    "patch-edge-copilot": "Windows、运维与自动化",
    "Windows-Scripts": "Windows、运维与自动化",
    reinstall: "Windows、运维与自动化",
    HEU_KMS_Activator: "Windows、运维与自动化",
    tiktokmodcloud: "Windows、运维与自动化",
  };
  if (repoExceptions[repo.name]) return repoExceptions[repo.name];
  const text = searchable(repo);
  if (/(android|kotlin|shizuku|gkd|sim.card|v2rayng)/.test(text)) return "Android 与移动生态";
  if (/(proxy|v2ray|clash|aria2|download)/.test(text)) return "网络、代理与下载";
  if (/(agent|\bai\b|claude|claw|codex|skill|deep.learning|iflow)/.test(text)) return "AI、智能体与研究";
  return "Windows、运维与自动化";
}

async function fetchAll(path) {
  const all = [];
  for (let page = 1; ; page += 1) {
    const separator = path.includes("?") ? "&" : "?";
    const url = `https://api.github.com${path}${separator}per_page=100&page=${page}`;
    const response = await fetch(url, { headers: apiHeaders });
    if (!response.ok) throw new Error(`GitHub API ${response.status}: ${url}`);
    const batch = await response.json();
    all.push(...batch);
    if (batch.length < 100) return all;
  }
}

function repoLink(repo) {
  const label = repo.name.replaceAll("_", " ").replaceAll("-", " ");
  return `<a href="${repo.html_url}"><code>${label}</code></a>`;
}

function renderRepoCell(title, repos) {
  return `    <td width="50%" valign="top">
      <h3>${title}</h3>
      <p>${repos.map(repoLink).join("\n        &nbsp;·&nbsp;\n        ")}</p>
    </td>`;
}

function renderRadar(repos, stars, groupedStars) {
  const functionalRepos = repos.filter((repo) => repo.name !== owner);
  const repoGroups = new Map([
    ["AI、智能体与研究", []],
    ["Android 与移动生态", []],
    ["网络、代理与下载", []],
    ["Windows、运维与自动化", []],
  ]);
  for (const repo of functionalRepos) repoGroups.get(classifyRepo(repo)).push(repo);

  const forkCount = repos.filter((repo) => repo.fork).length;
  const tableRows = [
    ["🤖 AI、智能体与研究", "📱 Android 与移动生态"],
    ["🌐 网络、代理与下载", "🖥️ Windows、运维与自动化"],
  ];
  const groupNames = [...repoGroups.keys()];

  const repoTable = `<table>
  <tr>
${renderRepoCell(tableRows[0][0], repoGroups.get(groupNames[0]))}
${renderRepoCell(tableRows[0][1], repoGroups.get(groupNames[1]))}
  </tr>
  <tr>
${renderRepoCell(tableRows[1][0], repoGroups.get(groupNames[2]))}
${renderRepoCell(tableRows[1][1], repoGroups.get(groupNames[3]))}
  </tr>
</table>`;

  const distribution = categories.map((category) =>
    `| ${category.icon} ${category.name} | ${groupedStars.get(category.name).length} | ${category.examples} |`
  ).join("\n");

  return `<div align="center">

[![公开仓库](https://img.shields.io/badge/公开仓库-${repos.length}-181717?style=flat-square&logo=github)](https://github.com/${owner}?tab=repositories)
[![Fork](https://img.shields.io/badge/Fork-${forkCount}-2563EB?style=flat-square&logo=git)](https://github.com/${owner}?tab=repositories&type=fork)
[![Star 收藏](https://img.shields.io/badge/Star_收藏-${stars.length}-FFB000?style=flat-square&logo=githubsponsors)](https://github.com/${owner}?tab=stars)
[![兴趣分类](https://img.shields.io/badge/兴趣分类-${categories.length}-7C3AED?style=flat-square&logo=radar)](./STAR-CATALOG.md)

</div>

### 我的仓库地图

${repoTable}

### Star 兴趣分布

| 分类 | 数量 | 代表项目 |
| --- | ---: | --- |
${distribution}

<div align="center">
  <a href="./STAR-CATALOG.md"><strong>查看 ${stars.length} 个 Star 的完整分类目录 →</strong></a>
</div>

> 本区域由 GitHub Actions 自动维护。分类按项目的主要用途归档，具有交叉属性的项目只放入一个主分类。我的 ${forkCount} 个功能仓库均为 Fork，版权与成果属于原作者和贡献者。`;
}

function renderCatalog(stars, groupedStars) {
  const details = categories.map((category) => {
    const items = groupedStars.get(category.name)
      .map((repo) => `- [${repo.full_name}](${repo.html_url})`)
      .join("\n");
    return `<details>
<summary><strong>${category.name}</strong> · ${groupedStars.get(category.name).length} 个</summary>

${items}

</details>`;
  }).join("\n\n");

  return `# ⭐ Star 收藏分类目录

这是对 [HappyStupidChild 的全部 Star](https://github.com/${owner}?tab=stars) 所做的自动分类目录。

- Star 总数：${stars.length}
- 分类数量：${categories.length}
- 分类原则：按项目的主要用途归档；具有交叉属性的项目只放入一个主分类
- 维护方式：GitHub Actions 每日自动检查并更新

[← 返回个人主页](./README.md)

${details}

---

[← 返回个人主页](./README.md)
`;
}

function replaceGeneratedBlock(readme, generated) {
  const start = "<!-- AUTO:RADAR:START -->";
  const end = "<!-- AUTO:RADAR:END -->";
  const startIndex = readme.indexOf(start);
  const endIndex = readme.indexOf(end);
  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
    throw new Error("README 自动更新标记缺失或顺序错误");
  }
  return `${readme.slice(0, startIndex + start.length)}\n${generated}\n${readme.slice(endIndex)}`;
}

const [repos, stars] = await Promise.all([
  fetchAll(`/users/${owner}/repos?sort=updated&type=owner`),
  fetchAll(`/users/${owner}/starred?sort=created&direction=desc`),
]);

const groupedStars = new Map(categories.map((category) => [category.name, []]));
for (const repo of stars) groupedStars.get(classifyStar(repo)).push(repo);

const readme = await readFile("README.md", "utf8");
await writeFile("README.md", replaceGeneratedBlock(readme, renderRadar(repos, stars, groupedStars)));
await writeFile("STAR-CATALOG.md", renderCatalog(stars, groupedStars));

console.log(`已处理 ${repos.length} 个仓库、${stars.length} 个 Star。`);
