"use strict";

const STORAGE_KEY = "simple-flashcards-v1";
const THEME_KEY = "simple-flashcards-theme";

const elements = {
  form: document.querySelector("#flashcardForm"),
  formTitle: document.querySelector("#formTitle"),
  cardId: document.querySelector("#cardId"),
  question: document.querySelector("#question"),
  answer: document.querySelector("#answer"),
  category: document.querySelector("#category"),
  saveButton: document.querySelector("#saveButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  formMessage: document.querySelector("#formMessage"),
  cardList: document.querySelector("#cardList"),
  cardTemplate: document.querySelector("#cardTemplate"),
  emptyState: document.querySelector("#emptyState"),
  cardCount: document.querySelector("#cardCount"),
  searchInput: document.querySelector("#searchInput"),
  categoryFilter: document.querySelector("#categoryFilter"),
  studyButton: document.querySelector("#studyButton"),
  studyDialog: document.querySelector("#studyDialog"),
  studyProgress: document.querySelector("#studyProgress"),
  studySide: document.querySelector("#studySide"),
  studyText: document.querySelector("#studyText"),
  studyCard: document.querySelector("#studyCard"),
  previousButton: document.querySelector("#previousButton"),
  nextButton: document.querySelector("#nextButton"),
  shuffleButton: document.querySelector("#shuffleButton"),
  closeStudyButton: document.querySelector("#closeStudyButton"),
  themeButton: document.querySelector("#themeButton")
};

let cards = loadCards();
let studyCards = [];
let studyIndex = 0;
let showingAnswer = false;

function loadCards() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getFilteredCards() {
  const term = elements.searchInput.value.trim().toLowerCase();
  const selectedCategory = elements.categoryFilter.value;

  return cards.filter((card) => {
    const matchesTerm = !term || [card.question, card.answer, card.category].some((value) => value.toLowerCase().includes(term));
    const matchesCategory = selectedCategory === "all" || card.category === selectedCategory;
    return matchesTerm && matchesCategory;
  });
}

function renderCards() {
  const filteredCards = getFilteredCards();
  elements.cardList.replaceChildren();

  filteredCards.forEach((card) => {
    const fragment = elements.cardTemplate.content.cloneNode(true);
    const article = fragment.querySelector(".flashcard-item");
    article.dataset.id = card.id;
    fragment.querySelector(".category-badge").textContent = card.category || "Uncategorized";
    fragment.querySelector(".card-question").textContent = card.question;
    fragment.querySelector(".card-answer").textContent = card.answer;
    fragment.querySelector(".edit-button").addEventListener("click", () => beginEdit(card.id));
    fragment.querySelector(".delete-button").addEventListener("click", () => deleteCard(card.id));
    elements.cardList.append(fragment);
  });

  const totalLabel = `${cards.length} ${cards.length === 1 ? "card" : "cards"}`;
  elements.cardCount.textContent = filteredCards.length === cards.length ? totalLabel : `${filteredCards.length} shown, ${totalLabel} total`;
  elements.emptyState.classList.toggle("hidden", filteredCards.length > 0);
  elements.studyButton.disabled = filteredCards.length === 0;
  refreshCategoryFilter();
}

function refreshCategoryFilter() {
  const current = elements.categoryFilter.value;
  const categories = [...new Set(cards.map((card) => card.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  elements.categoryFilter.replaceChildren(new Option("All categories", "all"));
  categories.forEach((category) => elements.categoryFilter.add(new Option(category, category)));
  elements.categoryFilter.value = categories.includes(current) ? current : "all";
}

function resetForm() {
  elements.form.reset();
  elements.cardId.value = "";
  elements.formTitle.textContent = "Add a flashcard";
  elements.saveButton.textContent = "Add card";
  elements.cancelEditButton.classList.add("hidden");
}

function beginEdit(id) {
  const card = cards.find((item) => item.id === id);
  if (!card) return;

  elements.cardId.value = card.id;
  elements.question.value = card.question;
  elements.answer.value = card.answer;
  elements.category.value = card.category;
  elements.formTitle.textContent = "Edit flashcard";
  elements.saveButton.textContent = "Save changes";
  elements.cancelEditButton.classList.remove("hidden");
  elements.question.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteCard(id) {
  const card = cards.find((item) => item.id === id);
  if (!card || !window.confirm(`Delete this card?\n\n${card.question}`)) return;

  cards = cards.filter((item) => item.id !== id);
  saveCards();
  if (elements.cardId.value === id) resetForm();
  showMessage("Card deleted.");
  renderCards();
}

function showMessage(message) {
  elements.formMessage.textContent = message;
  window.setTimeout(() => {
    if (elements.formMessage.textContent === message) elements.formMessage.textContent = "";
  }, 2500);
}

function openStudyMode() {
  studyCards = [...getFilteredCards()];
  if (!studyCards.length) return;
  studyIndex = 0;
  showingAnswer = false;
  renderStudyCard();
  elements.studyDialog.showModal();
}

function renderStudyCard() {
  const card = studyCards[studyIndex];
  if (!card) return;
  elements.studyProgress.textContent = `Card ${studyIndex + 1} of ${studyCards.length}`;
  elements.studySide.textContent = showingAnswer ? "Answer" : "Question";
  elements.studyText.textContent = showingAnswer ? card.answer : card.question;
  elements.previousButton.disabled = studyCards.length < 2;
  elements.nextButton.disabled = studyCards.length < 2;
}

function moveStudyCard(direction) {
  studyIndex = (studyIndex + direction + studyCards.length) % studyCards.length;
  showingAnswer = false;
  renderStudyCard();
}

function shuffleStudyCards() {
  for (let i = studyCards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [studyCards[i], studyCards[j]] = [studyCards[j], studyCards[i]];
  }
  studyIndex = 0;
  showingAnswer = false;
  renderStudyCard();
}

function applyTheme(theme) {
  const dark = theme === "dark";
  document.body.classList.toggle("dark", dark);
  elements.themeButton.textContent = dark ? "Light mode" : "Dark mode";
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = elements.question.value.trim();
  const answer = elements.answer.value.trim();
  const category = elements.category.value.trim();
  if (!question || !answer) return;

  const id = elements.cardId.value;
  if (id) {
    const card = cards.find((item) => item.id === id);
    if (card) Object.assign(card, { question, answer, category, updatedAt: new Date().toISOString() });
    showMessage("Card updated.");
  } else {
    cards.unshift({ id: makeId(), question, answer, category, createdAt: new Date().toISOString() });
    showMessage("Card added.");
  }

  saveCards();
  resetForm();
  renderCards();
});

elements.cancelEditButton.addEventListener("click", resetForm);
elements.searchInput.addEventListener("input", renderCards);
elements.categoryFilter.addEventListener("change", renderCards);
elements.studyButton.addEventListener("click", openStudyMode);
elements.closeStudyButton.addEventListener("click", () => elements.studyDialog.close());
elements.studyCard.addEventListener("click", () => { showingAnswer = !showingAnswer; renderStudyCard(); });
elements.previousButton.addEventListener("click", () => moveStudyCard(-1));
elements.nextButton.addEventListener("click", () => moveStudyCard(1));
elements.shuffleButton.addEventListener("click", shuffleStudyCards);
elements.themeButton.addEventListener("click", () => {
  const theme = document.body.classList.contains("dark") ? "light" : "dark";
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
});

document.addEventListener("keydown", (event) => {
  if (!elements.studyDialog.open) return;
  if (event.key === "ArrowLeft") moveStudyCard(-1);
  if (event.key === "ArrowRight") moveStudyCard(1);
  if (event.key === " ") { event.preventDefault(); showingAnswer = !showingAnswer; renderStudyCard(); }
});

applyTheme(localStorage.getItem(THEME_KEY) || "light");
renderCards();
