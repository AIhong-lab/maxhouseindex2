# 工作日誌 · 第二大腦

一個純前端的工作日誌網站，位於 `worklog/`，不影響根目錄既有的行銷頁 `index.html`。

- 網址：`你的網站/worklog/`
- 無需自架伺服器；可直接放上 GitHub Pages 等靜態託管。

## 兩種運作模式

### 1. 本機模式（開箱即用，免登入）
沒有設定 Firebase 時，資料存在瀏覽器 `localStorage`，並可選擇性連接 Google Drive 個人備份。適合單人、單裝置。

### 2. 帳號雲端模式（登入 + 團隊管理）
設定 Firebase 後，開啟登入、跨裝置同步，以及管理員幫其他人建立/設定帳號。

## 啟用登入與雲端（Firebase，約 5 分鐘，一次性）

1. 到 <https://console.firebase.google.com> 建立專案。
2. **Authentication → 開始使用**，啟用「**Google**」與「**電子郵件/密碼**」兩種登入方式。
3. **Authentication → Settings → 授權網域**，加入你的網站網域（例如 `你的帳號.github.io`）。
4. **Firestore Database → 建立資料庫**（正式模式即可，規則見下）。
5. **專案設定 ⚙️ → 你的應用程式 → 新增網頁應用程式**，複製 `firebaseConfig`。
6. 部署 Firestore 規則：把 `worklog/firestore.rules` 的內容貼到 **Firestore → 規則** 後發布。
   - 規則檔內的 `ownerEmails()` 已預設 `rickex.hong@gmail.com` 為擁有者（第一位管理員）。要換人或多位，改該陣列即可。
7. 填入設定，二選一：
   - **快速試用**：開啟網站 → 左下角帳號 → 「啟用登入與雲端」→ 貼上 `firebaseConfig`（僅存在該瀏覽器）。
   - **正式部署**（建議）：編輯 `index.html` 最上方 JS 的 `FIREBASE_CONFIG = { ... }`，填入設定並提交，讓所有使用者都能登入。

> `firebaseConfig` 屬公開資訊（放前端沒問題），實際存取權限由 `firestore.rules` 把關。

## 角色與權限

- **擁有者 / 管理員**：可進入「管理」頁，新增成員帳號、設為/取消管理員、以「幫他設定」進入任一成員日誌代為建立內容與提醒。
- **成員**：只看得到、編輯得到自己的日誌。

管理員「新增成員帳號」時，透過次要 App 實例建立帳號，**不會登出你自己**；建立後把 Email 與初始密碼給對方即可。

## 資料結構（Firestore）

```
users/{uid}                      # 個人檔案：email, displayName, role, settings
users/{uid}/entries/{entryId}    # 每一則日誌
```

## 檔案

| 檔案 | 用途 |
|---|---|
| `index.html` | 應用程式（單檔，內含全部 UI 與邏輯）|
| `sw.js` | Service Worker（離線快取 + 通知）|
| `manifest.webmanifest` | PWA 設定（可安裝為 App）|
| `firestore.rules` | Firestore 安全性規則（需部署到 Firebase）|

## 功能

第二大腦（全文搜尋）、問題解決手冊、專案知識庫、作品集/履歷素材、寫作素材、反思提問、決策紀錄、AI 脈絡整理（週報/月報/履歷/問題手冊/反思/經驗萃取）、每日提醒（通知 + PWA）、成長統計圖表，以及 JSON/Markdown 匯入匯出備份。
