const QUIZ_COUNT = 5; // 👈 ここが出題数です。問題数を増やす場合はこの数字を変更してください。
let questions = []; // 全問題データ
let currentQuiz = []; // 5問のランダムな問題
let currentQuestionIndex = 0;
let score = 0;
let isAnswered = false; // 回答済みフラグ

const quizContainer = document.getElementById('quiz-container');
const questionBox = document.getElementById('question-box');
const questionText = document.getElementById('question-text');
const optionsList = document.getElementById('options-list');
const nextButton = document.getElementById('next-button');
const resultDiv = document.getElementById('result');

// 1. JSONファイルを読み込む関数
async function fetchQuizData() {
    try {
        const response = await fetch('quizData.json');
        const data = await response.json();
        questions = data.questions;
        startQuiz();
    } catch (error) {
        console.error('問題データの読み込みに失敗しました:', error);
        questionBox.innerHTML = '<p>問題データの読み込み中にエラーが発生しました。</p>';
    }
}

// 2. クイズ開始（ランダムな5問を選ぶ）
function startQuiz() {
    // 問題をシャッフルし、先頭からQUIZ_COUNT分（5問）を取得
    const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
    currentQuiz = shuffledQuestions.slice(0, QUIZ_COUNT);

    // UIをクイズ画面に戻す
    quizContainer.style.display = 'block';
    resultDiv.innerHTML = '';
    resultDiv.style.padding = '0';
    resultDiv.style.backgroundColor = 'transparent';
    resultDiv.style.color = '#333';
    
    currentQuestionIndex = 0;
    score = 0;
    nextButton.textContent = '解答する';
    nextButton.onclick = checkAnswer;
    nextButton.disabled = true;

    // 初回の問題表示
    showQuestion();
}

// 3. 問題を表示する関数
function showQuestion() {
    if (currentQuestionIndex >= QUIZ_COUNT) {
        showResults();
        return;
    }

    const q = currentQuiz[currentQuestionIndex];
    
    // UIの初期化
    isAnswered = false;
    nextButton.textContent = '解答する';
    nextButton.onclick = checkAnswer;
    nextButton.disabled = true;
    
    // 前回表示された解説があれば削除
    const rationale = questionBox.querySelector('.rationale');
    if (rationale) {
        questionBox.removeChild(rationale);
    }
    
    optionsList.innerHTML = ''; // 選択肢をクリア

    // 問題文の表示
    questionText.innerHTML = `問${currentQuestionIndex + 1}/${QUIZ_COUNT}：<br>${q.question}`;

    // 選択肢の表示
    q.options.forEach((option, index) => {
        const li = document.createElement('li');
        li.textContent = option;
        li.dataset.index = index;
        li.addEventListener('click', () => selectOption(li));
        optionsList.appendChild(li);
    });
}

// 4. 選択肢を選んだ時の処理
function selectOption(selectedLi) {
    if (isAnswered) return; // 回答済みの場合は何もしない

    // 全ての選択肢から 'selected' クラスを削除
    document.querySelectorAll('#options-list li').forEach(li => {
        li.classList.remove('selected');
    });

    // 選択された選択肢に 'selected' クラスを追加
    selectedLi.classList.add('selected');
    
    // 回答ボタンを有効化
    nextButton.disabled = false;
}

// 5. 解答をチェックする関数
function checkAnswer() {
    if (isAnswered) return;

    const selectedOption = document.querySelector('#options-list li.selected');

    if (!selectedOption) {
        alert('選択肢を選んでください。');
        return;
    }

    isAnswered = true;
    const selectedIndex = parseInt(selectedOption.dataset.index);
    const correctIndex = currentQuiz[currentQuestionIndex].answer;
    const q = currentQuiz[currentQuestionIndex];

    // 結果のフィードバック
    document.querySelectorAll('#options-list li').forEach(li => {
        const index = parseInt(li.dataset.index);
        
        // 全ての選択肢のクリックイベントを無効化
        li.removeEventListener('click', selectOption);

        if (index === correctIndex) {
            li.classList.add('correct');
        } else if (index === selectedIndex) {
            li.classList.add('incorrect');
        }
    });

    // スコアの加算
    if (selectedIndex === correctIndex) {
        score++;
    }

    // 解説の表示
    const rationaleDiv = document.createElement('div');
    rationaleDiv.classList.add('rationale');
    rationaleDiv.innerHTML = `<strong>【解説】</strong><br>${q.rationale}`;
    questionBox.appendChild(rationaleDiv);

    // 次へボタンの設定
    if (currentQuestionIndex < QUIZ_COUNT - 1) {
        nextButton.textContent = '次の問題へ';
        nextButton.onclick = nextQuestion;
    } else {
        nextButton.textContent = '結果を見る';
        nextButton.onclick = showResults;
    }
    nextButton.disabled = false;
}

// 6. 次の問題へ進む
function nextQuestion() {
    currentQuestionIndex++;
    showQuestion();
}

// 7. 結果表示
function showResults() {
    // クイズコンテナを非表示にし、結果表示に切り替え
    quizContainer.style.display = 'none';
    resultDiv.style.padding = '30px';
    resultDiv.style.backgroundColor = '#ecf0f1';
    resultDiv.style.color = '#333';

    resultDiv.innerHTML = `
        <h2>✨ クイズ結果 ✨</h2>
        <p>あなたの正解数: ${score} / ${QUIZ_COUNT} 問</p>
        <p>テスト対策、お疲れさまでした！</p>
        <button id="restart-button">💪 もう一度挑戦する</button>
    `;
    
    document.getElementById('restart-button').addEventListener('click', startQuiz);
}

// クイズの起動
fetchQuizData();