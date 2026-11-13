/**
 * 包租翁 MAX HOUSE｜LINE 官方帳號「分頁式圖文選單」一鍵上架
 * ------------------------------------------------------------
 * 原理：建立 3 張 Rich Menu，各自綁一個 alias（tab1/tab2/tab3），
 *       上方分頁列用 richmenuswitch 動作互相切換 → 不需要 webhook / 伺服器。
 *
 * 使用步驟（詳見 README.md）：
 *   1. 專案設定 → 指令碼屬性 新增 LINE_TOKEN = 你的 Channel access token（長期）
 *   2. 把 images/tab1.jpg ~ tab3.jpg 上傳到 Google 雲端硬碟，
 *      把三個檔案 ID 填到下面 IMAGES（或改成公開圖片網址）
 *   3. 改 LINKS 裡的連結（空白的會自動改成「傳文字」）
 *   4. 執行 deployAll() → 完成。手機重開聊天室就看得到。
 *   要改內容：改完再執行一次 deployAll()，會自動清掉舊選單重建。
 *   想全部移除：執行 removeAll()
 */

// ===================== 1. 圖片來源 =====================
// 填 Google 雲端硬碟檔案 ID（網址 /d/ 和 /view 中間那串），或 https 圖片網址
const IMAGES = {
  tab1: 'PUT_DRIVE_FILE_ID_OF_tab1.jpg',
  tab2: 'PUT_DRIVE_FILE_ID_OF_tab2.jpg',
  tab3: 'PUT_DRIVE_FILE_ID_OF_tab3.jpg',
};

// ===================== 2. 連結設定 =====================
// 留空字串 '' → 按下去改成傳一句文字（可搭配 LINE 後台「自動回應」關鍵字）
const LINKS = {
  site:      'https://aihong-lab.github.io/maxhouseindex2/',   // 官方網站（請確認網址）
  lecture:   'https://forms.gle/yPt6e85ZnHdEWiwM6',            // 講座報名表
  pdf:       'https://twur.nlma.gov.tw/resources/website/theme_file/348/%E8%80%81%E5%AE%85%E5%BB%B6%E5%A3%BD%E8%AA%AA%E6%98%8E%E6%9C%83%E7%B0%A1%E5%A0%B1.pdf',
  threads:   '',   // 例：https://www.threads.net/@你的帳號
  facebook:  '',   // 例：https://www.facebook.com/你的粉專
  youtube:   '',   // 例：https://www.youtube.com/@你的頻道
  instagram: '',   // 例：https://www.instagram.com/你的帳號
};

// ===================== 3. 選單內容 =====================
// 每頁 6 顆按鈕，順序：左上、中上、右上、左下、中下、右下（要跟圖片一致）
// type: 'uri' 開網址 / 'msg' 幫使用者傳出文字 / 'share' 分享官方帳號給好友
function buildMenus_() {
  const site = LINKS.site.replace(/\/?$/, '/');
  return [
    {
      key: 'tab1', name: '包租翁-老宅延壽', chatBarText: '老宅延壽 ▸ 點我',
      buttons: [
        { label: '補助快篩',   type: 'msg', value: '我想做老宅延壽補助快篩' },
        { label: '公寓補助',   type: 'uri', value: LINKS.site ? site + '#subsidy-apt' : '', fallback: '我想了解公寓補助' },
        { label: '透天補助',   type: 'uri', value: LINKS.site ? site + '#subsidy-house' : '', fallback: '我想了解透天補助' },
        { label: '報名講座',   type: 'uri', value: LINKS.lecture, fallback: '我要報名講座' },
        { label: '說明會簡報', type: 'uri', value: LINKS.pdf, fallback: '請給我說明會簡報' },
        { label: '一對一諮詢', type: 'msg', value: '我想預約一對一諮詢' },
      ],
    },
    {
      key: 'tab2', name: '包租翁-老屋創收', chatBarText: '老屋創收 ▸ 點我',
      buttons: [
        { label: '翻新實例', type: 'uri', value: LINKS.site ? site + '#showcase' : '', fallback: '我想看翻新實例' },
        { label: '出租規劃', type: 'uri', value: LINKS.site ? site + '#strategy' : '', fallback: '我想了解出租規劃' },
        { label: '甲醛檢測', type: 'msg', value: '我想預約甲醛檢測' },
        { label: '預約勘查', type: 'msg', value: '我想預約到府勘查' },
        { label: '投報試算', type: 'msg', value: '我想做翻新投報試算' },
        { label: '常見問題', type: 'msg', value: '常見問題' },
      ],
    },
    {
      key: 'tab3', name: '包租翁-追蹤', chatBarText: '追蹤包租翁 ▸ 點我',
      buttons: [
        { label: 'Threads',   type: 'uri', value: LINKS.threads,   fallback: 'Threads' },
        { label: 'Facebook',  type: 'uri', value: LINKS.facebook,  fallback: 'Facebook' },
        { label: 'YouTube',   type: 'uri', value: LINKS.youtube,   fallback: 'YouTube' },
        { label: 'Instagram', type: 'uri', value: LINKS.instagram, fallback: 'Instagram' },
        { label: '官方網站',  type: 'uri', value: LINKS.site,      fallback: '官方網站' },
        { label: '分享好友',  type: 'share' },
      ],
    },
  ];
}

