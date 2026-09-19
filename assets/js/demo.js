/**
 * OM – AI Action Assistant
 * Interactive Demo Scenarios Loader
 */

const OM_DEMO_SCENARIOS = [
  {
    id: 'demo-saas',
    title: 'Launch AI SaaS MVP in 14 Days',
    tag: 'Startups & Product Engineering',
    desc: 'End-to-end execution pipeline from technical specification and database models to Stripe billing integration and v1 launch.',
    metrics: { time: '14 Days', actions: 6, velocity: '98 pts' },
    chatLog: [
      {
        sender: 'user',
        text: 'OM, decompose my goal: I want to build and launch an AI customer-insights SaaS MVP in 14 days with auth, billing, and LLM processing.'
      },
      {
        sender: 'om',
        text: `### 🎯 Action Plan: AI Customer Insights SaaS (14-Day Sprint)\n\nI have formulated and verified your end-to-end delivery framework following **Think. Plan. Act. Achieve.**\n\n#### 1. 💡 Think (Scope & Guardrails)\n- Lock MVP boundary: Single-tenant auth, 3 core prompt templates, Stripe checkout.\n- Metric: < 1.5s query latency, 100% test coverage on billing webhooks.\n\n#### 2. 📋 Plan (Architecture & Schemas)\n- Relational schema: Users, Teams, InsightRequests, UsageMeters.\n- API Contracts: OpenAPI 3.1 specification for inference proxy endpoints.\n\n#### 3. ⚡ Act (Sprint Implementation)\n- Days 1-5: Scaffold backend API, OAuth & JWT tokens.\n- Days 6-10: Connect inference engine and wire frontend dashboard.\n- Days 11-13: Stripe integration, test webhooks, staging deployment.\n\n#### 4. 🏆 Achieve (Release & Sign-off)\n- Run load tests, verify production secrets, point DNS, and publicly announce.`,
        reasoning: `1. Analyzed 14-day velocity constraint.\n2. Identified critical path: Stripe billing integration and API rate-limiting.\n3. Verified feasibility score: 96% with isolated frontend/backend modules.`,
        actions: [
          { stage: 'think', title: 'Define Core SaaS MVP Scope & Invariant Constraints', estimate: '1d' },
          { stage: 'think', title: 'Select Infrastructure, Database & Auth Provider', estimate: '1d' },
          { stage: 'plan', title: 'Draft Relational Schemas & OpenAPI Endpoint Contracts', estimate: '2d' },
          { stage: 'act', title: 'Implement Core LLM Ingestion Pipeline & Background Workers', estimate: '4d' },
          { stage: 'act', title: 'Build Billing Webhooks & Responsive Client Dashboard', estimate: '3d' },
          { stage: 'achieve', title: 'Run End-to-End Billing Tests, Benchmark & Deploy to Prod', estimate: '2d' }
        ]
      }
    ],
    tasks: [
      { title: 'Define Core SaaS MVP Scope & Invariant Constraints', stage: 'think', priority: 'high', estimate: '1d' },
      { title: 'Select Infrastructure, Database & Auth Provider', stage: 'think', priority: 'medium', estimate: '1d' },
      { title: 'Draft Relational Schemas & OpenAPI Endpoint Contracts', stage: 'plan', priority: 'high', estimate: '2d' },
      { title: 'Implement Core LLM Ingestion Pipeline & Background Workers', stage: 'act', priority: 'high', estimate: '4d' },
      { title: 'Build Billing Webhooks & Responsive Client Dashboard', stage: 'act', priority: 'medium', estimate: '3d' },
      { title: 'Run End-to-End Billing Tests, Benchmark & Deploy to Prod', stage: 'achieve', priority: 'high', estimate: '2d' }
    ]
  },
  {
    id: 'demo-infra',
    title: 'Cloud Cost & Performance Optimization',
    tag: 'DevOps & Cloud Infrastructure',
    desc: 'Cut multi-cloud compute and cluster expenditure by 42% while guaranteeing 99.99% service availability.',
    metrics: { time: '7 Days', actions: 5, velocity: '85 pts' },
    chatLog: [
      {
        sender: 'user',
        text: 'OM, help us audit our Kubernetes clusters and cloud infrastructure to eliminate waste and reduce spend by 40%.'
      },
      {
        sender: 'om',
        text: `### 🎯 Action Plan: Multi-Cloud Optimization Sprint\n\nI have structured an empirical optimization workflow designed to recover cloud spend without risking service reliability.\n\n#### 1. 💡 Think (Telemetry & Profiling)\n- Ingest cloud billing reports and cluster CPU/memory usage logs.\n- Identify idle nodes, unattached storage volumes, and over-provisioned pods.\n\n#### 2. 📋 Plan (Right-Sizing Strategy)\n- Design Karpenter autoscaler rules and Spot instance fallback pools.\n- Schedule automated dev/staging environment shutdown during off-peak hours.\n\n#### 3. ⚡ Act (Configuration & Migration)\n- Apply pod vertical autoscaling profiles across staging.\n- Prune orphaned EBS volumes and migrate dev clusters to Spot instances.\n\n#### 4. 🏆 Achieve (Verification & Financial Audit)\n- Confirm cluster stability under synthetic load; verify 42% cost reduction on daily billing run.`,
        reasoning: `1. Analyzed workload utilization metrics.\n2. Cross-referenced Spot instance interruption rates against SLA.\n3. Verified safety margin: Zero single-point-of-failure risk.`,
        actions: [
          { stage: 'think', title: 'Audit Multi-Region Cloud Spend & Idle Resource Footprint', estimate: '1d' },
          { stage: 'plan', title: 'Model Workload Right-Sizing & Spot Instance Topology', estimate: '1d' },
          { stage: 'act', title: 'Deploy Cluster Autoscalers & Off-Peak Shutdown Automation', estimate: '2d' },
          { stage: 'act', title: 'Prune Orphaned Disks & Optimize Data Egress Routes', estimate: '1d' },
          { stage: 'achieve', title: 'Validate 42% Monthly Savings on Cloud Billing Dashboard', estimate: '1d' }
        ]
      }
    ],
    tasks: [
      { title: 'Audit Multi-Region Cloud Spend & Idle Resource Footprint', stage: 'think', priority: 'high', estimate: '1d' },
      { title: 'Model Workload Right-Sizing & Spot Instance Topology', stage: 'plan', priority: 'medium', estimate: '1d' },
      { title: 'Deploy Cluster Autoscalers & Off-Peak Shutdown Automation', stage: 'act', priority: 'high', estimate: '2d' },
      { title: 'Prune Orphaned Disks & Optimize Data Egress Routes', stage: 'act', priority: 'medium', estimate: '1d' },
      { title: 'Validate 42% Monthly Savings on Cloud Billing Dashboard', stage: 'achieve', priority: 'high', estimate: '1d' }
    ]
  },
  {
    id: 'demo-content',
    title: 'Autonomous Technical Content Engine',
    tag: 'Growth & Developer Relations',
    desc: 'Orchestrate an automated technical content publication system delivering high-impact architectural studies and benchmark analyses.',
    metrics: { time: '10 Days', actions: 5, velocity: '78 pts' },
    chatLog: [
      {
        sender: 'user',
        text: 'OM, build an automated editorial and distribution workflow for technical engineering blog posts.'
      },
      {
        sender: 'om',
        text: `### 🎯 Action Plan: Engineering Content & Distribution Pipeline\n\nI have planned an autonomous research-to-publication engine tailored for developer audiences.\n\n#### 1. 💡 Think (Audience & Topic Discovery)\n- Analyze high-intent technical search queries and GitHub trending repositories.\n\n#### 2. 📋 Plan (Outlines & Peer-Review Milestones)\n- Create technical style guide, reproducible code sandbox templates, and verification checklist.\n\n#### 3. ⚡ Act (Drafting & Multi-Channel Syndication)\n- Write deep-dive architectural articles with runnable benchmarks.\n- Automate cross-posting to Dev.to, Hashnode, and LinkedIn via webhooks.\n\n#### 4. 🏆 Achieve (Reach & Conversion Sign-off)\n- Measure reader engagement, GitHub star attribution, and inbound signups.`,
        reasoning: `1. Evaluated developer acquisition channels.\n2. Identified priority: code reproducibility and benchmark credibility.\n3. Verified distribution automation mechanics.`,
        actions: [
          { stage: 'think', title: 'Research High-Intent Architectural Search Trends', estimate: '1d' },
          { stage: 'plan', title: 'Establish Editorial Standards & Code Sandbox Templates', estimate: '1d' },
          { stage: 'act', title: 'Draft Flagship Case Study on Distributed Systems', estimate: '3d' },
          { stage: 'act', title: 'Automate Syndication Scripts & Social Distribution', estimate: '2d' },
          { stage: 'achieve', title: 'Verify Traffic Analytics & Inbound Developer Signups', estimate: '1d' }
        ]
      }
    ],
    tasks: [
      { title: 'Research High-Intent Architectural Search Trends', stage: 'think', priority: 'medium', estimate: '1d' },
      { title: 'Establish Editorial Standards & Code Sandbox Templates', stage: 'plan', priority: 'medium', estimate: '1d' },
      { title: 'Draft Flagship Case Study on Distributed Systems', stage: 'act', priority: 'high', estimate: '3d' },
      { title: 'Automate Syndication Scripts & Social Distribution', stage: 'act', priority: 'medium', estimate: '2d' },
      { title: 'Verify Traffic Analytics & Inbound Developer Signups', stage: 'achieve', priority: 'high', estimate: '1d' }
    ]
  }
];

