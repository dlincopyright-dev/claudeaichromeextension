function chipClass(pct) {
  if (pct === null || pct === undefined) return 'chip-empty';
  if (pct >= 80) return 'chip-warn';
  if (pct >= 40) return 'chip-ok';
  return 'chip-low';
}
function chipLabel(pct) {
  if (pct === null || pct === undefined) return 'No data';
  if (pct >= 80) return 'Running low';
  if (pct >= 40) return 'Moderate use';
  return 'Plenty left';
}

function render(data) {
  document.getElementById('plan-label').textContent = data.plan || 'Team';

  const sp = data.sessionPct;
  document.getElementById('session-pct').textContent = (sp != null) ? sp + '%' : '—';
  document.getElementById('session-reset').textContent = data.sessionReset || '';
  document.getElementById('session-sub').textContent = (sp != null) ? `${sp}% of session used` : 'No data';
  setTimeout(() => { document.getElementById('fill-session').style.width = (sp || 0) + '%'; }, 80);
  const cs = document.getElementById('chip-session');
  cs.textContent = chipLabel(sp); cs.className = 'chip ' + chipClass(sp);

  const ap = data.allPct;
  document.getElementById('all-pct').textContent = (ap != null) ? ap + '%' : '—';
  setTimeout(() => { document.getElementById('fill-all').style.width = (ap || 0) + '%'; }, 120);
  const ca = document.getElementById('chip-all');
  ca.textContent = chipLabel(ap); ca.className = 'chip ' + chipClass(ap);

  const dp = data.designPct;
  document.getElementById('design-pct').textContent = (dp != null) ? dp + '%' : '—';
  setTimeout(() => { document.getElementById('fill-design').style.width = (dp || 0) + '%'; }, 160);
  const cd = document.getElementById('chip-design');
  cd.textContent = chipLabel(dp); cd.className = 'chip ' + chipClass(dp);

  if (data.routinesUsed !== undefined && data.routinesTotal !== undefined) {
    document.getElementById('routines-count').textContent = `${data.routinesUsed} / ${data.routinesTotal}`;
    document.getElementById('routines-sub').textContent = data.routinesUsed === 0
      ? 'No routines run yet' : `${data.routinesUsed} of ${data.routinesTotal} runs used`;
    const rPct = Math.round((data.routinesUsed / data.routinesTotal) * 100);
    setTimeout(() => { document.getElementById('fill-routines').style.width = rPct + '%'; }, 200);
    const cr = document.getElementById('chip-routines');
    cr.textContent = data.routinesUsed === 0 ? 'None used' : chipLabel(rPct);
    cr.className = 'chip ' + (data.routinesUsed === 0 ? 'chip-empty' : chipClass(rPct));
  }

  if (data.fetchedAt) {
    const ago = Math.round((Date.now() - data.fetchedAt) / 1000);
    const agoStr = ago < 60 ? 'just now' : Math.round(ago / 60) + ' min ago';
    document.getElementById('last-updated').textContent = 'Updated: ' + agoStr;
  } else {
    document.getElementById('last-updated').textContent = 'Updated: ' + (data.lastUpdated || 'just now');
  }

  document.getElementById('loading-view').style.display = 'none';
  document.getElementById('error-view').style.display = 'none';
  document.getElementById('data-view').style.display = 'block';
}

function showError() {
  document.getElementById('loading-view').style.display = 'none';
  document.getElementById('error-view').style.display = 'block';
  document.getElementById('data-view').style.display = 'none';
}

function showLoading(msg) {
  document.getElementById('loading-msg').textContent = msg || 'Loading...';
  document.getElementById('loading-view').style.display = 'block';
  document.getElementById('error-view').style.display = 'none';
  document.getElementById('data-view').style.display = 'none';
}

async function load(forceRefresh) {
  const btn = document.getElementById('refresh-btn');
  if (btn) btn.disabled = true;

  try {
    // Use cached data if fresh (< 5 min) and not forcing refresh
    if (!forceRefresh) {
      const cached = await new Promise(r => chrome.storage.local.get(['usageData'], r));
      if (cached.usageData?.fetchedAt && (Date.now() - cached.usageData.fetchedAt) < 300000) {
        render(cached.usageData);
        if (btn) btn.disabled = false;
        return;
      }
    }

    // Ask background to fetch fresh data
    showLoading('Fetching from Claude...');
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'fetchUsage' }, resolve);
    });

    if (response?.data && (response.data.sessionPct != null || response.data.allPct != null)) {
      render(response.data);
    } else {
      // Fallback to any stale cached data
      const stale = await new Promise(r => chrome.storage.local.get(['usageData'], r));
      if (stale.usageData) {
        render(stale.usageData);
        document.getElementById('last-updated').textContent = 'Stale data — click refresh';
      } else {
        showError();
      }
    }
  } catch (e) {
    showError();
  } finally {
    if (btn) btn.disabled = false;
  }
}

document.getElementById('refresh-btn').addEventListener('click', () => load(true));
load(false);
