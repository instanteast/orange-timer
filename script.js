// ================== 전역 변수 ==================
let timerInterval;        // 타이머 setInterval 저장용
let totalDuration = 0;    // 전체 타이머 길이 (초)
let isPaused = false;     // 일시정지 상태 여부

// ================== 공지사항 전체 텍스트 ==================
const fullNotice = `앞쪽부터 빈칸 없이 자리 채워서 앉아주세요.
가운데 자리도 채워 앉기 때문에 가방이나 짐은 책상과 의자에 올려두지 말아 주세요.

1. <b>교재/ 컴퓨터 싸인펜/ 화이트</b>가 없는 학생은 <b>조교를 찾아주세요.</b>

2. <b>OMR 수험번호는 010 제외하고 학생 전화번호</b> 적어주세요.

3. <b>신규 학생은 OMR 카드 윗부분에 '신규'라고 표기한 후 이름과 학교만 작성하시고, 아는 단어만 체크해 주세요. (재시험 없음)`;

// ================== 단어 시험 공지사항 ==================// 
const CutNotice = `1. <b>교재/ 컴퓨터 싸인펜/ 화이트</b>가 없는 학생은 <b>조교를 찾아주세요.</b><br>
2. <b>OMR 수험번호는 010 제외하고 학생 전화번호</b> 적어주세요.<br>
3. <b>신규 학생은 OMR 카드 윗부분에 '신규'라고 표기한 후 이름과 학교만 작성하시고, 아는 단어만 체크해 주세요. (재시험 없음)`;


// 쉬는시간 문구
const breakMsg = '복도에서 각자 자기 주간오렌지 가져가세요';

// ================== 화면 전환 함수 ==================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ================== 전체화면 전환 함수 ==================
function toggleFullscreen() {
  // 1. 현재 전체화면 상태 확인
  const isFullscreen = document.fullscreenElement || 
                      document.webkitFullscreenElement || 
                      document.msFullscreenElement;

  // 2. 전체화면 모드 전환
  if (!isFullscreen) {
    const elem = document.documentElement; // <html> 요소 선택
    if (elem.requestFullscreen) {
      elem.requestFullscreen(); // 일반 브라우저
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen(); // Safari
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen(); // IE/Edge 구버전
    }
  } 
  // 3. 전체화면 해제
  else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen(); // Safari
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen(); // IE/Edge 구버전
    }
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
  document.getElementById('pause-btn').textContent = '⏸';
}

