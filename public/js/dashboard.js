/**
 * DocuGovern Enterprise - Dashboard Interactive Analytics
 * Zero-dependency pure SVG chart rendering & animated metrics
 */

document.addEventListener('DOMContentLoaded', () => {
  initStatCounters();
  renderDonutChart();
  renderMonthlyBarChart();
});

// Animate numbers counting up on load
function initStatCounters() {
  const statElements = document.querySelectorAll('.stat-value[data-count]');
  statElements.forEach((el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;

    let current = 0;
    const duration = 1200;
    const increment = Math.max(1, Math.ceil(target / (duration / 25)));

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current.toLocaleString();
    }, 25);
  });
}

// Render dynamic pure SVG Donut Chart
function renderDonutChart() {
  const container = document.getElementById('categoryDonutChart');
  if (!container) return;

  // Read data from container attribute or defaults
  let data = [];
  try {
    data = JSON.parse(container.getAttribute('data-series')) || [];
  } catch (e) {
    data = [
      { name: 'Compliance & Legal', count: 42, color: '#0ea5e9' },
      { name: 'Board Resolutions', count: 28, color: '#6366f1' },
      { name: 'Financial Audits', count: 24, color: '#10b981' },
      { name: 'Human Resources', count: 18, color: '#f59e0b' },
      { name: 'IT & Security Policy', count: 12, color: '#ec4899' }
    ];
  }

  const total = data.reduce((acc, curr) => acc + (curr.count || curr.docCount || 0), 0) || 1;
  const size = 200;
  const radius = 70;
  const strokeWidth = 26;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  let paths = '';

  data.forEach((item) => {
    const count = item.count || item.docCount || 0;
    const percentage = count / total;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += percentage * circumference;

    paths += `
      <circle
        cx="${center}"
        cy="${center}"
        r="${radius}"
        fill="transparent"
        stroke="${item.color || '#4f46e5'}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${strokeDasharray}"
        stroke-dashoffset="${strokeDashoffset}"
        style="transition: stroke-dasharray 1s ease, stroke-width 0.2s ease; cursor: pointer;"
        data-name="${item.name}"
        data-count="${count}"
      />
    `;
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" class="chart-svg" style="transform: rotate(-90deg); max-width: 190px;">
      ${paths}
    </svg>
    <div style="position: absolute; text-align: center; pointer-events: none;">
      <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-main); line-height: 1;">${total}</div>
      <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Total Docs</div>
    </div>
  `;
}

// Render dynamic Pure SVG Monthly Bar Chart (Submissions vs Approvals)
function renderMonthlyBarChart() {
  const container = document.getElementById('monthlyBarChart');
  if (!container) return;

  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const submitted = [42, 56, 68, 85, 92, 108];
  const approved = [36, 48, 59, 74, 82, 98];

  const maxVal = 120;
  const height = 180;
  const width = 360;
  const barWidth = 14;
  const gap = 38;
  const startX = 35;

  let barsSvg = '';
  months.forEach((month, idx) => {
    const x = startX + idx * (gap + 14);
    const subHeight = (submitted[idx] / maxVal) * 120;
    const appHeight = (approved[idx] / maxVal) * 120;
    const subY = height - 30 - subHeight;
    const appY = height - 30 - appHeight;

    barsSvg += `
      <!-- Submissions Bar -->
      <rect x="${x}" y="${subY}" width="${barWidth}" height="${subHeight}" rx="3" fill="#cbd5e1" opacity="0.8">
        <title>${month}: ${submitted[idx]} Submitted</title>
      </rect>
      <!-- Approvals Bar -->
      <rect x="${x + barWidth + 3}" y="${appY}" width="${barWidth}" height="${appHeight}" rx="3" fill="#4f46e5">
        <title>${month}: ${approved[idx]} Approved</title>
      </rect>
      <!-- Label -->
      <text x="${x + barWidth}" y="${height - 10}" font-size="11" fill="#64748b" text-anchor="middle" font-weight="600">${month}</text>
    `;
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" style="max-height: 200px;">
      <!-- Grid lines -->
      <line x1="20" y1="30" x2="${width - 10}" y2="30" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
      <line x1="20" y1="80" x2="${width - 10}" y2="80" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
      <line x1="20" y1="150" x2="${width - 10}" y2="150" stroke="#e2e8f0" stroke-width="1"/>
      ${barsSvg}
    </svg>
    <div style="display: flex; justify-content: center; gap: 1.5rem; margin-top: 0.5rem; font-size: 0.78rem;">
      <div style="display: flex; align-items: center; gap: 0.4rem;">
        <span style="width: 10px; height: 10px; background: #cbd5e1; border-radius: 2px;"></span>
        <span style="color: var(--text-muted);">Submitted</span>
      </div>
      <div style="display: flex; align-items: center; gap: 0.4rem;">
        <span style="width: 10px; height: 10px; background: #4f46e5; border-radius: 2px;"></span>
        <span style="font-weight: 600; color: var(--text-main);">Approved</span>
      </div>
    </div>
  `;
}

// Quick Review Modal Trigger
window.openApprovalModal = function(approvalId, docTitle, submitterName) {
  const modal = document.getElementById('quickApprovalModal');
  if (!modal) return;

  document.getElementById('modalDocTitle').textContent = docTitle;
  document.getElementById('modalSubmitter').textContent = submitterName;
  document.getElementById('quickApprovalForm').action = `/approvals/${approvalId}/process`;

  openModal('quickApprovalModal');
};
