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
const PRICE = {
  UNIT: 1e3,
  MAX: 1e5
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
const create = {
  lottoQuantity: (amount) => {
    const quantity = Calculator.getQuantity(amount);
    const lottoQuantity = document.createElement("p");
    lottoQuantity.classList.add("user-lotto-quantity");
    lottoQuantity.textContent = `총 ${quantity}개를 구매했습니다.`;
    return lottoQuantity;
  },
  lottoList: (lottos) => {
    const lottoList = document.createElement("ul");
    lottoList.classList.add("user-lotto-list");
    lottos.forEach((lotto) => {
      lottoList.appendChild(create.lottoItem(lotto));
    });
    return lottoList;
  },
  lottoItem: (lotto) => {
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
  },
  winningInputTitle: () => {
    const winningInputTitle = document.createElement("h4");
    winningInputTitle.classList.add("winning-input-title");
    winningInputTitle.textContent = "지난 주 당첨번호 6개와 보너스 번호 1개를 입력해주세요.";
    return winningInputTitle;
  },
  winningInputForm: () => {
    const winningInputForm = document.createElement("form");
    const inputContainer = document.createElement("div");
    inputContainer.classList.add("winning-input-box");
    inputContainer.appendChild(create.winningNumberInput());
    inputContainer.appendChild(create.bonusNumberInput());
    winningInputForm.appendChild(inputContainer);
    winningInputForm.appendChild(create.winningInputButton());
    return winningInputForm;
  },
  winningNumberInput: () => {
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
  },
  bonusNumberInput: () => {
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
  },
  winningInputButton: () => {
    const winningInputButton = document.createElement("button");
    winningInputButton.classList.add("winning-input-button");
    winningInputButton.textContent = "결과 확인하기";
    winningInputButton.setAttribute("type", "submit");
    return winningInputButton;
  },
  modalContent: (winningCount, yieldRate) => {
    return `
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
          `;
  }
};
const select = {
  purchaseForm: document.querySelector(".purchase-form"),
  purchaseInput: document.querySelector(".purchase-input"),
  userLottoContainer: document.querySelector(".user-lotto-container"),
  purchaseButton: document.querySelector(".purchase-button"),
  winningInputContainer: document.querySelector(".winning-input-container"),
  winningModalContainer: document.querySelector(".modal-container"),
  winningTableContainer: document.querySelector(
    ".winning-result-table-container"
  ),
  winningDialog: document.querySelector(".winning-result-dialog"),
  closeButton: document.querySelector(".winning-result-close-button"),
  restartButton: document.querySelector(".winning-result-restart-button")
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
const purchaseForm = select.purchaseForm;
const purchaseInput = select.purchaseInput;
const userLottoContainer = select.userLottoContainer;
const purchaseButton = select.purchaseButton;
const winningInputContainer = select.winningInputContainer;
const winningModalContainer = select.winningModalContainer;
const winningTableContainer = select.winningTableContainer;
const winningDialog = select.winningDialog;
const closeButton = select.closeButton;
const restartButton = select.restartButton;
purchaseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const amount = purchaseInput.value;
    validatePurchaseAmount(amount);
    buyInfo.amount = amount;
    const lottos = getLottos(amount);
    buyInfo.lottos.push(...lottos);
    userLottoContainer.appendChild(create.lottoQuantity(amount));
    userLottoContainer.appendChild(create.lottoList(lottos));
    winningInputContainer.appendChild(create.winningInputTitle());
    winningInputContainer.appendChild(create.winningInputForm());
    purchaseInput.setAttribute("disabled", "true");
    purchaseButton.classList.add("purchased");
    const firstWinningInput = document.getElementById("winning-number-1");
    firstWinningInput.focus();
  } catch (error) {
    alert(error.message);
  }
});
winningInputContainer.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const winningInfo = {
      winning: getWinningNumbers(),
      bonus: getBonusNumber()
    };
    validateWinningInputs(winningInfo);
    disableWinningInputs();
    const winningCount = LottoCenter.getWinningCounts(
      buyInfo.lottos,
      winningInfo
    );
    const yieldRate = getYieldRate(winningCount, buyInfo.amount);
    const winningModalContent = create.modalContent(winningCount, yieldRate);
    winningModalContainer.classList.add("winning-result-dialog-background");
    winningTableContainer.innerHTML = winningModalContent;
    winningDialog.open = true;
    document.body.style.overflow = "hidden";
    closeButton.addEventListener("click", closeModal);
    winningModalContainer.addEventListener("click", (e2) => {
      if (e2.target === winningModalContainer) {
        closeModal();
      }
    });
    document.addEventListener("keydown", (e2) => {
      if (e2.key === "Escape") {
        closeModal();
      }
    });
    restartButton.addEventListener("click", restartGame);
  } catch (error) {
    alert(error.message);
    const firstWinningInput = document.getElementById("winning-number-1");
    firstWinningInput.focus();
  }
});
const disableWinningInputs = () => {
  document.querySelectorAll(".winning-input").forEach((input) => {
    input.setAttribute("disabled", "true");
  });
};
const getWinningNumbers = () => {
  const winningNumbers = [];
  for (let i = 0; i < 6; i++) {
    const winningNumberInput = document.getElementById(
      `winning-number-${i + 1}`
    );
    winningNumbers.push(winningNumberInput.value);
  }
  return winningNumbers.map(Number);
};
const getBonusNumber = () => {
  const bonusNumberInput = document.getElementById("bonus-number");
  return Number(bonusNumberInput.value);
};
const validateWinningInputs = (winningInfo) => {
  validateWinningNumbers(winningInfo.winning);
  validateBonusNumber(winningInfo.bonus, winningInfo.winning);
};
const closeModal = () => {
  winningTableContainer.innerHTML = "";
  winningDialog.close();
  winningModalContainer.classList.remove("winning-result-dialog-background");
  document.body.style.overflow = "auto";
};
const restartGame = () => {
  buyInfo.amount = 0;
  buyInfo.lottos = [];
  purchaseInput.value = "";
  purchaseButton.classList.remove("purchased");
  purchaseInput.removeAttribute("disabled");
  userLottoContainer.innerHTML = "";
  winningInputContainer.innerHTML = "";
  closeModal();
};
