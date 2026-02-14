<template>
  <div class="course-card-page">
    <section class="course-card course-card--primary">
      <div class="course-card__shell">
        <div class="course-card__meta-row">
          <span class="course-card__pill">专业核心</span>
          <span class="course-card__pill course-card__pill--soft">平台课（2025级起转选修）</span>
        </div>
        <p class="course-card__section-label">基本信息</p>
        <p class="course-card__headline">操作系统</p>
        <p class="course-card__text">
          操作系统是一门<strong>计算机类专业的核心平台课程</strong>，系统讲授操作系统在计算机系统中的地位、作用及其设计与实现思想。课程围绕
          <strong>进程管理、内存管理、文件系统与设备管理</strong>
          等核心模块，讲解操作系统如何在硬件之上为应用程序与用户提供高效、可靠的运行环境，并通过实验训练学生理解并实现操作系统关键机制，培养系统级编程与复杂系统分析能力。
        </p>
        <ul class="course-card__stats">
          <li>
            <span class="label">课程类型</span>
            <span class="value">平台</span>
          </li>
          <li>
            <span class="label">学分</span>
            <span class="value">4 学分</span>
          </li>
          <li class="course-card__stats-item--wide">
            <span class="label">考核方式</span>
            <span class="value">Lab 30% · 平时 10% · 期末考试 60%</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="course-card">
      <div class="course-card__shell">
        <p class="course-card__section-label">课程资料区</p>
        <div class="course-card__resource-row">
          <p class="course-card__resource-text">课程资料库（课件、实验说明、往年试卷、复习资料等）</p>
          <a
            class="course-card__button course-card__button--repo"
            href="https://github.com/NJUIS-Students/Resources/tree/main/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F"
            target="_blank"
            rel="noreferrer"
          >
            打开 repo
          </a>
        </div>

        <p class="course-card__subsection">课程教材</p>
        <ul class="course-card__list">
          <li><em>Operating Systems: Three Easy Pieces</em></li>
          <li>Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau</li>
          <li>CreateSpace Independent Publishing Platform, 2018.09（使用非马工程教材）</li>
        </ul>

        <p class="course-card__alert">操作系统课程的实验与期末考试是<strong>两条并行主线</strong>，实验偏实现与理解，考试偏分析与计算，二者侧重点不同，需分别准备。</p>
      </div>
    </section>

    <section class="course-card">
      <div class="course-card__shell">
        <p class="course-card__section-label">经验分享区</p>
        <div class="course-card__experience-grid">
          <article class="course-card__panel">
            <p class="course-card__subsection">课程定位评价</p>
            <p class="course-card__text course-card__text--compact">操作系统是一门理论与实践并重的课程，对计算机系统理解要求较高。实验实现压力较大，但期末考试规律性强。只要实验按部就班推进、期末以刷往年卷为主进行复习，成绩具有较强的可预期性。综合难度<strong>偏大</strong>。</p>
          </article>

          <article class="course-card__panel">
            <p class="course-card__subsection">Lab 反馈</p>
            <ul class="course-card__list">
              <li>
                Lab 难度整体偏高，实现过程较为复杂，尤其是涉及：
                <ul class="course-card__sublist">
                  <li>内核代码阅读与理解</li>
                  <li>多模块之间的逻辑关联</li>
                  <li>边界条件与异常情况处理</li>
                </ul>
              </li>
              <li>实验过程中容易出现“能跑但不全对”“局部正确但整体失败”的情况，需要耐心调试。</li>
              <li>
                建议：
                <ul class="course-card__sublist">
                  <li>尽量提前开始实验，避免集中到 ddl 前</li>
                  <li>多画结构图，理清数据结构与控制流</li>
                  <li>
                    可参考已有实现思路进行理解与对照（如：
                    <a href="https://byml-c.github.io/categories/OS/1.html" target="_blank" rel="noreferrer">byml-Lab 思路</a>
                    ），但需自行完成代码实现
                  </li>
                </ul>
              </li>
            </ul>
          </article>

          <article class="course-card__panel">
            <p class="course-card__subsection">考试情报</p>
            <ul class="course-card__list">
              <li>期末考试题型、考点与往年试卷<strong>高度相似</strong>。</li>
              <li>
                重点模块基本稳定，历年反复考察：
                <ul class="course-card__sublist">
                  <li>进程调度（FCFS / SJF / RR / 优先级 / MLFQ）</li>
                  <li>请求分页与页面置换（页表结构、多级页表、缺页异常、LRU/NFU/Aging）</li>
                  <li>死锁与银行家算法</li>
                  <li>进程管理与系统调用（fork / exec / wait / pipe / I/O 重定向）</li>
                  <li>文件系统结构（inode、open、link、索引计算）</li>
                </ul>
              </li>
              <li>题目以<strong>计算题 + 分析题</strong>为主，需要熟练手算与流程分析能力。</li>
            </ul>
          </article>

          <article class="course-card__panel">
            <p class="course-card__subsection">高分策略</p>
            <ul class="course-card__list">
              <li><strong>刷往年试卷是期末复习的核心</strong>，建议按模块系统性刷题，而非零散做题。</li>
              <li>
                对常见计算与流程题做到：
                <ul class="course-card__sublist">
                  <li>能快速画图</li>
                  <li>能清楚写出每一步的依据</li>
                  <li>能解释算法选择的理由与效果</li>
                </ul>
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
