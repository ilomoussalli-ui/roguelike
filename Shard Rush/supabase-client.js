const SUPABASE_URL = 'https://sfxeuywicczgubmufpje.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeGV1eXdpY2N6Z3VibXVmcGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTM2ODgsImV4cCI6MjA5MzAyOTY4OH0._v76uyMKJ9Z7edegJfCKMiS8LwhK2pM1QNoua2tT0UA';

const sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let _currentUser     = null;
let _currentUsername = null;
let _authMode        = 'login';

// ── DOM refs ──
const authOverlayEl          = document.getElementById('auth-overlay');
const authUsernameDisplayEl  = document.getElementById('auth-username-display');
const btnAuthOpenEl          = document.getElementById('btn-auth-open');
const btnAuthLogoutEl        = document.getElementById('btn-auth-logout');
const tabLoginEl             = document.getElementById('tab-login');
const tabRegisterEl          = document.getElementById('tab-register');
const authUsernameInputEl    = document.getElementById('auth-input-username');
const authPasswordInputEl    = document.getElementById('auth-input-password');
const authErrorEl            = document.getElementById('auth-error');
const btnAuthSubmitEl        = document.getElementById('btn-auth-submit');
const btnAuthCloseEl         = document.getElementById('btn-auth-close');
const leaderboardOverlayEl   = document.getElementById('leaderboard-overlay');
const leaderboardTbodyEl     = document.querySelector('#leaderboard-table tbody');
const btnLeaderboardEl       = document.getElementById('btn-leaderboard');
const btnLeaderboardCloseEl  = document.getElementById('btn-leaderboard-close');
const lbDiffBtns             = document.querySelectorAll('[data-diff]');

function getCurrentUser()     { return _currentUser; }
function getCurrentUsername() { return _currentUsername; }

// ── Auth ──
async function authRegister(username, password) {
  const { data: existing } = await sbClient
    .from('profiles').select('username').eq('username', username).maybeSingle();
  if (existing) throw new Error('Username bereits vergeben.');

  const email = `${username.toLowerCase()}@shardrush.local`;
  const { data, error } = await sbClient.auth.signUp({ email, password });
  if (error) throw new Error(error.message);

  const { error: pe } = await sbClient.from('profiles').insert({ id: data.user.id, username });
  if (pe) throw new Error('Username bereits vergeben.');

  _currentUser     = data.user;
  _currentUsername = username;
  localStorage.setItem('sr_username', username);
  updateAuthUI();
}

async function authLogin(username, password) {
  const email = `${username.toLowerCase()}@shardrush.local`;
  const { data, error } = await sbClient.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Falscher Username oder Passwort.');

  _currentUser     = data.user;
  _currentUsername = username;
  localStorage.setItem('sr_username', username);
  updateAuthUI();
}

async function authLogout() {
  await sbClient.auth.signOut();
  localStorage.removeItem('sr_username');
}

async function loadUsername(userId) {
  const { data } = await sbClient.from('profiles').select('username').eq('id', userId).single();
  if (data?.username) { localStorage.setItem('sr_username', data.username); return data.username; }
  return localStorage.getItem('sr_username') || null;
}

// ── Highscore sync ──
async function syncHighscoreToCloud(difficulty, level, timeSeconds, upgrades) {
  if (!_currentUser || !_currentUsername) return;

  const { data: ex } = await sbClient
    .from('highscores').select('level, time_seconds, upgrades')
    .eq('user_id', _currentUser.id).eq('difficulty', difficulty).maybeSingle();

  const newLevel    = Math.max(level,       ex?.level        || 0);
  const newTime     = Math.max(timeSeconds, ex?.time_seconds || 0);
  const newUpgrades = Math.max(upgrades,    ex?.upgrades     || 0);

  if (ex && newLevel === ex.level && newTime === ex.time_seconds && newUpgrades === ex.upgrades) return;

  const { error } = await sbClient.from('highscores').upsert({
    user_id:      _currentUser.id,
    username:     _currentUsername,
    difficulty,
    level:        newLevel,
    time_seconds: newTime,
    upgrades:     newUpgrades,
    updated_at:   new Date().toISOString(),
  }, { onConflict: 'user_id,difficulty' });
  if (error) console.error('[sync] upsert-Fehler:', error);
  else console.log('[sync] gespeichert:', { difficulty, level: newLevel, time_seconds: newTime, upgrades: newUpgrades });
}

// ── Leaderboard ──
async function fetchLeaderboard(difficulty) {
  const { data } = await sbClient
    .from('highscores').select('username, level, time_seconds, upgrades')
    .eq('difficulty', difficulty)
    .order('level',        { ascending: false })
    .order('time_seconds', { ascending: false })
    .limit(10);
  return data || [];
}

// ── UI helpers ──
function updateAuthUI() {
  if (_currentUser && _currentUsername) {
    authUsernameDisplayEl.textContent = `Hallo, ${_currentUsername}`;
    btnAuthOpenEl.classList.add('hidden');
    btnAuthLogoutEl.classList.remove('hidden');
  } else {
    authUsernameDisplayEl.textContent = '';
    btnAuthOpenEl.classList.remove('hidden');
    btnAuthLogoutEl.classList.add('hidden');
  }
}

