const cards = document.querySelectorAll('.memory_card');

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

function flipCard(e) {
   // 沒配對成功的話，就把牌蓋起來
   if (lockBoard) return;

   // 避免翻同一張牌當做第二張
   if (this === firstCard) return;

  this.classList.add('flip');

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    // this => 已經翻開的卡片
    firstCard = this;
    return;
  }
  console.log(e);
  secondCard = this;

  checkMatchCards();
  
  // 遊戲結束
  if(Array.from(cards).every((card) => card.className === "memory_card flip")){
    setTimeout(() => {
      swal({
        closeOnClickOutside: false,
          icon: "success",
          text: `恭喜您挑戰成功！`,
          buttons: "重新開始",
          value: restart,
        }).then((value) => {
          restart();
        });
    }, 1000);
  }
};


function restart() {
  cards.forEach(card => card.classList.remove('flip'));
  shuffleCards();
  cards.forEach(card => card.addEventListener('click', flipCard));
};



function checkMatchCards() {
  // 牌組配對成功 => isMatch
  // 就不可以再點擊那組牌 => disableCards()
  // 配對錯誤就把該牌組蓋起來 => coverCards()
  let isMatch = firstCard.dataset.attraction === secondCard.dataset.attraction;
  isMatch ? disableCards() : coverCards();
}

function disableCards() {
  // 移除監聽事件，釋放記憶體
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  resetCards();
}

function coverCards() {
  lockBoard = true;

  // 移除flip，把牌蓋起來
  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    resetCards();
  }, 800);
}

function resetCards() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function shuffleCards() {
  cards.forEach(card => {
    let randomPos = Math.floor(Math.random() * 12);
    card.style.order = randomPos;
  });
};

(function startAlert() {
  swal({
    closeOnClickOutside: false,
    buttons: "準備好了!",
    title: "記憶翻牌遊戲 | 遊戲規則說明",
    text: `◆這是一個翻牌的遊戲，所有的卡片都是由台灣景點組成的。
          ◆滑鼠點擊左鍵就可翻牌，翻錯會再蓋起來，直到選出正確的配對唷！
          ◆翻牌不但有消除的樂趣，還能考驗你的記憶力。快來試一試吧！`,
    className: "swal-title,swal-overlay,swal-text,"
  })
  .then(() => {
    swal({
      closeOnClickOutside: false,
      icon: "info",
      text: `挑戰準備開始！`,
      buttons: false,
      timer: 1500,
    });
  }),shuffleCards();
})();

cards.forEach(card => card.addEventListener('click', flipCard));