class OMDemo {
  constructor() {
    this.scenarios = OM_DEMO_SCENARIOS;
    this.init();
  }

  init() {
    this.renderScenarios();
  }

  renderScenarios() {
    const container = document.getElementById('demo-scenarios-container');
    if (!container) return;

    container.innerHTML = '';
    this.scenarios.forEach(sc => {
      const card = document.createElement('div');
      card.className = 'glass-panel scenario-card';
      card.innerHTML = `
        <div>
          <div class="scenario-tag">${sc.tag}</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 0.75rem;">${sc.title}</h3>
          <p style="font-size: 0.88rem; color: var(--om-text-secondary); line-height: 1.5;">${sc.desc}</p>
          
          <div class="scenario-metrics">
            <div>
              <div style="font-size: 1.1rem; font-weight: 700; color: #fff;">${sc.metrics.time}</div>
              <div style="font-size: 0.7rem; color: var(--om-text-muted);">Timeline</div>
            </div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--om-cyan);">${sc.metrics.actions}</div>
              <div style="font-size: 0.7rem; color: var(--om-text-muted);">Key Actions</div>
            </div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 700; color: #34d399;">${sc.metrics.velocity}</div>
              <div style="font-size: 0.7rem; color: var(--om-text-muted);">Action Velocity</div>
            </div>
          </div>
        </div>

        <button class="om-btn om-btn-primary" style="width: 100%; margin-top: 1rem;" onclick="omDemo.loadScenario('${sc.id}')">
          ⚡ Load Scenario into OM
        </button>
      `;
      container.appendChild(card);
    });
  }