function openAuthOverlay() {
  authErrorEl.classList.add('hidden');
  authErrorEl.textContent = '';
  authUsernameInputEl.value = '';
  authPasswordInputEl.value = '';
  setAuthMode('login');
  authOverlayEl.classList.remove('hidden');
  setTimeout(() => authUsernameInputEl.focus(), 50);
}

function closeAuthOverlay() {
  authOverlayEl.classList.add('hidden');
}

function setAuthMode(mode) {
  _authMode = mode;
  if (mode === 'login') {
    tabLoginEl.classList.add('active');
    tabRegisterEl.classList.remove('active');
    btnAuthSubmitEl.textContent = 'Anmelden';
  } else {
    tabRegisterEl.classList.add('active');
    tabLoginEl.classList.remove('active');
    btnAuthSubmitEl.textContent = 'Registrieren';
  }
}

async function openLeaderboard(difficulty) {
  leaderboardOverlayEl.classList.remove('hidden');
  const activeDiff = difficulty || 'normal';
  lbDiffBtns.forEach(b => b.classList.toggle('active', b.dataset.diff === activeDiff));
  await renderLeaderboard(activeDiff);
}

async function renderLeaderboard(difficulty) {
  leaderboardTbodyEl.innerHTML =
    '<tr><td colspan="5" class="lb-loading">Laden…</td></tr>';
  const rows = await fetchLeaderboard(difficulty);
  if (!rows.length) {
    leaderboardTbodyEl.innerHTML =
      '<tr><td colspan="5" class="lb-empty">Noch keine Einträge.</td></tr>';
    return;
  }
  leaderboardTbodyEl.innerHTML = rows.map((r, i) => `
    <tr class="${_currentUsername && r.username === _currentUsername ? 'lb-own' : ''}">
      <td class="lb-rank">${i + 1}</td>
      <td class="lb-name">${r.username}</td>
      <td>Stage ${r.level}</td>
      <td>${r.time_seconds.toFixed(1)}s</td>
      <td>${r.upgrades}</td>
    </tr>`).join('');
}

// ── Event listeners ──
btnAuthOpenEl.addEventListener('click', openAuthOverlay);
btnAuthCloseEl.addEventListener('click', closeAuthOverlay);
authOverlayEl.addEventListener('click', e => { if (e.target === authOverlayEl) closeAuthOverlay(); });

tabLoginEl.addEventListener('click', () => setAuthMode('login'));
tabRegisterEl.addEventListener('click', () => setAuthMode('register'));

btnAuthLogoutEl.addEventListener('click', async () => {
  await authLogout();
  _currentUser = null;
  _currentUsername = null;
  updateAuthUI();
});

btnAuthSubmitEl.addEventListener('click', async () => {
  const username = authUsernameInputEl.value.trim();
  const password = authPasswordInputEl.value;

  authErrorEl.classList.add('hidden');

  if (username.length < 3) {
    authErrorEl.textContent = 'Username muss mindestens 3 Zeichen haben.';
    authErrorEl.classList.remove('hidden');
    return;
  }
  if (password.length < 6) {
    authErrorEl.textContent = 'Passwort muss mindestens 6 Zeichen haben.';
    authErrorEl.classList.remove('hidden');
    return;
  }

  btnAuthSubmitEl.disabled = true;
  btnAuthSubmitEl.textContent = '…';

  try {
    if (_authMode === 'register') {
      await authRegister(username, password);
    } else {
      await authLogin(username, password);
    }
    closeAuthOverlay();
  } catch (err) {
    authErrorEl.textContent = err.message;
    authErrorEl.classList.remove('hidden');
  } finally {
    btnAuthSubmitEl.disabled = false;
    setAuthMode(_authMode);
  }
});

authPasswordInputEl.addEventListener('keydown', e => { if (e.key === 'Enter') btnAuthSubmitEl.click(); });
authUsernameInputEl.addEventListener('keydown', e => { if (e.key === 'Enter') authPasswordInputEl.focus(); });

btnLeaderboardEl.addEventListener('click', () => {
  const diff = (typeof currentDifficulty !== 'undefined') ? currentDifficulty : 'normal';
  openLeaderboard(diff);
});
btnLeaderboardCloseEl.addEventListener('click', () => leaderboardOverlayEl.classList.add('hidden'));
leaderboardOverlayEl.addEventListener('click', e => {
  if (e.target === leaderboardOverlayEl) leaderboardOverlayEl.classList.add('hidden');
});

lbDiffBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    lbDiffBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    await renderLeaderboard(btn.dataset.diff);
  });
});

// ── Session restore on page load ──
sbClient.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    _currentUser = session.user;
    if (!_currentUsername) {
      loadUsername(session.user.id).then(name => {
        _currentUsername = name;
        updateAuthUI();
      });
    }
  } else {
    _currentUser     = null;
    _currentUsername = null;
  }
  updateAuthUI();
});
