// ================== 전역 변수 ==================
let timerInterval;        // 타이머 setInterval 저장용
let totalDuration = 0;    // 전체 타이머 길이 (초)
let isPaused = false;     // 일시정지 상태 여부

// ================== 공지 저장 키/기본값 ==================
const NOTICE_STORAGE_KEY = 'oe_notice_html_v1';
const defaultNotice = `앞쪽부터 빈칸 없이 자리 채워서 앉아주세요.
가운데 자리도 채워 앉기 때문에 가방이나 짐은 책상과 의자에 올려두지 말아 주세요.

1. <b>교재/ 컴퓨터 싸인펜/ 화이트</b>가 없는 학생은 <b>조교를 찾아주세요.</b>

2. <b>OMR 수험번호는 010 제외하고 학생 전화번호</b> 적어주세요.

3. <b>신규 학생</b>은 OMR 카드 윗부분에 <b>'신규'</b>라고 표기한 후 <b>이름과 학교</b>만 작성하시고, <b>아는 단어만 체크</b>해 주세요. <b>(재시험 없음)</b>`;

// ================== 단어 시험 공지사항 ==================
const CutNotice = `1. <b>교재/ 컴퓨터 싸인펜/ 화이트</b>가 없는 학생은 <b>조교를 찾아주세요.</b><br>
2. <b>OMR 수험번호는 010 제외하고 학생 전화번호</b> 적어주세요.<br>
3. <b>신규 학생은 OMR 카드 윗부분에 '신규'라고 표기한 후 이름과 학교만 작성하시고, 아는 단어만 체크해 주세요. (재시험 없음)`;

// 쉬는시간 문구
const breakMsg = '복도에서 각자 자기 주간오렌지 가져가세요';

// ================== 공지 저장/로드 유틸 ==================
function getSavedNotice() {
  return localStorage.getItem(NOTICE_STORAGE_KEY) || defaultNotice;
}
function setSavedNotice(html) {
  localStorage.setItem(NOTICE_STORAGE_KEY, html);
}
function renderNotice() {
  const el = document.getElementById('notice-content');
  if (el) el.innerHTML = getSavedNotice();
}

// ================== 화면 전환 함수 ==================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');

  // 화면 진입 시 필요한 초기화
  if (id === 'notice') {
    renderNotice();
  } else if (id === 'notice-editor') {
    const ta = document.getElementById('notice-editor-text');
    if (ta) ta.value = getSavedNotice();
  }

}

// ================== 공지 편집 액션 ==================
function saveNotice() {
  const ta = document.getElementById('notice-editor-text');
  if (!ta) return;
  const value = ta.value.trim();
  setSavedNotice(value || defaultNotice);
  renderNotice();
  showScreen('notice');
}
function cancelEdit() {
  showScreen('main');
}

// ================== 전체화면 전환 함수 ==================
function toggleFullscreen() {
  const isFullscreen = document.fullscreenElement || 
                      document.webkitFullscreenElement || 
                      document.msFullscreenElement;

  if (!isFullscreen) {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  }
}

// ================== 뒤로가기 함수 ==================
function goBack() {
  clearInterval(timerInterval);
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById('main').classList.remove('hidden');
  document.getElementById('timer-end').classList.add('hidden');
  document.getElementById('progress-bar').style.width = "0%";
  isPaused = false;

  const pauseBtn = document.getElementById('pause-btn');
  if (pauseBtn) pauseBtn.textContent = '⏸';

  // ✅ 오버레이 완전히 숨김
  const overlay = document.getElementById('end-overlay');
  if (overlay) {
    overlay.classList.add('hidden');           // 다시 안 보이게
    overlay.classList.remove('timer-end-overlay'); // 스타일도 제거
    overlay.textContent = "";                  // 텍스트도 비워두기
  }

}

// ================== 미니 시계 ==================
function updateMiniClock() {
  const clock = document.getElementById('mini-clock');
  if (!clock) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  clock.textContent = `${h}:${m}`;
}
setInterval(updateMiniClock, 1000);
updateMiniClock();

