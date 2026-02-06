<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=220&text=NJUIS%20Students%20Wiki&fontAlign=50&fontAlignY=40&color=0:0ea5e9,100:22c55e&fontColor=ffffff&animation=fadeIn" alt="banner" />

  <h1>NJUIS-Students.github.io</h1>

  <p>
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=900&center=true&vCenter=true&width=600&lines=%E6%99%BA%E7%A7%91%E5%85%A8%E5%AE%B6%E6%A1%B6+%7C+NJUIS+%E6%B0%91%E9%97%B4+Wiki;%E8%B5%84%E6%BA%90%E5%85%B1%E4%BA%AB%E3%80%81%E7%BB%8F%E9%AA%8C%E6%B2%89%E6%B7%80%E3%80%81%E6%8C%81%E7%BB%AD%E6%9B%B4%E6%96%B0" alt="typing" />
  </p>

  <p>
    <a href="https://github.com/NJUIS-Students/NJUIS-Students.github.io/actions/workflows/deploy.yml">
      <img src="https://img.shields.io/github/actions/workflow/status/NJUIS-Students/NJUIS-Students.github.io/deploy.yml?style=for-the-badge&label=Deploy" alt="deploy" />
    </a>
    <img src="https://img.shields.io/badge/VitePress-2.0-blue?style=for-the-badge&logo=vite" alt="vitepress" />
    <img src="https://img.shields.io/badge/Docs-Community%20Driven-16a34a?style=for-the-badge" alt="community" />
  </p>
</div>

> 一个面向南京大学智能科学与技术学院的民间 Wiki，聚合课程资料、学习路线与经验文章，帮助后来者少走弯路。

## 目录速览

| 模块 | 说明 | 入口 |
| --- | --- | --- |
| 博客内容 | 学习经验、课程总结、方向入门 | [`docs/`](./docs) |
| 本地开发 | 快速启动文档站点 | `npm run docs:dev` |

## 为什么这个仓库值得 Star

- `资源沉淀`：把历届同学零散资料变成可检索、可维护的知识库。
- `协作共建`：任何同学都可以通过 PR 增补内容、纠错和优化结构。
- `持续演进`：站点基于 VitePress，支持快速迭代与规范化发布。

## 快速开始

```bash
# 1) 安装依赖
npm install

# 2) 本地开发
npm run docs:dev

# 3) 构建产物
npm run docs:build

# 4) 本地预览构建结果
npm run docs:preview
```

## 前端风格代码

下面这段是适合放在页面中的“霓虹按钮”示例，便于你继续打造统一视觉风格：

```html
<button class="neo-btn">Explore NJUIS Wiki</button>

<style>
  .neo-btn {
    padding: 12px 24px;
    border: 0;
    border-radius: 999px;
    color: #ffffff;
    font-weight: 700;
    letter-spacing: 0.4px;
    background: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%);
    box-shadow:
      0 10px 24px rgba(14, 165, 233, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.35);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    cursor: pointer;
  }

  .neo-btn:hover {
    transform: translateY(-2px);
    box-shadow:
      0 16px 28px rgba(34, 197, 94, 0.35),
      0 0 0 3px rgba(14, 165, 233, 0.22);
  }
</style>
```

## 推荐贡献流程

1. Fork 本仓库并创建分支。
2. 在 `docs/` 下新增或修改内容。
3. 本地运行 `npm run docs:dev` 检查展示效果。
4. 提交 PR，描述改动目的与影响范围。

## 相关链接

- 项目仓库：[NJUIS-Students.github.io](https://github.com/NJUIS-Students/NJUIS-Students.github.io)
- 资源仓库：[NJUIS-Students/Resources](https://github.com/NJUIS-Students/Resources)

<div align="center">
  <sub>Built with VitePress · Maintained by NJUIS students</sub>
</div>
