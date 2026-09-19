/**
 * OM – AI Action Assistant
 * Progress Dashboard & Analytics Engine
 */

class OMDashboard {
  constructor() {
    this.init();
  }

  init() {
    this.updateMetrics();
  }

  updateMetrics() {
    const tasks = window.omPlanner ? window.omPlanner.tasks : [];
    const total = tasks.length;
    const achieved = tasks.filter(t => t.stage === 'achieve').length;
    const inAct = tasks.filter(t => t.stage === 'act').length;
    const inPlan = tasks.filter(t => t.stage === 'plan').length;
    const inThink = tasks.filter(t => t.stage === 'think').length;

    const completionRate = total > 0 ? Math.round((achieved / total) * 100) : 0;
    const velocityScore = (achieved * 25) + (inAct * 15) + (inPlan * 8) + (inThink * 4);

    // Update UI elements
    const rateEl = document.getElementById('stat-completion-rate');
    const velocityEl = document.getElementById('stat-velocity-score');
    const totalEl = document.getElementById('stat-total-actions');
    const activeEl = document.getElementById('stat-active-executing');

    if (rateEl) rateEl.innerText = `${completionRate}%`;
    if (velocityEl) velocityEl.innerText = `${velocityScore} pts`;
    if (totalEl) totalEl.innerText = total;
    if (activeEl) activeEl.innerText = inAct;

    this.renderStageBreakdown(inThink, inPlan, inAct, achieved, total);
    this.renderChart();
  }

  renderStageBreakdown(think, plan, act, achieve, total) {
    const barEl = document.getElementById('pipeline-stage-progress-bar');
    if (!barEl || total === 0) return;

    const pThink = (think / total) * 100;
    const pPlan = (plan / total) * 100;
    const pAct = (act / total) * 100;
    const pAchieve = (achieve / total) * 100;

    barEl.innerHTML = `
      <div style="width: ${pThink}%; background: #38bdf8; height: 8px; border-radius: 4px 0 0 4px;" title="Think: ${think}"></div>
      <div style="width: ${pPlan}%; background: #818cf8; height: 8px;" title="Plan: ${plan}"></div>
      <div style="width: ${pAct}%; background: #f59e0b; height: 8px;" title="Act: ${act}"></div>
      <div style="width: ${pAchieve}%; background: #10b981; height: 8px; border-radius: 0 4px 4px 0;" title="Achieve: ${achieve}"></div>
    `;
  }

  renderChart() {
    const chartContainer = document.getElementById('dashboard-burnup-chart');
    if (!chartContainer) return;

    // Sleek SVG Area / Vector Curve
    chartContainer.innerHTML = `
      <svg viewBox="0 0 500 160" width="100%" height="160" style="overflow: visible;">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <!-- Grid lines -->
        <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
        <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
        <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>

        <!-- Target Burnup Curve -->
        <path d="M 0 140 Q 125 110, 250 70 T 500 20 L 500 150 L 0 150 Z" fill="url(#chartGrad)"/>
        <path d="M 0 140 Q 125 110, 250 70 T 500 20" fill="none" stroke="#22d3ee" stroke-width="3" stroke-linecap="round"/>

        <!-- Milestone Markers -->
        <circle cx="125" cy="105" r="5" fill="#38bdf8" stroke="#0b1022" stroke-width="2"/>
        <circle cx="250" cy="70" r="5" fill="#818cf8" stroke="#0b1022" stroke-width="2"/>
        <circle cx="375" cy="42" r="5" fill="#f59e0b" stroke="#0b1022" stroke-width="2"/>
        <circle cx="500" cy="20" r="6" fill="#10b981" stroke="#0b1022" stroke-width="2"/>
      </svg>
      <div style="display: flex; justify-content: space-between; font-family: var(--om-font-mono); font-size: 0.72rem; color: var(--om-text-muted); margin-top: 6px;">
        <span>Stage 1: Think</span>
        <span>Stage 2: Plan</span>
        <span>Stage 3: Act</span>
        <span>Stage 4: Achieve</span>
      </div>
    `;
  }
}

window.omDashboard = null;
document.addEventListener('DOMContentLoaded', () => {
  window.omDashboard = new OMDashboard();
});
