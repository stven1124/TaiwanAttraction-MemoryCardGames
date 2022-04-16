const cards = document.querySelectorAll('.memory_card');
const socopeBoard = document.getElementById("socopeBoard");
const audioIcon = document.querySelector(".audio_icon");
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let allScope = getScope(0);
let disableFlipCard = true;
let audioMute = false;

window.addEventListener("resize", () => {
  startAlert();
});

/* 翻牌音效 */
const flipCardAudio = new Howl({
  src: ['audio/flipCard.mp3']
});

/* 勝利音效 */
const winAudio = new Howl({
  src: ['audio/win.mp3']
});

/* 點擊翻牌 */
function flipCard(e) {
  // 防止移除彈窗直接翻牌
  if (disableFlipCard) {
    swal({
      closeOnClickOutside: false,
      icon: "error",
      text: `請重新整理頁面後，點選"準備好了!"再開始遊戲！`,
      buttons: false,
      timer: 1500,
    });
    return;
  };

  // 沒配對成功的話，就把牌蓋起來
  if (lockBoard) return;

  // 避免翻同一張牌當做第二張
  if (this === firstCard) return;

  flipCardAudio.play();

  this.classList.add('flip');

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    // this => 已經翻開的卡片
    firstCard = this;
    return;
  }
  secondCard = this;

  checkMatchCards();

  // 遊戲結束
  if (Array.from(cards).every((card) => card.className === "memory_card flip")) {
    winAudio.play();
    setTimeout(() => {
      swal({
        closeOnClickOutside: false,
        closeOnEsc: false,
        icon: "success",
        text: `得分：${allScope.value()}/60，${socopeAlert}`,
        buttons: "重新開始",
      }).then(() => {
        restart();
        allScope.zeroing();
        socopeBoard.innerHTML = `分數：${allScope.value()}`;
      });
    }, 1000);
    switch (allScope.value()) {
      case 0:
        socopeAlert = "可惜一題都沒答對，再接再厲！";
        break;
      case 10:
      case 20:
        socopeAlert = "還得再磨練磨練喔！";
        break;
      case 30:
      case 40:
        socopeAlert = "再努力一點，快要有高標準了！";
        break;
      case 50:
        socopeAlert = "再努力一點就要全部答對囉！";
        break;
      case 60:
        socopeAlert = "全部都答對!太神啦！";
        break;
    };
  };

};

/* 音效圖示 */
function audioMuteChange() {
  audioMute = !audioMute;
  flipCardAudio.mute(audioMute);
  winAudio.mute(audioMute);
  audioIcon.classList.toggle('fa-volume-high');
  audioIcon.classList.toggle('fa-volume-xmark');
};

/* 重新開始 */
function restart() {
  cards.forEach(card => card.classList.remove('flip'));
  shuffleCards();
  cards.forEach(card => card.addEventListener('click', flipCard));
  allflipCards();
};

/* 計分板 */
function getScope(initScope) {
  var scope = initScope || 0;
  return {
    gainPoint: function (point) {
      scope += point;
    },
    deductPoint: function (point) {
      if (scope > 0) {
        scope -= point;
      }
    },
    zeroing: function () {
      scope = 0;
    },
    value: function () {
      return scope;
    }
  }
}

/* 確認兩張牌是否匹配 */
function checkMatchCards() {
  // 牌組配對成功 => isMatch
  // 就不可以再點擊那組牌 => disableCards()
  // 配對錯誤就把該牌組蓋起來 => coverCards()
  let isMatch = firstCard.dataset.attraction === secondCard.dataset.attraction;
  isMatch ? disableCards() : coverCards();
}

/* 配對成功，就不可以再點擊這組牌 */
function disableCards() {
  allScope.gainPoint(10);
  socopeBoard.innerHTML = `分數：${allScope.value()}`;
  // 移除監聽事件，釋放記憶體
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  resetCards();
}

/* 配對失敗，把牌蓋起來 */
function coverCards() {
  allScope.deductPoint(10);
  socopeBoard.innerHTML = `分數：${allScope.value()}`;
  lockBoard = true;
  // 移除flip，把牌蓋起來
  setTimeout(() => {
    flipCardAudio.play();
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    resetCards();
  }, 800);
};

/* 還原牌的變數 */
function resetCards() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
};

/* 遊戲開始，翻開所有牌3秒 */
function allflipCards() {
  flipCardAudio.play();
  disableFlipCard = false;
  cards.forEach(card => {
    card.classList.add('flip');
    card.removeEventListener('click', flipCard);
  });
  setTimeout(() => {
    cards.forEach(card => {
      card.classList.remove('flip');
      card.addEventListener('click', flipCard);
    });
    flipCardAudio.play();
  }, 3000);
};

/* 洗牌，將牌隨機排序 */
function shuffleCards() {
  cards.forEach(card => {
    let randomPos = Math.floor(Math.random() * 12);
    card.style.order = randomPos;
  });
};

/* 遊戲開始時的彈跳視窗 */
function startAlert() {
  if (window.orientation === 90 || window.orientation === -90) {
    swal({
      closeOnClickOutside: false,
      closeOnEsc: false,
      icon: "warning",
      text: `請將手機豎直，將獲得更好的遊戲體驗！`,
      buttons: false,
    });
    return;
  };
  swal({
    closeOnClickOutside: false,
    buttons: "準備好了!",
    title: "記憶翻牌遊戲 | 遊戲規則說明",
    text: `◆這是一個翻牌的遊戲，所有的卡片都是由台灣景點組成的。
          ◆滑鼠點擊左鍵就可翻牌，翻錯會再蓋起來，直到選出正確的配對唷！
          ◆遊戲開始時，有三秒鐘的時間可以記住牌，三秒後牌會蓋起來。
          ◆評分規則：
            ．組合成功+10分，組合失敗-10分。
          ◆評分標準：
            ．0分：可惜一題都沒答對，再接再厲！
            ．10-20分：還得再磨練磨練喔！
            ．20-40分：再努力一點，快要有高標準了！
            ．50分：再努力一點就要全部答對囉！
            ．60分：全部都答對!太神啦！`,
    className: "swal-title,swal-overlay,swal-text,",
  })
    .then(() => {
      swal({
        closeOnClickOutside: false,
        icon: "info",
        text: `挑戰準備開始！`,
        buttons: false,
        timer: 1500,
      }),
        shuffleCards(),
        setTimeout(() => {
          allflipCards();
        }, 1500);
    })
};
startAlert();

/* 監聽每張卡片有沒有被點擊，有被點擊執行函式flipCard() */
cards.forEach(card => card.addEventListener('click', flipCard));

/* 將計分板輸出到HTML上 */
socopeBoard.innerHTML = `分數：${allScope.value()}`;

/* 監聽音效圖示有無被點擊 */
audioIcon.addEventListener('click', audioMuteChange);