// ================== 타이머 시작 함수 ==================
function startTimer(seconds, title) {
  showScreen('timer-screen');
  document.getElementById('timer-title').textContent = title;

  let subText = '';
  if (title === '단어 테스트') {
    subText = CutNotice;
  } else if (title === '쉬는 시간') {
    subText = breakMsg;
  } else {
    subText = 'OMR 수험번호는 010 제외하고 학생 전화번호 적어주세요.';
  }
  document.getElementById('timer-subtext').innerHTML = subText;

  totalDuration = seconds;
  runTimer(seconds);


  const now = new Date();
  const end = new Date(now.getTime() + seconds * 1000);
  const format = t => `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;

  const startSpan = document.getElementById('start-time');
  const endSpan = document.getElementById('end-time');
  startSpan.textContent = `시작 ${format(now)}`;
  endSpan.textContent = `종료 ${format(end)}`;

  totalDuration = seconds;
  runTimer(seconds);
}

// ================== 독해 테스트 커스텀 타이머 시작 ==================
function startCustomTimer() {
  const minutes = parseInt(document.getElementById('minute').value, 10);
  const seconds = parseInt(document.getElementById('second').value, 10);
  const total = (minutes * 60) + seconds;
  startTimer(total, '독해 테스트');
}

// ================== 실제 타이머 실행 로직 ==================
function runTimer(duration) {
  let time = duration;
  const display = document.getElementById('timer-display');
  document.getElementById('timer-end').classList.add('hidden');
  document.getElementById('progress-bar').style.width = "0%";
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (!isPaused) {
      const min = Math.floor(time / 60);
      const sec = time % 60;
      display.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

      const percent = ((totalDuration - time) / totalDuration) * 100;
      document.getElementById('progress-bar').style.width = `${percent}%`;

      if (time <= 0) {
        clearInterval(timerInterval);
        document.getElementById('timer-end').classList.remove('hidden');
        document.getElementById('progress-bar').style.width = "100%";
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
  document.getElementById('dark-mode-toggle').textContent = isDark ? '☀' : '☾ ';
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

function updateDates() {
  const today = new Date();

  const todayDiv = document.getElementById('today-date');
  if (!todayDiv.textContent) {
    const todayStr = formatDate(today);
    const dayName = getDayName(today);
    todayDiv.textContent = `오늘\n${todayStr} (${dayName})`;
  }

  function calcDday(targetDateStr) { 
    const target = new Date(targetDateStr);
    target.setHours(0,0,0,0);
    today.setHours(0,0,0,0);

    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  const ddaymockDate = '2025-09-03';
  const dday2026Date = '2025-11-13';

  document.getElementById('dday-mock').innerHTML = "🍊수능 대박 기원!🍊" + "<br>" + "오렌지t가 여러분을 응원합니다";
  document.getElementById('dday-2026').innerHTML = `<span class="highlight">26수능</span><br> [D-${calcDday(dday2026Date)}]`;

}

// ====== 오렌지 비 이스터에그 ======
let titleClickCount = 0;
let rainActive = false;

function createOrangeRain() {
  if (rainActive) return;
  rainActive = true;
  const rainContainer = document.createElement('div');
  rainContainer.id = 'orange-rain-container';
  rainContainer.style.position = 'fixed';
  rainContainer.style.top = 0;
  rainContainer.style.left = 0;
  rainContainer.style.width = '100vw';
  rainContainer.style.height = '100vh';
  rainContainer.style.pointerEvents = 'none';
  rainContainer.style.zIndex = 9999;
  document.body.appendChild(rainContainer);

  const emojis = ['🍊'];
  const rainCount = 40;

  for (let i = 0; i < rainCount; i++) {
    const drop = document.createElement('div');
    drop.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    drop.style.position = 'absolute';
    // 랜덤한 가로 위치 (0~98vw)
    drop.style.left = `${Math.random() * 98}vw`;
    // 랜덤한 세로 시작 위치 (화면 위쪽 밖)
    drop.style.top = `-${Math.random() * 20 + 5}vh`;
    drop.style.fontSize = `${Math.random() * 32 + 32}px`;
    drop.style.opacity = Math.random() * 0.5 + 0.5;
    // 랜덤한 애니메이션 지속시간 (2~3초)
    const duration = 2 + Math.random();
    // 랜덤한 시작 지연 (0~0.7초)
    const delay = Math.random() * 0.7;
    drop.style.transition = `top ${duration}s linear`;
    drop.style.transitionDelay = `${delay}s`;
    rainContainer.appendChild(drop);

    setTimeout(() => {
      drop.style.top = '100vh';
    }, 50 + delay * 1000);

    // 자동 제거
    setTimeout(() => {
      drop.remove();
      if (i === rainCount - 1) {
        rainActive = false;
        if (rainContainer.parentNode) rainContainer.remove();
      }
    }, (duration + delay) * 1000 + 500);
  }
}

// ================== 다크모드 시작시 변환 ==================
document.addEventListener("DOMContentLoaded", () => {
  updateDates();
  if (!document.body.classList.contains("dark-mode")) {
    toggleDarkMode();
  }

  // 타이틀 클릭 이벤트 리스너
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
});

let uiHideTimeout;

function showUI() {
  document.querySelectorAll('.back-btn').forEach(btn => btn.classList.remove('hide-ui'));
  document.querySelector('.fullscreen-btn')?.classList.remove('hide-ui');
  document.querySelector('.dark-mode-btn')?.classList.remove('hide-ui');
  document.body.classList.remove('hide-cursor');
}

function hideUI() {
  document.querySelectorAll('.back-btn').forEach(btn => btn.classList.add('hide-ui'));
  document.querySelector('.fullscreen-btn')?.classList.add('hide-ui');
  document.querySelector('.dark-mode-btn')?.classList.add('hide-ui');
  document.body.classList.add('hide-cursor');
}

function resetUIHideTimer() {
  showUI();
  clearTimeout(uiHideTimeout);
  uiHideTimeout = setTimeout(hideUI, 2000); // 2초 후 숨김
}

document.addEventListener('mousemove', resetUIHideTimer);
document.addEventListener('mousedown', resetUIHideTimer);
document.addEventListener('keydown', resetUIHideTimer);

// 최초 진입 시 타이머 시작
document.addEventListener('DOMContentLoaded', () => {
  resetUIHideTimer();
});


