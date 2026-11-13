// CDN을 통해 Firebase v10 SDK 불러오기 (별도 npm 설치 불필요)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// TODO: 본인의 Firebase 프로젝트 설정(firebaseConfig)으로 교체하세요!
const firebaseConfig = {
  apiKey: "AIzaSyDVFSr-aBD-FVxjoCnTylWhB8UxebGwfQc",
  authDomain: "project-5877473549984382352.firebaseapp.com",
  projectId: "project-5877473549984382352",
  storageBucket: "project-5877473549984382352.firebasestorage.app",
  messagingSenderId: "284810634299",
  appId: "1:284810634299:web:f408c9e45f44804037681e",
  measurementId: "G-BZDCMFKV0K"
};

// 1. Firebase 및 Firestore 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const guestbookRef = collection(db, "guestbook"); // 'guestbook' 컬렉션 참조

// DOM 요소 선택
const form = document.getElementById("guestbook-form");
const nicknameInput = document.getElementById("nickname");
const messageInput = document.getElementById("message");
const submitBtn = document.getElementById("submit-btn");
const listContainer = document.getElementById("guestbook-list");

// 2. 방명록 데이터 쓰기 (addDoc)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nickname = nicknameInput.value.trim();
  const message = messageInput.value.trim();

  if (!nickname || !message) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "등록 중...";

  try {
    await addDoc(guestbookRef, {
      nickname: nickname,
      message: message,
      createdAt: serverTimestamp() // 서버 기준 현재 시간 저장
    });

    // 입력창 초기화
    messageInput.value = "";
  } catch (error) {
    console.error("방명록 저장 오류:", error);
    alert("저장에 실패했습니다. 콘솔을 확인해주세요.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "방명록 남기기";
  }
});

// 3. 방명록 실시간 읽기 (onSnapshot + orderBy)
// 최신 글이 맨 위에 오도록 createdAt 기준 내림차순(desc) 정렬
const q = query(guestbookRef, orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  listContainer.innerHTML = ""; // 기존 목록 초기화

  if (snapshot.empty) {
    listContainer.innerHTML = `<p class="loading">아직 작성된 방명록이 없습니다. 첫 글을 남겨보세요!</p>`;
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data();
    
    // 타임스탬프 포맷팅 (막 생성된 직후에는 null일 수 있으므로 방어 코드 작성)
    let dateStr = "방금 전";
    if (data.createdAt) {
      const date = data.createdAt.toDate();
      dateStr = date.toLocaleString("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    // XSS 방지를 위해 textContent를 사용해 안전하게 DOM 생성
    const card = document.createElement("div");
    card.className = "guest-card";

    const header = document.createElement("div");
    header.className = "card-header";

    const nickEl = document.createElement("span");
    nickEl.className = "nickname";
    nickEl.textContent = data.nickname;

    const dateEl = document.createElement("span");
    dateEl.className = "date";
    dateEl.textContent = dateStr;

    const msgEl = document.createElement("p");
    msgEl.className = "message";
    msgEl.textContent = data.message;

    header.appendChild(nickEl);
    header.appendChild(dateEl);
    card.appendChild(header);
    card.appendChild(msgEl);

    listContainer.appendChild(card);
  });
});