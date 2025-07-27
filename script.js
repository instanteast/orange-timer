
let timerInterval;

const fullNotice = `앞쪽부터 빈칸 없이 자리 채워서 앉아주세요.
가운데 자리도 채워 앉기 때문에 가방이나 짐은 책상과 의자에 올려두지 말아 주세요.

1. <b>교재/ 컴퓨터 싸인펜/ 화이트</b>가 없는 학생은 <b>조교를 찾아주세요.</b>

2. <b>OMR 수험번호는 010 제외하고 학생 전화번호</b> 적어주세요.

3. <b>신규 학생</b>은 단어 시험 OMR 윗부분에 <b>신규</b>라고 적고, <b>이름, 학교</b>만 기입 후 시험지에 <b>아는 단어만 체크</b>해 주세요. <b>신규는 재시험 없으니 편하게</b> 보세요.`;
const breakMsg = '복도에서 각자 자기 주간오렌지 가져가세요';

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function goBack() {
  clearInterval(timerInterval);
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById('main').classList.remove('hidden');
  document.getElementById('timer-end').classList.add('hidden');
}

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

  runTimer(seconds);
}

function startCustomTimer() {
  const minutes = parseInt(document.getElementById('minute').value, 10);
  const seconds = parseInt(document.getElementById('second').value, 10);
  const total = (minutes * 60) + seconds;
  startTimer(total, '독해 테스트');
}

function runTimer(duration) {
  let time = duration;
  const display = document.getElementById('timer-display');
  document.getElementById('timer-end').classList.add('hidden');

  timerInterval = setInterval(() => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    display.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    if (time <= 0) {
      clearInterval(timerInterval);
      document.getElementById('timer-end').classList.remove('hidden');
    }
    time--;
  }, 1000);
}
