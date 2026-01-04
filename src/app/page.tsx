"use client";
import React, { useState } from 'react';
import { Play, RotateCcw, Check, Music, Settings } from 'lucide-react';

// --- データ定義 ---

// 調号データ（シャープ・フラットの数と各言語での音名表記）
// count: 正の値はシャープの数、負の値はフラットの数
const KEY_DATA = [
  { count: 0, major: { en: 'C', ja: 'ハ', de: 'C' }, minor: { en: 'A', ja: 'イ', de: 'a' } },
  { count: 1, major: { en: 'G', ja: 'ト', de: 'G' }, minor: { en: 'E', ja: 'ホ', de: 'e' } },
  { count: 2, major: { en: 'D', ja: 'ニ', de: 'D' }, minor: { en: 'B', ja: 'ロ', de: 'h' } },
  { count: 3, major: { en: 'A', ja: 'イ', de: 'A' }, minor: { en: 'F#', ja: '嬰ヘ', de: 'fis' } },
  { count: 4, major: { en: 'E', ja: 'ホ', de: 'E' }, minor: { en: 'C#', ja: '嬰ハ', de: 'cis' } },
  { count: 5, major: { en: 'B', ja: 'ロ', de: 'H' }, minor: { en: 'G#', ja: '嬰ト', de: 'gis' } },
  { count: 6, major: { en: 'F#', ja: '嬰ヘ', de: 'Fis' }, minor: { en: 'D#', ja: '嬰ニ', de: 'dis' } },
  { count: 7, major: { en: 'C#', ja: '嬰ハ', de: 'Cis' }, minor: { en: 'A#', ja: '嬰イ', de: 'ais' } },
  { count: -1, major: { en: 'F', ja: 'ヘ', de: 'F' }, minor: { en: 'D', ja: 'ニ', de: 'd' } },
  { count: -2, major: { en: 'Bb', ja: '変ロ', de: 'B' }, minor: { en: 'G', ja: 'ト', de: 'g' } },
  { count: -3, major: { en: 'Eb', ja: '変ホ', de: 'Es' }, minor: { en: 'C', ja: 'ハ', de: 'c' } },
  { count: -4, major: { en: 'Ab', ja: '変イ', de: 'As' }, minor: { en: 'F', ja: 'ヘ', de: 'f' } },
  { count: -5, major: { en: 'Db', ja: '変ニ', de: 'Des' }, minor: { en: 'Bb', ja: '変ロ', de: 'b' } },
  { count: -6, major: { en: 'Gb', ja: '変ト', de: 'Ges' }, minor: { en: 'Eb', ja: '変ホ', de: 'es' } },
  { count: -7, major: { en: 'Cb', ja: '変ハ', de: 'Ces' }, minor: { en: 'Ab', ja: '変イ', de: 'as' } },
];

// 回答表示フォーマット設定
const ANSWER_FORMATS = {
  ja: { label: '日本語', sample: 'ハ長調', majorSuffix: '長調', minorSuffix: '短調' },
  en: { label: '英語', sample: 'C Major', majorSuffix: ' Major', minorSuffix: ' Minor' },
  de: { label: 'ドイツ語', sample: 'C-Dur', majorSuffix: '-Dur', minorSuffix: '-moll' },
};

// 五線譜描画用の定数
const STAFF_Y = [20, 40, 60, 80, 100];
const SHARP_POSITIONS = {
  treble: [20, 50, 14, 40, 70, 30, 60],
  bass: [40, 70, 30, 60, 90, 50, 80],
};
const FLAT_POSITIONS = {
  treble: [55, 25, 65, 35, 75, 45, 85],
  bass: [75, 45, 85, 55, 95, 65, 105],
};

// --- コンポーネント ---