// ===================== 版面座標（2500 x 1686，勿動除非改了圖） =====================
const W = 2500, H = 1686, TAB_H = 260;
const COL_X = [0, 833, 1666], COL_W = [833, 833, 834];
const ROW_Y = [TAB_H, TAB_H + 713], ROW_H = [713, 713];
const TAB_LABELS = ['老宅延壽', '老屋創收', '追蹤包租翁'];
const ALIAS_PREFIX = 'maxhouse-';   // alias 名稱：maxhouse-tab1 ...

const API = 'https://api.line.me/v2/bot';
const API_DATA = 'https://api-data.line.me/v2/bot';

// ===================== 主程式 =====================
function deployAll() {
  const token = getToken_();
  const menus = buildMenus_();
  const shareUrl = getShareUrl_(token);

  // 先清掉之前用本腳本建立的舊選單與 alias
  removeAll();

  const created = {};
  menus.forEach(function (m, idx) {
    const body = {
      size: { width: W, height: H },
      selected: true,                 // 預設展開選單
      name: m.name,
      chatBarText: m.chatBarText,
      areas: buildAreas_(menus, idx, m.buttons, shareUrl),
    };
    const res = call_('post', API + '/richmenu', token, body);
    const id = res.richMenuId;
    uploadImage_(token, id, IMAGES[m.key]);
    created[m.key] = id;
    Logger.log('建立 %s → %s', m.key, id);
  });

  // 綁 alias（richmenuswitch 靠 alias 找選單）
  menus.forEach(function (m) {
    call_('post', API + '/richmenu/alias', token, {
      richMenuAliasId: ALIAS_PREFIX + m.key,
      richMenuId: created[m.key],
    });
  });

  // 設第一頁為所有好友的預設選單
  call_('post', API + '/user/all/richmenu/' + created.tab1, token, null);

  PropertiesService.getScriptProperties().setProperty('RICHMENU_IDS', JSON.stringify(created));
  Logger.log('✅ 完成！手機關掉聊天室再打開就會看到新選單。');
}

/** 移除本腳本建立的選單與 alias（不影響你在 LINE 後台手動做的選單） */
function removeAll() {
  const token = getToken_();
  ['tab1', 'tab2', 'tab3'].forEach(function (k) {
    call_('delete', API + '/richmenu/alias/' + ALIAS_PREFIX + k, token, null, true);
  });
  const list = call_('get', API + '/richmenu/list', token, null).richmenus || [];
  list.filter(function (r) { return /^包租翁-/.test(r.name); })
      .forEach(function (r) {
        call_('delete', API + '/richmenu/' + r.richMenuId, token, null, true);
        Logger.log('刪除舊選單 %s (%s)', r.name, r.richMenuId);
      });
}

