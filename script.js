// ================== 전역 변수 ==================
let timerInterval;        // 타이머 setInterval 저장용
let totalDuration = 0;    // 전체 타이머 길이 (초)
let isPaused = false;     // 일시정지 상태 여부

// ================== 공지사항 전체 텍스트 ==================
const fullNotice = `앞쪽부터 빈칸 없이 자리 채워서 앉아주세요.
가운데 자리도 채워 앉기 때문에 가방이나 짐은 책상과 의자에 올려두지 말아 주세요.

1. <b>교재/ 컴퓨터 싸인펜/ 화이트</b>가 없는 학생은 <b>조교를 찾아주세요.</b>

2. <b>OMR 수험번호는 010 제외하고 학생 전화번호</b> 적어주세요.

3. <b>신규 학생</b>은 단어 시험 OMR 윗부분에 <b>신규</b>라고 적고, <b>이름, 학교</b>만 기입 후 시험지에 <b>아는 단어만 체크</b>해 주세요. 
<b>신규는 재시험 없으니 편하게</b> 보세요.`;

// 쉬는시간 문구
const breakMsg = '복도에서 각자 자기 주간오렌지 가져가세요';

// ================== 화면 전환 함수 ==================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ================== 전체화면 전환 함수 ==================
function toggleFullscreen() {
  // F11 키 이벤트 생성 후 강제 실행
  const f11Event = new KeyboardEvent('keydown', {
    key: 'F11',
    code: 'F11',
    keyCode: 122,  // F11 키코드
    which: 122,
    bubbles: true
  });
  document.dispatchEvent(f11Event);
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
    subText = fullNotice;
  } else if (title === '쉬는 시간') {
    subText = breakMsg;
  } else {
    subText = 'OMR 수험번호는 010 제외하고 학생 전화번호 적어주세요.';
  }
  document.getElementById('timer-subtext').innerHTML = subText;

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
function updateDday(targetId, examDateStr, label) {
  const today = new Date();
  const examDate = new Date(examDateStr);
  const timeDiff = examDate - today;
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  document.getElementById(targetId).textContent = `[D-${daysLeft}] ${label}`;
}

// ================== 페이지 로딩 시 D-Day 표시 ==================
document.addEventListener("DOMContentLoaded", () => {
  updateDday("dday-2026", "2025-11-13", "26수능");
  updateDday("dday-2027", "2026-11-19", "27수능");
});

