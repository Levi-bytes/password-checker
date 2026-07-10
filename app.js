const pwInput = document.getElementById('pw');
const toggleBtn = document.getElementById('toggle');
const meterFill = document.getElementById('meterFill');
const meterLabel = document.getElementById('meterLabel');
const hashPanel = document.getElementById('hashPanel');
const hashBar = document.getElementById('hashBar');
const result = document.getElementById('result');
const resultBadge = document.getElementById('resultBadge');
const resultText = document.getElementById('resultText');

const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password1',
  'admin', 'letmein', 'welcome', 'monkey', 'iloveyou', '12345678',
  'football', 'dragon', 'master', 'login', 'princess', 'sunshine',
]);

let debounceTimer = null;

toggleBtn.addEventListener('click', () => {
  const isPassword = pwInput.type === 'password';
  pwInput.type = isPassword ? 'text' : 'password';
  toggleBtn.textContent = isPassword ? '🙈' : '👁';
});

pwInput.addEventListener('input', () => {
  const value = pwInput.value;

  if (!value) {
    resetUI();
    return;
  }

  updateStrengthMeter(value);

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => checkBreach(value), 500);
});

function resetUI() {
  meterFill.style.width = '0%';
  meterFill.style.background = 'var(--muted)';
  meterLabel.textContent = 'Start typing';
  hashPanel.hidden = true;
  result.hidden = true;
}

function scorePassword(value) {
  let score = 0;
  if (value.length >= 8) score += 20;
  if (value.length >= 12) score += 15;
  if (value.length >= 16) score += 10;
  if (/[a-z]/.test(value)) score += 10;
  if (/[A-Z]/.test(value)) score += 10;
  if (/[0-9]/.test(value)) score += 10;
  if (/[^a-zA-Z0-9]/.test(value)) score += 15;

  if (COMMON_PASSWORDS.has(value.toLowerCase())) score = Math.min(score, 15);

  return Math.min(score, 100);
}

function updateStrengthMeter(value) {
  const score = scorePassword(value);
  meterFill.style.width = score + '%';

  let label, color;
  if (score < 35) {
    label = 'Weak';
    color = 'var(--danger)';
  } else if (score < 70) {
    label = 'Okay';
    color = 'var(--warn)';
  } else {
    label = 'Strong';
    color = 'var(--safe)';
  }
  meterFill.style.background = color;
  meterLabel.textContent = label + ' — based on length and character variety';
}

async function sha1(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function renderHashBar(hash) {
  const prefix = hash.slice(0, 5);
  const rest = hash.slice(5);
  hashBar.innerHTML =
    `<span class="sent">${prefix}</span><span class="kept">${rest}</span>`;
  hashPanel.hidden = false;
}

async function checkBreach(value) {
  const hash = await sha1(value);
  renderHashBar(hash);

  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await res.text();

    const lines = text.split('\n');
    let count = 0;
    for (const line of lines) {
      const [lineSuffix, lineCount] = line.trim().split(':');
      if (lineSuffix === suffix) {
        count = parseInt(lineCount, 10);
        break;
      }
    }

    showResult(count);
  } catch (err) {
    result.hidden = false;
    result.className = 'result warn';
    resultBadge.textContent = 'ERROR';
    resultText.textContent = "Couldn't reach the breach database right now. Try again in a moment.";
  }
}

function showResult(count) {
  result.hidden = false;

  if (count === 0) {
    result.className = 'result safe';
    resultBadge.textContent = 'NOT FOUND';
    resultText.textContent = "This password wasn't found in any known breach — but that alone doesn't make it strong.";
  } else if (count < 1000) {
    result.className = 'result warn';
    resultBadge.textContent = 'SEEN BEFORE';
    resultText.textContent = `This password has appeared in ${count.toLocaleString()} breach${count === 1 ? '' : 'es'}. Consider changing it.`;
  } else {
    result.className = 'result danger';
    resultBadge.textContent = 'COMPROMISED';
    resultText.textContent = `This password has appeared in ${count.toLocaleString()} breaches. Don't use it — it's essentially public.`;
  }
}