/** 檢查目前狀態 */
function checkStatus() {
  const token = getToken_();
  Logger.log(JSON.stringify(call_('get', API + '/richmenu/list', token, null), null, 2));
  Logger.log(JSON.stringify(call_('get', API + '/richmenu/alias/list', token, null), null, 2));
}

// ===================== 內部函式 =====================
function buildAreas_(menus, activeIdx, buttons, shareUrl) {
  const areas = [];
  // 上方分頁列：每一格切換到對應 alias
  menus.forEach(function (m, i) {
    areas.push({
      bounds: { x: COL_X[i], y: 0, width: COL_W[i], height: TAB_H },
      action: {
        type: 'richmenuswitch',
        richMenuAliasId: ALIAS_PREFIX + m.key,
        data: 'tab=' + m.key,
        label: TAB_LABELS[i],
      },
    });
  });
  // 下方 6 顆按鈕
  buttons.forEach(function (b, n) {
    const col = n % 3, row = Math.floor(n / 3);
    areas.push({
      bounds: { x: COL_X[col], y: ROW_Y[row], width: COL_W[col], height: ROW_H[row] },
      action: toAction_(b, shareUrl),
    });
  });
  return areas;
}

function toAction_(b, shareUrl) {
  if (b.type === 'share') {
    return shareUrl ? { type: 'uri', label: b.label, uri: shareUrl }
                    : { type: 'message', label: b.label, text: '分享包租翁給好友' };
  }
  if (b.type === 'uri' && /^https:\/\//.test(b.value || '')) {
    return { type: 'uri', label: b.label, uri: b.value };
  }
  return { type: 'message', label: b.label, text: (b.type === 'msg' ? b.value : b.fallback) || b.label };
}

/** 用官方帳號 basicId 組出「推薦給好友」連結 */
function getShareUrl_(token) {
  try {
    const info = call_('get', API + '/info', token, null);
    return info.basicId ? 'https://line.me/R/nv/recommendOA/' + encodeURIComponent(info.basicId) : '';
  } catch (e) {
    return '';
  }
}

function uploadImage_(token, richMenuId, src) {
  if (!src || /^PUT_/.test(src)) throw new Error('請先在 IMAGES 填入圖片的雲端硬碟檔案 ID 或網址');
  const blob = /^https?:\/\//.test(src)
    ? UrlFetchApp.fetch(src).getBlob()
    : DriveApp.getFileById(src).getBlob();
  if (blob.getBytes().length > 1024 * 1024) throw new Error('圖片超過 1MB，LINE 不收：' + src);
  const type = /png$/i.test(blob.getContentType()) ? 'image/png' : 'image/jpeg';
  const res = UrlFetchApp.fetch(API_DATA + '/richmenu/' + richMenuId + '/content', {
    method: 'post',
    contentType: type,
    headers: { Authorization: 'Bearer ' + token },
    payload: blob.getBytes(),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) throw new Error('上傳圖片失敗：' + res.getContentText());
}

function call_(method, url, token, body, ignoreError) {
  const opt = {
    method: method,
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true,
  };
  if (body) { opt.contentType = 'application/json'; opt.payload = JSON.stringify(body); }
  const res = UrlFetchApp.fetch(url, opt);
  const code = res.getResponseCode();
  if (code >= 300) {
    if (ignoreError) return {};
    throw new Error(method.toUpperCase() + ' ' + url + ' → ' + code + '\n' + res.getContentText());
  }
  const text = res.getContentText();
  return text ? JSON.parse(text) : {};
}

function getToken_() {
  const t = PropertiesService.getScriptProperties().getProperty('LINE_TOKEN');
  if (!t) throw new Error('請到「專案設定 → 指令碼屬性」新增 LINE_TOKEN（Channel access token）');
  return t;
}