  loadScenario(scenarioId) {
    const sc = this.scenarios.find(s => s.id === scenarioId);
    if (!sc) return;

    // Load Chat History
    if (window.omAssistant) {
      window.omAssistant.messages = sc.chatLog.map(item => ({
        sender: item.sender,
        text: item.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reasoning: item.reasoning,
        actions: item.actions || [],
        verified: true
      }));
      window.omAssistant.saveMessages();
      window.omAssistant.renderMessages();
    }

    // Load Tasks into Planner
    if (window.omPlanner) {
      window.omPlanner.tasks = sc.tasks.map((t, i) => ({
        id: `demo-${scenarioId}-${i}`,
        title: t.title,
        desc: `Loaded from demo scenario: ${sc.title}`,
        stage: t.stage,
        priority: t.priority,
        estimate: t.estimate,
        createdAt: new Date().toISOString()
      }));
      window.omPlanner.save();
      window.omPlanner.render();
    }

    if (window.omApp) {
      window.omApp.showToast(`Loaded "${sc.title}" into OM!`, 'success');
      window.omApp.recordActivity(`Loaded demo scenario: ${sc.title}`);
      window.omApp.switchView('assistant');
    }
  }
}

window.omDemo = null;
document.addEventListener('DOMContentLoaded', () => {
  window.omDemo = new OMDemo();
});