const MusicStaff = ({ clef, keyCount }: any) => {
  const isSharp = keyCount > 0;
  const count = Math.abs(keyCount);
  const positions = isSharp 
    ? (clef === 'treble' ? SHARP_POSITIONS.treble : SHARP_POSITIONS.bass)
    : (clef === 'treble' ? FLAT_POSITIONS.treble : FLAT_POSITIONS.bass);

  const symbol = isSharp ? '♯' : '♭';
  const clefSymbol = clef === 'treble' ? '𝄞' : '𝄢';
  const clefY = clef === 'treble' ? 98 : 90;

  return (
    <div className="flex justify-center items-center bg-white p-4 rounded-lg shadow-md border-2 border-gray-200 mb-6 w-full max-w-md mx-auto h-48">
      <svg width="300" height="145" viewBox="0 0 300 145">
        {STAFF_Y.map((y, i) => (
          <line key={i} x1="10" y1={y} x2="290" y2={y} stroke="black" strokeWidth="2" />
        ))}
        <text x="10" y={clefY} fontSize="110" fontFamily="serif">{clefSymbol}</text>
        {Array.from({ length: count }).map((_, i) => (
          <text 
            key={i} 
            x={80 + (i * 25)} 
            y={positions[i] + 15}
            fontSize="40" 
            fontFamily="serif"
          >
            {symbol}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default function MusicKeyQuiz() {
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [answerLang, setAnswerLang] = useState('ja'); // 回答の言語設定
  const [gameState, setGameState] = useState('menu'); // menu, playing, result
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  // クイズを開始する関数
  const startQuiz = () => {
    const newQuestions = [];
    for (let i = 0; i < 10; i++) {
      const randomKeyIndex = Math.floor(Math.random() * KEY_DATA.length);
      const targetKeyData = KEY_DATA[randomKeyIndex];
      const isMajor = Math.random() > 0.5;
      const correctType = isMajor ? 'major' : 'minor';
      const clef = Math.random() > 0.5 ? 'treble' : 'bass';

      let options = [{ ...targetKeyData, type: correctType }];
      
      while (options.length < 4) {
        const distractorIndex = Math.floor(Math.random() * KEY_DATA.length);
        const distractorType = Math.random() > 0.5 ? 'major' : 'minor';
        const distractor = KEY_DATA[distractorIndex];
        const isDuplicate = options.some(opt => 
          opt.count === distractor.count && opt.type === distractorType
        );
        if (!isDuplicate) {
          options.push({ ...distractor, type: distractorType });
        }
      }
      
      options = options.sort(() => Math.random() - 0.5);

      newQuestions.push({
        correctKey: targetKeyData,
        correctType: correctType,
        clef: clef,
        options: options
      });
    }

    setQuestions(newQuestions);
    setScore(0);
    setCurrentQIndex(0);
    setGameState('playing');
    setStartTime(Date.now());
    setIsAnswerChecked(false);
    setSelectedAnswer(null);
  };

  const handleAnswer = (option: any, index: any) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(index);
    setIsAnswerChecked(true);
    const currentQ = questions[currentQIndex];
    if (option.count === currentQ.correctKey.count && option.type === currentQ.correctType) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQIndex < 9) {
      setCurrentQIndex(prev => prev + 1);
      setIsAnswerChecked(false);
      setSelectedAnswer(null);
    } else {
      const endTime = Date.now();
      const seconds = Math.floor((endTime - startTime)/1000);
      setElapsedTime(seconds);
      setGameState('result');
    }
  };

  // 選択された回答言語に基づいてテキストを生成
  const getAnswerText = (option: any) => {
    const format = (ANSWER_FORMATS as any)[answerLang];
    const name = (option[option.type] as any)[answerLang];
    const suffix = option.type === 'major' ? format.majorSuffix : format.minorSuffix;
    return `${name}${suffix}`;
  };

  const currentQ = questions[currentQIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans text-slate-800">
      
      {/* ヘッダー (常に日本語) */}
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Music className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold">調号クイズ</h1>
        </div>
        <p className="text-gray-500 text-sm">正しい調号を答えよう</p>
      </header>

      {/* --- メニュー画面 --- */}
      {gameState === 'menu' && (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full">
          <p className="mb-6 text-gray-700 font-medium">
            全10問出題されます。<br/>
            回答に使用する言語を選んでください。
          </p>
          
          {/* 回答言語選択エリア */}
          <div className="mb-8 space-y-3 text-left">
            {Object.keys(ANSWER_FORMATS).map((langKey) => (
              <label 
                key={langKey} 
                className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  answerLang === langKey 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    answerLang === langKey ? 'border-indigo-600' : 'border-gray-300'
                  }`}>
                    {answerLang === langKey && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                  </div>
                  <span className="font-bold">{(ANSWER_FORMATS as any)[langKey].label}</span>
                </div>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                  例: {(ANSWER_FORMATS as any)[langKey].sample}
                </span>
                <input 
                  type="radio" 
                  name="lang" 
                  value={langKey} 
                  checked={answerLang === langKey}
                  onChange={() => setAnswerLang(langKey)}
                  className="hidden" 
                />
              </label>
            ))}
          </div>

          <button
            onClick={startQuiz}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 shadow-md"
          >
            <Play size={20} />
            クイズを開始する
          </button>
        </div>
      )}

      {/* --- クイズ画面 --- */}
      {gameState === 'playing' && currentQ && (
        <div className="w-full max-w-lg">
          <div className="flex justify-between text-sm font-semibold text-gray-500 mb-2">
            <span>第 {currentQIndex + 1} 問 / 10問</span>
            <span>スコア: {score}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${((currentQIndex + 1) / 10) * 100}%` }}
            ></div>
          </div>

          <MusicStaff clef={currentQ.clef} keyCount={currentQ.correctKey.count} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQ.options.map((option: any, index: number) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = 
                isAnswerChecked && 
                option.count === currentQ.correctKey.count && 
                option.type === currentQ.correctType;
              
              let btnClass = "py-4 px-2 rounded-lg border-2 text-lg font-medium transition-all ";
              
              if (isAnswerChecked) {
                if (isCorrectOption) {
                  btnClass += "bg-green-100 border-green-500 text-green-700";
                } else if (isSelected) {
                  btnClass += "bg-red-100 border-red-500 text-red-700";
                } else {
                  btnClass += "bg-gray-50 border-gray-200 text-gray-400 opacity-60";
                }
              } else {
                btnClass += "bg-white border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-gray-800 shadow-sm";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option, index)}
                  disabled={isAnswerChecked}
                  className={btnClass}
                >
                  {getAnswerText(option)}
                </button>
              );
            })}
          </div>

          {isAnswerChecked && (
            <div className="mt-6 text-center animate-fade-in">
              <p className={`text-xl font-bold mb-4 ${
                  questions[currentQIndex].correctKey.count === questions[currentQIndex].options[selectedAnswer as any].count &&
                  questions[currentQIndex].correctType === questions[currentQIndex].options[selectedAnswer as any].type
                  ? 'text-green-600' : 'text-red-600'
              }`}>
                {questions[currentQIndex].correctKey.count === questions[currentQIndex].options[selectedAnswer as any].count &&
                 questions[currentQIndex].correctType === questions[currentQIndex].options[selectedAnswer as any].type
                 ? '正解!' : '不正解...'}
              </p>
              <button
                onClick={nextQuestion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-8 rounded-full shadow-lg transition-transform hover:-translate-y-1"
              >
                {currentQIndex < 9 ? '次へ' : '結果を見る'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- 結果画面 --- */}
      {gameState === 'result' && (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full animate-fade-in-up">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">結果発表</h2>
          
          <div className="mb-4">
            <span className="text-6xl font-black text-indigo-600">{score}</span>
            <span className="text-2xl text-gray-400"> / 10点</span>
          </div>

          <div className="mb-8 text-xl font-bold text-gray-500">
            タイム: {Math.floor(elapsedTime / 60)}分 {elapsedTime % 60}秒
          </div>

          <p className="mb-8 text-gray-600 text-lg">
            {score === 10 ? '完璧です！素晴らしい！' : 
             score >= 7 ? 'よくできました！' : 
             '繰り返し練習してみましょう！'}
          </p>

          <button
            onClick={() => setGameState('menu')}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
          >
            <RotateCcw size={20} />
            もう一度遊ぶ
          </button>
        </div>
      )}
    </div>
  );
}