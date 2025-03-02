(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const PRICE = {
  UNIT: 1e3,
  MAX: 1e5
};
const LOTTO = {
  MIN_RANDOM_VALUE: 1,
  MAX_RANDOM_VALUE: 45,
  LENGTH: 6
};
const KEYS = {
  FIRST: "1등",
  SECOND: "2등",
  THIRD: "3등",
  FOURTH: "4등",
  FIFTH: "5등"
};
const MATCHES = {
  [KEYS.FIRST]: 6,
  [KEYS.SECOND]: 5,
  [KEYS.THIRD]: 5,
  [KEYS.FOURTH]: 4,
  [KEYS.FIFTH]: 3
};
const WINNING = {
  [KEYS.FIRST]: {
    MATCH: MATCHES[KEYS.FIRST],
    LABEL: `${MATCHES[KEYS.FIRST]}개 일치`,
    PRIZES: 2e9
  },
  [KEYS.SECOND]: {
    MATCH: MATCHES[KEYS.SECOND],
    LABEL: `${MATCHES[KEYS.SECOND]}개 일치, 보너스 볼 일치`,
    PRIZES: 3e7
  },
  [KEYS.THIRD]: {
    MATCH: MATCHES[KEYS.THIRD],
    LABEL: `${MATCHES[KEYS.THIRD]}개 일치`,
    PRIZES: 15e5
  },
  [KEYS.FOURTH]: {
    MATCH: MATCHES[KEYS.FOURTH],
    LABEL: `${MATCHES[KEYS.FOURTH]}개 일치`,
    PRIZES: 5e4
  },
  [KEYS.FIFTH]: {
    MATCH: MATCHES[KEYS.FIFTH],
    LABEL: `${MATCHES[KEYS.FIFTH]}개 일치`,
    PRIZES: 5e3
  }
};
const Calculator = {
  getTotalPrize(winningCounts) {
    const total = Object.values(KEYS).reduce((total2, key) => {
      return total2 + WINNING[key].PRIZES * winningCounts[key];
    }, 0);
    return total;
  },
  getYieldRate(amount, totalPrize) {
    return totalPrize / amount * 100;
  },
  getQuantity(amount) {
    return amount / PRICE.UNIT;
  }
};
const LottoCenter = {
  getWinningCounts(lottos, winningInfo) {
    const winningCounts = {
      [KEYS.FIRST]: 0,
      [KEYS.SECOND]: 0,
      [KEYS.THIRD]: 0,
      [KEYS.FOURTH]: 0,
      [KEYS.FIFTH]: 0
    };
    lottos.forEach((lotto) => {
      const matchedKey = this.getMatchedKey(lotto, winningInfo);
      this.handleWinningCount(winningCounts, matchedKey);
    });
    return winningCounts;
  },
  getMatchedKey(lotto, winningInfo) {
    const { winning, bonus } = winningInfo;
    const matchedCount = this.getMatchedCount(lotto, winning);
    const hasBonus = this.hasBonus(lotto, bonus);
    return this.findMatchedKey(matchedCount, hasBonus);
  },
  getMatchedCount(lotto, winning) {
    return lotto.filter((num) => winning.includes(num)).length;
  },
  hasBonus(lotto, bonus) {
    return lotto.includes(bonus);
  },
  findMatchedKey(matchedCount, hasBonus) {
    if (matchedCount === WINNING[KEYS.FIRST].MATCH) return KEYS.FIRST;
    if (matchedCount === WINNING[KEYS.SECOND].MATCH && hasBonus)
      return KEYS.SECOND;
    if (matchedCount === WINNING[KEYS.THIRD].MATCH) return KEYS.THIRD;
    if (matchedCount === WINNING[KEYS.FOURTH].MATCH) return KEYS.FOURTH;
    if (matchedCount === WINNING[KEYS.FIFTH].MATCH) return KEYS.FIFTH;
  },
  handleWinningCount(winningCounts, matchedKey) {
    if (matchedKey) {
      this.increaseCount(winningCounts, matchedKey);
    }
  },
  increaseCount(winningCounts, matchedKey) {
    winningCounts[matchedKey] += 1;
  }
};
const generateLotto = () => {
  const lotto = /* @__PURE__ */ new Set();
  while (lotto.size < LOTTO.LENGTH) {
    const randomNumber = getLottoNumber();
    lotto.add(randomNumber);
  }
  return sortLottoNumbers(Array.from(lotto));
};
const getLottoNumber = () => {
  return Math.floor(
    Math.random() * (LOTTO.MAX_RANDOM_VALUE - LOTTO.MIN_RANDOM_VALUE + 1)
  ) + LOTTO.MIN_RANDOM_VALUE;
};
const sortLottoNumbers = (numbers) => {
  return numbers.sort((a, b) => a - b);
};
const getLottos = (purchaseAmount) => {
  const quantity = Calculator.getQuantity(purchaseAmount);
  return Array.from({ length: quantity }, () => generateLotto());
};
const getYieldRate = (winningCounts, purchaseAmount) => {
  const totalPrize = Calculator.getTotalPrize(winningCounts);
  return Calculator.getYieldRate(purchaseAmount, totalPrize);
};
const ERROR_MESSAGE = {
  NOT_A_NUMBER: "[ERROR] 숫자를 입력해주세요.",
  NOT_DIVIDED_1000: `[ERROR] ${PRICE.UNIT.toLocaleString()}원으로 나누어 떨어지는 숫자를 입력해주세요.`,
  UNDER_MIN_PRICE: `[ERROR] 최소 결제 금액은 ${PRICE.UNIT.toLocaleString()}원 이상입니다.`,
  EXCEED_MAX_PRICE: `[ERROR] 최대 결제 금액은 ${PRICE.MAX.toLocaleString()}원 미만입니다.`,
  LOTTO_LENGTH: `[ERROR] 당첨 번호는 ${LOTTO.LENGTH}개여야 합니다.`,
  DUPLICATE_WINNING_NUMBER: "[ERROR] 당첨 번호는 중복된 번호를 입력할 수 없습니다.",
  DUPLICATE_BONUS_NUMBER: "[ERROR] 입력하신 보너스 번호가 당첨 번호와 중복됩니다.",
  NUMBER_OUT_OF_RANGE: `[ERROR] ${LOTTO.MIN_RANDOM_VALUE}과 ${LOTTO.MAX_RANDOM_VALUE} 사이의 숫자를 입력해주세요.`
};
const validatePurchaseAmount = (price) => {
  if (isNaN(price)) throw new Error(ERROR_MESSAGE.NOT_A_NUMBER);
  if (price < PRICE.UNIT) throw new Error(ERROR_MESSAGE.UNDER_MIN_PRICE);
  if (price > PRICE.MAX) throw new Error(ERROR_MESSAGE.EXCEED_MAX_PRICE);
  if (price % PRICE.UNIT !== 0) throw new Error(ERROR_MESSAGE.NOT_DIVIDED_1000);
};
const validateWinningNumbers = (numbersArray) => {
  if (numbersArray.length < LOTTO.LENGTH)
    throw new Error(ERROR_MESSAGE.LOTTO_LENGTH);
  if (numbersArray.some((num) => isNaN(num)))
    throw new Error(ERROR_MESSAGE.NOT_A_NUMBER);
  if (numbersArray.length !== new Set(numbersArray).size)
    throw new Error(ERROR_MESSAGE.DUPLICATE_WINNING_NUMBER);
  if (numbersArray.some(
    (num) => num < LOTTO.MIN_RANDOM_VALUE || num > LOTTO.MAX_RANDOM_VALUE
  ))
    throw new Error(ERROR_MESSAGE.NUMBER_OUT_OF_RANGE);
};
const validateBonusNumber = (number, numbers) => {
  if (isNaN(number)) throw new Error(ERROR_MESSAGE.NOT_A_NUMBER);
  if (number < LOTTO.MIN_RANDOM_VALUE || number > LOTTO.MAX_RANDOM_VALUE)
    throw new Error(ERROR_MESSAGE.NUMBER_OUT_OF_RANGE);
  if (numbers.includes(number))
    throw new Error(ERROR_MESSAGE.DUPLICATE_BONUS_NUMBER);
};
const buyInfo = {
  amount: 0,
  lottos: []
};
const purchaseForm = document.querySelector(".purchase-form");
const purchaseInput = document.querySelector(".purchase-input");
const userLottoContainer = document.querySelector(".user-lotto-container");
const purchaseButton = document.querySelector(".purchase-button");
const winningInputContainer = document.querySelector(
  ".winning-input-container"
);
const winningModalContainer = document.querySelector(".modal-container");
purchaseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const amount = purchaseInput.value;
    validatePurchaseAmount(amount);
    buyInfo.amount = amount;
    const lottos = getLottos(amount);
    buyInfo.lottos.push(...lottos);
    userLottoContainer.appendChild(createLottoQuantity(amount));
    userLottoContainer.appendChild(createLottoList(lottos));
    winningInputContainer.appendChild(createWinningInputTitle());
    winningInputContainer.appendChild(createWinningInputForm());
    purchaseInput.setAttribute("disabled", "true");
    purchaseButton.classList.add("purchased");
    const firstWinningInput = document.getElementById("winning-number-1");
    firstWinningInput.focus();
  } catch (error) {
    alert(error.message);
  }
});
const createLottoQuantity = (amount) => {
  const quantity = Calculator.getQuantity(amount);
  const lottoQuantity = document.createElement("p");
  lottoQuantity.classList.add("user-lotto-quantity");
  lottoQuantity.textContent = `총 ${quantity}개를 구매했습니다.`;
  return lottoQuantity;
};
const createLottoList = (lottos) => {
  const lottoList = document.createElement("ul");
  lottoList.classList.add("user-lotto-list");
  lottos.forEach((lotto) => {
    lottoList.appendChild(createLottoItem(lotto));
  });
  return lottoList;
};
const createLottoItem = (lotto) => {
  const lottoItem = document.createElement("li");
  lottoItem.classList.add("user-lotto-item");
  const lottoIcon = document.createElement("span");
  lottoIcon.classList.add("user-lotto-icon");
  lottoIcon.textContent = "🎟️";
  const lottoNumbers = document.createElement("span");
  lottoNumbers.classList.add("user-lotto-numbers");
  lottoNumbers.textContent = lotto.join(", ");
  lottoItem.appendChild(lottoIcon);
  lottoItem.appendChild(lottoNumbers);
  return lottoItem;
};
const createWinningInputTitle = () => {
  const winningInputTitle = document.createElement("h4");
  winningInputTitle.classList.add("winning-input-title");
  winningInputTitle.textContent = "지난 주 당첨번호 6개와 보너스 번호 1개를 입력해주세요.";
  return winningInputTitle;
};
const createWinningInputForm = () => {
  const winningInputForm = document.createElement("form");
  const inputContainer = document.createElement("div");
  inputContainer.classList.add("winning-input-form");
  inputContainer.appendChild(createWinningNumberInput());
  inputContainer.appendChild(createBonusNumberInput());
  winningInputForm.appendChild(inputContainer);
  winningInputForm.appendChild(createWinningInputButton());
  return winningInputForm;
};
const createWinningNumberInput = () => {
  const winningNumberInputContainer = document.createElement("div");
  winningNumberInputContainer.classList.add("winning-input-item");
  const winningNumberInputLabel = document.createElement("label");
  winningNumberInputLabel.classList.add("winning-input-label");
  winningNumberInputLabel.textContent = "당첨 번호";
  winningNumberInputContainer.appendChild(winningNumberInputLabel);
  for (let i = 0; i < 6; i++) {
    const winningNumberInput = document.createElement("input");
    winningNumberInput.classList.add("winning-input");
    winningNumberInput.setAttribute("id", `winning-number-${i + 1}`);
    winningNumberInput.setAttribute("type", "number");
    winningNumberInput.setAttribute("min", "1");
    winningNumberInput.setAttribute("max", "45");
    winningNumberInput.setAttribute("required", "true");
    winningNumberInputContainer.appendChild(winningNumberInput);
  }
  return winningNumberInputContainer;
};
const createBonusNumberInput = () => {
  const bonusNumberInputContainer = document.createElement("div");
  bonusNumberInputContainer.classList.add("winning-input-item");
  const bonusNumberInputLabel = document.createElement("label");
  bonusNumberInputLabel.classList.add("winning-input-label");
  bonusNumberInputLabel.textContent = "보너스 번호";
  bonusNumberInputContainer.appendChild(bonusNumberInputLabel);
  const bonusNumberInputInput = document.createElement("input");
  bonusNumberInputInput.classList.add("winning-input");
  bonusNumberInputInput.classList.add("bonus-input");
  bonusNumberInputInput.setAttribute("id", "bonus-number");
  bonusNumberInputInput.setAttribute("type", "number");
  bonusNumberInputInput.setAttribute("min", "1");
  bonusNumberInputInput.setAttribute("max", "45");
  bonusNumberInputInput.setAttribute("required", "true");
  bonusNumberInputContainer.appendChild(bonusNumberInputInput);
  return bonusNumberInputContainer;
};
const createWinningInputButton = () => {
  const winningInputButton = document.createElement("button");
  winningInputButton.classList.add("winning-input-button");
  winningInputButton.textContent = "결과 확인하기";
  winningInputButton.setAttribute("type", "submit");
  return winningInputButton;
};
winningInputContainer.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const winningNumbers = [];
    const bonusNumber = document.getElementById("bonus-number").value;
    for (let i = 0; i < 6; i++) {
      const winningNumberInput = document.getElementById(
        `winning-number-${i + 1}`
      );
      winningNumbers.push(winningNumberInput.value);
    }
    validateWinningNumbers(winningNumbers);
    validateBonusNumber(bonusNumber, winningNumbers);
    document.querySelectorAll(".winning-input").forEach((input) => {
      input.setAttribute("disabled", "true");
    });
    const winningCount = LottoCenter.getWinningCounts(buyInfo.lottos, {
      winning: winningNumbers.map(Number),
      bonus: Number(bonusNumber)
    });
    const yieldRate = getYieldRate(winningCount, buyInfo.amount);
    const winningModalContent = createWinningResultContent(
      winningCount,
      yieldRate
    );
    winningModalContainer.classList.add("winning-result-dialog-background");
    winningModalContainer.innerHTML = winningModalContent;
    document.body.style.overflow = "hidden";
    const restartButton = document.querySelector(
      ".winning-result-restart-button"
    );
    const closeButton = document.querySelector(".winning-result-close-button");
    winningModalContainer.addEventListener("click", (e2) => {
      if (e2.target === winningModalContainer) {
        closeModal();
      }
    });
    closeButton.addEventListener("click", closeModal);
    document.addEventListener("keydown", (e2) => {
      if (e2.key === "Escape") {
        closeModal();
      }
    });
    restartButton.addEventListener("click", () => {
      resetGame();
    });
  } catch (error) {
    alert(error.message);
    const firstWinningInput = document.getElementById("winning-number-1");
    firstWinningInput.focus();
  }
});
const closeModal = () => {
  winningModalContainer.innerHTML = "";
  winningModalContainer.classList.remove("winning-result-dialog-background");
  document.body.style.overflow = "auto";
};
const resetGame = () => {
  buyInfo.amount = 0;
  buyInfo.lottos = [];
  purchaseInput.value = "";
  purchaseButton.classList.remove("purchased");
  purchaseInput.removeAttribute("disabled");
  userLottoContainer.innerHTML = "";
  winningInputContainer.innerHTML = "";
  closeModal();
};
const createWinningResultContent = (winningCount, yieldRate) => {
  return `<dialog class="winning-result-dialog" open>
        <button class="winning-result-close-button">
          <img src="../public/Vector.png" alt="닫기" />
        </button>
        <h3 class="winning-result-title">🏆 당첨 통계 🏆</h3>
        <div class="winning-result-table-container">
          <div class="winning-result-table">
            <p class="winning-result-table-title">일치 갯수</p>
            <p class="winning-result-table-title">당첨금</p>
            <p class="winning-result-table-title">당첨 갯수</p>
          </div>
          <div class="winning-result-table">
            <p class="winning-result-table-item">3개</p>
            <p class="winning-result-table-item">5,000</p>
            <p class="winning-result-table-item">${winningCount["5등"]}개</p>
          </div>
          <div class="winning-result-table">
            <p class="winning-result-table-item">4개</p>
            <p class="winning-result-table-item">50,000</p>
            <p class="winning-result-table-item">${winningCount["4등"]}개</p>
          </div>
          <div class="winning-result-table">
            <p class="winning-result-table-item">5개</p>
            <p class="winning-result-table-item">1,500,000</p>
            <p class="winning-result-table-item">${winningCount["3등"]}개</p>
          </div>
          <div class="winning-result-table">
            <p class="winning-result-table-item">5개 + 보너스볼</p>
            <p class="winning-result-table-item">30,000,000</p>
            <p class="winning-result-table-item">${winningCount["2등"]}개</p>
          </div>
          <div class="winning-result-table">
            <p class="winning-result-table-item">6개</p>
            <p class="winning-result-table-item">2,000,000,000</p>
            <p class="winning-result-table-item">${winningCount["1등"]}개</p>
          </div>
        </div>
        <p class="winning-result-total-rate">당신의 총 수익률은 ${yieldRate.toFixed(
    1
  )}%입니다.</p>
        <button class="winning-result-restart-button">다시 시작하기</button>
      </dialog>`;
};