// ================== 타이머 시작 함수 ==================
function startTimer(seconds, title) {
  showScreen('timer-screen');
  document.getElementById('timer-title').textContent = title;

  let subText = '';
  if (title === '단어 테스트') {
    subText = '';
    document.getElementById('timer-subtext').style.display = 'none';
  } else if (title === '쉬는 시간') {
    subText = breakMsg;
  } else {
    subText = 'OMR 수험번호는 010 제외하고 학생 전화번호 적어주세요.';
    document.getElementById('timer-subtext').style.display = 'block';
  }
  const subEl = document.getElementById('timer-subtext');
  subEl.innerHTML = subText;
  if (title === '단어 테스트') { subEl.classList.add('hidden'); } else { subEl.classList.remove('hidden'); }

  totalDuration = seconds;

  setTimeout(() => {
    updateTimerDisplay(`${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`);
  }, 10);

  runTimer(seconds);

  const now = new Date();
  const end = new Date(now.getTime() + seconds * 1000);
  const format = t => `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
  document.getElementById('start-time').textContent = `시작 ${format(now)}`;
  document.getElementById('end-time').textContent = `종료 ${format(end)}`;

  // ✅ 종료시각 기반 세션 복구 저장
  localStorage.setItem("last_timer_end", end.toISOString());
  localStorage.setItem("last_timer_title", title);

  // Firebase에 종료 시간 저장
  db.ref("sharedTimer").set({ end: end.toISOString() });
}

// ================== 독해 테스트 커스텀 타이머 시작 ==================
function startCustomTimer() {
  const minutes = parseInt(document.getElementById('minute').value, 10) || 0;
  const seconds = parseInt(document.getElementById('second').value, 10) || 0;
  const total = (minutes * 60) + seconds;
  startTimer(total, '독해 테스트');
}

// ================== 타이머 숫자 표시 업데이트 함수 ==================
function updateTimerDisplay(value, isDanger = false) {
  const display = document.getElementById('timer-display');
  display.textContent = value;
  display.style.color = isDanger ? '#ff9b30' : '';
  fitTimerFontSize();
}

// ================== 실제 타이머 실행 로직 ==================
function runTimer(duration) {
  let time = duration;
  document.getElementById('timer-end').classList.add('hidden');
  document.getElementById('progress-bar').style.width = "0%";
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (!isPaused) {
      const min = Math.floor(time / 60);
      const sec = time % 60;

      // 원래 로직: 30초 이하일 때 글자색 주황 (updateTimerDisplay 내부에서 처리)
      updateTimerDisplay(
        `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`,
        time <= 30
      );

      const percent = ((totalDuration - time) / totalDuration) * 100;
      document.getElementById('progress-bar').style.width = `${Math.max(0, Math.min(100, percent))}%`;

      // 종료 처리
      if (time <= 0) {
        clearInterval(timerInterval);
        document.getElementById('timer-end').classList.remove('hidden');
        document.getElementById('progress-bar').style.width = "100%";

        // ✅ 종료 오버레이는 여기서만
        const overlay = document.getElementById('end-overlay');
        if (overlay) {
          overlay.textContent = "⏰ 끝났습니다!";
          overlay.classList.remove('hidden');
          overlay.classList.add('timer-end-overlay');
        }
        return;
      }

      // ================== 시각 효과 ==================
      const displayBox = document.getElementById('timer-display');

      // 10초 이하일 때만 테두리 펄스
      if (time <= 10) {
        displayBox.classList.add('pulse');
      } else {
        displayBox.classList.remove('pulse');
      }

      time--;
    }
  }, 1000);
}


// ================== 일시정지 / 재시작 버튼 토글 ==================
function togglePause() {
  isPaused = !isPaused;
  document.getElementById('pause-btn').textContent = isPaused ? '▶' : '⏸';
}

// ================== 다크모드 토글 ==================
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  document.querySelectorAll('.notice-content').forEach(el => el.classList.toggle('dark-mode'));
  document.querySelectorAll('.orange-btn').forEach(el => el.classList.toggle('dark-mode'));
  document.getElementById('dark-mode-toggle').textContent = isDark ? '☀' : '☾';
}

// ================== D-Day 계산 및 표시 함수 ==================
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDayName(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

// ✅ 모의고사 일정 목록 (원하는 만큼 추가/수정 가능)
const MOCK_SCHEDULE = [
  { label: '3모', date: '2020-03-24' },
  { label: '6모', date: '2020-06-04' },
  { label: '9모', date: '2020-09-02' },
];

function updateDates() {
  const today = new Date();

  const todayDiv = document.getElementById('today-date');
  if (todayDiv && !todayDiv.textContent) {
    const todayStr = formatDate(today);
    const dayName = getDayName(today);
    todayDiv.textContent = `오늘 ${todayStr} (${dayName})`;
  }

  function calcDday(targetDateStr) { 
    const target = new Date(targetDateStr);
    target.setHours(0,0,0,0);
    const base = new Date();
    base.setHours(0,0,0,0);
    const diffTime = target - base;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // ✅ 아직 안 지난 모의고사 중에서 가장 가까운 것 찾기
  let nextMock = null;
  for (const item of MOCK_SCHEDULE) {
    const d = calcDday(item.date);
    if (d >= 0) {
      nextMock = { ...item, dday: d };
      break;
    }
  }

  const mockEl = document.getElementById('dday-mock');
  if (mockEl) {
    if (nextMock) {
      // 아직 남은 모의고사가 있는 경우 → 그 시험 기준으로 D-day 표시
      mockEl.innerHTML = `<span class="highlight">${nextMock.label}</span><br>[D-${nextMock.dday}]`;
    } else {
      // 모든 모의고사가 지난 경우
      const last = MOCK_SCHEDULE[MOCK_SCHEDULE.length - 1];
      mockEl.innerHTML = `<span class="highlight">${last.label}</span><br>🍊수능 대박 기원!😊 오렌지쌤이 여러분을 응원합니다`;
      // 필요하면 위 문구를 "끝!" 이나 "수고했어요!" 등으로 바꿔도 됨
    }
  }

  // ✅ 수능 D-Day (그대로 사용)
  const dday2027Date = '2026-11-19';
  const suEl = document.getElementById('dday-2027');
  if (suEl) suEl.innerHTML = `<span class="highlight">27수능</span><br>[D-${calcDday(dday2027Date)}]`;
}


/* ================== Easter Egg ================== */
let titleClickCount = 0;
let rainActive = false;

function getActiveScreenId() {
  const active = document.querySelector('.screen:not(.hidden)');
  return active ? active.id : null;
}

/* 🍊 비 효과 */
function createOrangeRain() {
  if (rainActive || getActiveScreenId() !== 'main') return;
  rainActive = true;

  const rainContainer = document.createElement('div');
  Object.assign(rainContainer.style, {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    pointerEvents: 'none',
    zIndex: 9999,
    overflow: 'hidden'
  });
  document.body.appendChild(rainContainer);

  const emojis = ['🍊'];
  for (let i = 0; i < 120; i++) {
    const drop = document.createElement('div');
    drop.textContent = emojis[0];
    drop.classList.add("orange-drop"); // ✅ fill-mode 적용용 클래스
    drop.style.position = 'absolute';
    drop.style.left = `${Math.random() * 100}vw`;
    drop.style.fontSize = `${Math.random() * 24 + 24}px`;
    drop.style.animation = `orange-rain ${3 + Math.random() * 2}s linear ${Math.random() * 3}s infinite`;
    drop.style.setProperty("--drift", `${Math.random() * 40 - 20}px`);
    rainContainer.appendChild(drop);
  }

  setTimeout(() => {
    rainContainer.remove();
    rainActive = false;
  }, 10000);
}

/* 🍊 폭죽 효과 */
function createOrangeExplosion() {
  if (rainActive || getActiveScreenId() !== 'main') return;
  rainActive = true;

  const explosionContainer = document.createElement('div');

  // ✅ 화면 랜덤 위치에서 터지도록 수정
  const randTop = Math.random() * 80 + 10;   // 10%~90%
  const randLeft = Math.random() * 80 + 10;  // 10%~90%
  Object.assign(explosionContainer.style, {
    position: 'fixed',
    top: `${randTop}%`,
    left: `${randLeft}%`,
    width: '0', height: '0',
    pointerEvents: 'none',
    zIndex: 9999
  });
  document.body.appendChild(explosionContainer);

  const emojis = ['🍊'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.textContent = emojis[0];
    piece.style.position = 'absolute';
    piece.style.fontSize = `${Math.random() * 20 + 20}px`;

    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * 200 + 100;
    piece.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    piece.style.animation = `orange-explosion 1s ease-out forwards`;

    explosionContainer.appendChild(piece);
  }

  setTimeout(() => {
    explosionContainer.remove();
    rainActive = false;
  }, 1200);
}

/* --- 제목 클릭 시 발동 --- */
document.addEventListener("DOMContentLoaded", () => {
  const title = document.querySelector('h1');
  if (title) {
    title.addEventListener('click', () => {
      if (++titleClickCount === 5) {
        if (Math.random() > 0.5) createOrangeRain();
        else createOrangeExplosion();
        titleClickCount = 0;
      }
    });
  }
});

// ================== DOMContentLoaded ==================
document.addEventListener("DOMContentLoaded", () => {
  // 키보드 단축키
  document.addEventListener('keydown', (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    switch (e.code) {
      case 'Space': e.preventDefault(); togglePause(); break;
      case 'Escape': goBack(); break;
      case 'Digit1': startTimer(600, '단어 테스트'); break;
      case 'Digit2': startTimer(4200, 'SURVIVAL'); break;
      case 'Digit3': startTimer(600, '쉬는 시간'); break;
      case 'KeyF': toggleFullscreen(); break;
    }
  });

  if (!localStorage.getItem(NOTICE_STORAGE_KEY)) {
    setSavedNotice(defaultNotice);
  }
  renderNotice();
  updateDates();
  if (!document.body.classList.contains("dark-mode")) {
    toggleDarkMode();
  }

  const title = document.querySelector('h1');
  if (title) {
    title.addEventListener('click', () => {
      titleClickCount++;
      if (titleClickCount === 5) {
        createOrangeRain();
        titleClickCount = 0;
      }
    });
  }

  resetUIHideTimer();
});

// ================== 세션 복구 ==================
document.addEventListener('DOMContentLoaded', () => {
  const endStr = localStorage.getItem('last_timer_end');
  const title = localStorage.getItem('last_timer_title');
  if (endStr && title) {
    const endTime = new Date(endStr);
    const now = new Date();
    let remain = Math.floor((endTime.getTime() - now.getTime()) / 1000);
    if (remain > 0) {
      if (confirm(`마지막 타이머(${title}, 남은 ${Math.floor(remain/60)}분 ${remain%60}초)를 복원할까요?`)) {
        startTimer(remain, title);
      }
    } else {
      localStorage.removeItem('last_timer_end');
      localStorage.removeItem('last_timer_title');
    }
  }
});

// ================== UI 자동 숨김 ==================
let uiHideTimeout;
function showUI() {
  document.querySelectorAll('.back-btn').forEach(btn => btn.classList.remove('hide-ui'));
  document.querySelector('.fullscreen-btn')?.classList.remove('hide-ui');
  document.querySelector('.dark-mode-btn')?.classList.remove('hide-ui');
  document.querySelector('.topbar')?.classList.remove('hide-ui');
  document.body.classList.remove('hide-cursor');
}
function hideUI() {
  document.querySelectorAll('.back-btn').forEach(btn => btn.classList.add('hide-ui'));
  document.querySelector('.fullscreen-btn')?.classList.add('hide-ui');
  document.querySelector('.dark-mode-btn')?.classList.add('hide-ui');
  document.querySelector('.topbar')?.classList.add('hide-ui');
  document.body.classList.add('hide-cursor');
}
function resetUIHideTimer() {
  showUI();
  clearTimeout(uiHideTimeout);
  uiHideTimeout = setTimeout(hideUI, 1200);
}
document.addEventListener('mousemove', resetUIHideTimer);
document.addEventListener('mousedown', resetUIHideTimer);
document.addEventListener('keydown', resetUIHideTimer);

// ================== Firebase 동기화 ==================
db.ref("sharedTimer").on("value", (snapshot) => {
  const data = snapshot.val();
  if (data && data.end) {
    localStorage.setItem("last_timer_end", data.end);
    console.log("🔄 동기화된 종료시간:", data.end);
  }
});

// ================== 타이머 폰트 크기 자동 조절 ==================
function fitTimerFontSize() {
  const box = document.querySelector('#timer-display.timer-decorated');
  if (!box) return;
  box.style.fontSize = '1000px';
  const boxWidth = box.clientWidth;
  const boxHeight = box.clientHeight;
  const textWidth = box.scrollWidth;
  const textHeight = box.scrollHeight;
  const horizontalPadding = boxWidth * 0.15;
  const verticalPadding = boxHeight * 0.15;
  const availableWidth = boxWidth - horizontalPadding * 2;
  const availableHeight = boxHeight - verticalPadding * 2;
  const widthRatio = availableWidth / textWidth;
  const heightRatio = availableHeight / textHeight;
  const ratio = Math.min(widthRatio, heightRatio);
  const newFontSize = 1000 * ratio;
  box.style.fontSize = `${newFontSize}px`;
}
window.addEventListener('resize', fitTimerFontSize);

// ================== 10분 전 알람 ==================
function triggerAlarm(endTime) {
  const alarmTime = new Date(endTime.getTime() - 10 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = alarmTime.getFullYear();
  const mm   = pad(alarmTime.getMonth() + 1);
  const dd   = pad(alarmTime.getDate());
  const hh   = pad(alarmTime.getHours());
  const min  = pad(alarmTime.getMinutes());
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isIOS) {
    const dtStart = `${yyyy}${mm}${dd}T${hh}${min}00`;
    const endPlus1h = new Date(alarmTime.getTime());
    endPlus1h.setHours(endPlus1h.getHours() + 1);
    const hhEnd = pad(endPlus1h.getHours());
    const minEnd = pad(endPlus1h.getMinutes());
    const dtEnd = `${yyyy}${mm}${dd}T${hhEnd}${minEnd}00`;
    const icsContent = `BEGIN:VCALENDAR
    VERSION:2.0
    PRODID:-//Orange English//Timer//KR
    BEGIN:VEVENT
    SUMMARY:⏰ 타이머 알람
    DTSTART:${dtStart}
    DTEND:${dtEnd}
    DESCRIPTION:Orange English 타이머 종료 10분 전 알람
    END:VEVENT
    END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alarm.ics";
    a.click();
    URL.revokeObjectURL(url);
    alert(`📅 iOS 캘린더에 ${parseInt(hh,10)}시 ${parseInt(min,10)}분 알람 이벤트를 추가하세요.`);
  } else {
    const intentUrl = `intent://alarm#Intent;scheme=clock;package=com.android.deskclock;S.hour=${parseInt(hh,10)};S.minutes=${parseInt(min,10)};end`;
    try {
      window.location.href = intentUrl;
      alert(`⏰ 안드로이드 알람을 ${parseInt(hh,10)}:${min}로 설정합니다.`);
    } catch (e) {
      alert(`⏰ ${parseInt(hh,10)}:${min}로 알람을 설정해주세요 (알람 앱 연동 실패).`);
    }
  }
}
function setAlarmFromLastTimer() {
  let lastEnd = localStorage.getItem("last_timer_end");
  if (lastEnd) {
    triggerAlarm(new Date(lastEnd));
    return;
  }
  db.ref("sharedTimer").once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      if (data && data.end) {
        localStorage.setItem("last_timer_end", data.end);
        triggerAlarm(new Date(data.end));
      } else {
        alert("최근 실행된 타이머가 없습니다.");
      }
    })
    .catch((err) => {
      console.error("Firebase 읽기 오류:", err);
      alert("네트워크 또는 서버 오류로 알람을 불러오지 못했습니다.");
    });
}



// 화면 크기 바뀔 때마다 폰트 크기 재조정
window.addEventListener('resize', fitTimerFontSize);


