async function scrapeUsageTab(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const text = document.body.innerText || '';
        const data = {};
        if (text.includes('Team')) data.plan = 'Team';
        else if (text.includes('Pro')) data.plan = 'Pro';
        else data.plan = 'Free';

        const sessionBlock = text.match(/Current session[\s\S]{0,300}?(\d+)%\s*used/i);
        data.sessionPct = sessionBlock ? parseInt(sessionBlock[1]) : null;

        const resetMatch = text.match(/Resets in ([^\n\r]{1,30})/i);
        data.sessionReset = resetMatch ? 'Resets in ' + resetMatch[1].trim() : null;

        const allBlock = text.match(/All models[\s\S]{0,300}?(\d+)%\s*used/i);
        data.allPct = allBlock ? parseInt(allBlock[1]) : null;

        const designBlock = text.match(/Claude Design[\s\S]{0,300}?(\d+)%\s*used/i);
        data.designPct = designBlock ? parseInt(designBlock[1]) : null;

        const routinesMatch = text.match(/(\d+)\s*\/\s*(\d+)/);
        if (routinesMatch) {
          data.routinesUsed = parseInt(routinesMatch[1]);
          data.routinesTotal = parseInt(routinesMatch[2]);
        }

        const updatedMatch = text.match(/Last updated:\s*([^\n\r]{1,30})/i);
        data.lastUpdated = updatedMatch ? updatedMatch[1].trim() : 'just now';
        return data;
      }
    });
    return results?.[0]?.result || null;
  } catch (e) {
    return null;
  }
}

async function fetchAndStore() {
  return new Promise((resolve) => {
    chrome.tabs.create({ url: 'https://claude.ai/settings/usage', active: false }, (tab) => {
      const tabId = tab.id;

      const onUpdated = async (updatedTabId, info) => {
        if (updatedTabId !== tabId || info.status !== 'complete') return;
        chrome.tabs.onUpdated.removeListener(onUpdated);

        // Wait for JS to render
        await new Promise(r => setTimeout(r, 2500));

        const data = await scrapeUsageTab(tabId);
        chrome.tabs.remove(tabId).catch(() => {});

        if (data && (data.sessionPct !== null || data.allPct !== null)) {
          data.fetchedAt = Date.now();
          chrome.storage.local.set({ usageData: data });

          // Update badge
          const sp = data.sessionPct;
          if (sp !== null && sp >= 80) {
            chrome.action.setBadgeText({ text: sp + '%' });
            chrome.action.setBadgeBackgroundColor({ color: '#C75A30' });
          } else {
            chrome.action.setBadgeText({ text: '' });
          }
          resolve(data);
        } else {
          resolve(null);
        }
      };

      chrome.tabs.onUpdated.addListener(onUpdated);

      // Safety timeout
      setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        chrome.tabs.remove(tabId).catch(() => {});
        resolve(null);
      }, 20000);
    });
  });
}

// Listen for popup requests
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'fetchUsage') {
    fetchAndStore().then(data => sendResponse({ data }));
    return true;
  }
});

// Auto-refresh every 10 minutes
chrome.alarms.create('refreshUsage', { periodInMinutes: 10 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refreshUsage') fetchAndStore();
});
