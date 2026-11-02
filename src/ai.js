// AI trong GeoInk: đọc số liệu biểu đồ (code TikZ / ảnh) và chuyển ảnh đề toán thành LaTeX chuẩn.
// Mỗi thầy cô tự nhập khoá API của mình (OpenAI, Gemini, Claude, DeepSeek). Khoá được cất mã hoá ở tiến trình
// chính (máy tính) hoặc bộ nhớ riêng của app (máy tính bảng); giao diện không bao giờ đọc lại được khoá.
//   GI.ai.hoi({ heThong, chu, anh: [dataURL…], json: true }) → Promise<string> (văn bản trả lời; json: trả về JSON)
//   GI.ai.moCaiDat()  — hộp Cài đặt AI
window.GI = window.GI || {};
GI.ai = (function () {
  var MT = window.mayTinh || null;
  var NCC = {
    gemini: { ten: 'Google Gemini', goc: 'https://generativelanguage.googleapis.com/', layKhoa: 'https://aistudio.google.com/apikey', ghiChu: 'Có gói miễn phí (giới hạn lượt mỗi phút, mỗi ngày). Với gói miễn phí, Google có thể dùng dữ liệu để cải tiến sản phẩm.' },
    openai: { ten: 'OpenAI (ChatGPT)', goc: 'https://api.openai.com/', layKhoa: 'https://platform.openai.com/api-keys', ghiChu: 'Trả phí theo lượt dùng.' },
    claude: { ten: 'Anthropic Claude', goc: 'https://api.anthropic.com/', layKhoa: 'https://console.anthropic.com/settings/keys', ghiChu: 'Trả phí theo lượt dùng.' },
    deepseek: { ten: 'DeepSeek', goc: 'https://api.deepseek.com/', layKhoa: 'https://platform.deepseek.com/api_keys', ghiChu: 'Trả phí theo lượt dùng, giá rẻ.' },
  };
  var KHOA_CD = 'geoink_ai_cai_dat';
  function caiDat() { try { return Object.assign({ ncc: 'gemini', moHinh: {}, dsMoHinh: {} }, JSON.parse(localStorage.getItem(KHOA_CD) || '{}')); } catch (e) { return { ncc: 'gemini', moHinh: {}, dsMoHinh: {} }; } }
  function luuCaiDat(c) { try { localStorage.setItem(KHOA_CD, JSON.stringify(c)); } catch (e) { } }
  function coCauNoi() { return !!(MT && MT.aiGoi && MT.aiKhoa); }
  function trangThaiKhoa() { return coCauNoi() ? MT.aiKhoa('trangThai').then(function (k) { return k.trangThai || {}; }) : Promise.resolve({}); }

  function goiHttp(ncc, url, body, method) {
    return MT.aiGoi({ ncc: ncc, url: url, method: method || (body ? 'POST' : 'GET'), body: body ? JSON.stringify(body) : null }).then(function (r) {
      var j = null; try { j = JSON.parse(r.text); } catch (e) { }
      if (r.chuaCoKhoa) throw new Error('Chưa nhập khoá API cho ' + NCC[ncc].ten + '. Mở menu ☰ → Cài đặt AI để nhập.');
      if (!(r.status >= 200 && r.status < 300)) {
        var m = j && (j.error && (j.error.message || j.error.status || j.error.type) || j.message) || r.text || ('Lỗi ' + r.status);
        if (r.status === 401 || r.status === 403) m = 'Khoá API không đúng hoặc không có quyền (' + m + ')';
        if (r.status === 429) m = 'Hết lượt hoặc gọi quá nhanh, thử lại sau ít phút (' + m + ')';
        if (r.status === 0) m = 'Không kết nối được ' + NCC[ncc].ten + '. Kiểm tra mạng.';
        throw new Error(String(m).slice(0, 400));
      }
      return j;
    });
  }

  // ---------- danh sách mô hình (lấy thẳng từ nhà cung cấp, mới nhất trước) ----------
  var BO_OPENAI = /(audio|realtime|tts|transcribe|whisper|dall-e|image|embedding|moderation|search|davinci|babbage|instruct|computer-use|codex)/i;
  var BO_GEMINI = /(embedding|tts|image-generation|native-audio|live|aqa|learnlm|imagen|veo|robotics|computer-use)/i;
  function layMoHinh(ncc) {
    if (ncc === 'openai') return goiHttp(ncc, NCC.openai.goc + 'v1/models').then(function (j) {
      return (j.data || []).filter(function (m) { return /^(gpt-|o\d|chatgpt-)/.test(m.id) && !BO_OPENAI.test(m.id); })
        .sort(function (a, b) { return (b.created || 0) - (a.created || 0); }).map(function (m) { return m.id; });
    });
    if (ncc === 'claude') return goiHttp(ncc, NCC.claude.goc + 'v1/models?limit=100').then(function (j) {
      return (j.data || []).sort(function (a, b) { return String(b.created_at || '').localeCompare(String(a.created_at || '')); }).map(function (m) { return m.id; });
    });
    if (ncc === 'deepseek') return goiHttp(ncc, NCC.deepseek.goc + 'models').then(function (j) { return (j.data || []).map(function (m) { return m.id; }); });
    return goiHttp('gemini', NCC.gemini.goc + 'v1beta/models?pageSize=200').then(function (j) {
      var ds = (j.models || []).filter(function (m) { return (m.supportedGenerationMethods || []).indexOf('generateContent') >= 0 && /gemini/.test(m.name) && !BO_GEMINI.test(m.name); })
        .map(function (m) { return m.name.replace(/^models\//, ''); });
      var so = function (t) { var x = t.match(/gemini-(\d+(?:\.\d+)?)/); return x ? parseFloat(x[1]) : 0; };
      return ds.sort(function (a, b) { return so(b) - so(a) || /preview|exp/.test(a) - /preview|exp/.test(b) || a.localeCompare(b); });
    });
  }

  // ---------- gọi mô hình: một hệ thống + một lượt hỏi (chữ + ảnh) ----------
  function tachAnh(u) { var m = String(u).match(/^data:([^;]+);base64,(.*)$/); return m ? { loai: m[1], b64: m[2] } : null; }
  function hoi(o) {
    if (!coCauNoi()) return Promise.reject(new Error('Tính năng AI chỉ dùng trong app GeoInk đã cài.'));
    var c = caiDat(), ncc = o.ncc || c.ncc, mh = o.moHinh || c.moHinh[ncc];
    if (!mh) return Promise.reject(new Error('Chưa chọn mô hình cho ' + NCC[ncc].ten + '. Mở menu ☰ → Cài đặt AI, bấm "Kiểm tra khoá" rồi chọn mô hình.'));
    var anh = (o.anh || []).map(tachAnh).filter(Boolean), chu = o.chu || '', he = o.heThong || '';
    if (o.json) he += '\n\nChỉ trả lời bằng MỘT đối tượng JSON hợp lệ, không thêm chữ nào khác, không bọc trong ```.';
    var p;
    if (ncc === 'gemini') {
      var parts = anh.map(function (a) { return { inline_data: { mime_type: a.loai, data: a.b64 } }; }).concat([{ text: chu }]);
      var bd = { system_instruction: { parts: [{ text: he }] }, contents: [{ role: 'user', parts: parts }], generationConfig: { temperature: 0.2 } };
      if (o.json) bd.generationConfig.responseMimeType = 'application/json';
      p = goiHttp(ncc, NCC.gemini.goc + 'v1beta/models/' + encodeURIComponent(mh) + ':generateContent', bd).then(function (j) {
        var cd = j.candidates && j.candidates[0];
        if (!cd) throw new Error('Gemini không trả lời' + (j.promptFeedback && j.promptFeedback.blockReason ? ' (bị chặn: ' + j.promptFeedback.blockReason + ')' : '') + '.');
        if (cd.finishReason === 'MAX_TOKENS' && o.khiCat) o.khiCat();
        return ((cd.content && cd.content.parts) || []).map(function (x) { return x.text || ''; }).join('');
      });
    } else if (ncc === 'claude') {
      var nd = anh.map(function (a) { return { type: 'image', source: { type: 'base64', media_type: a.loai, data: a.b64 } }; }).concat([{ type: 'text', text: chu }]);
      // phần hệ thống dài (bộ quy tắc) được nhớ đệm: các lần gọi sau rẻ hơn
      var heC = he.length > 4000 ? [{ type: 'text', text: he, cache_control: { type: 'ephemeral' } }] : he;
      var bdC = { model: mh, max_tokens: o.toiDa || 16000, system: heC, messages: [{ role: 'user', content: nd }] };
      p = goiHttp(ncc, NCC.claude.goc + 'v1/messages', bdC).catch(function (e) {   // mô hình cũ giới hạn độ dài trả lời thấp hơn: thử lại với 8192
        if (!/max_tokens/i.test(e.message) || bdC.max_tokens <= 8192) throw e; bdC.max_tokens = 8192; return goiHttp(ncc, NCC.claude.goc + 'v1/messages', bdC);
      }).then(function (j) {
        if (j.stop_reason === 'refusal') throw new Error('Claude từ chối yêu cầu này.');
        if (j.stop_reason === 'max_tokens' && o.khiCat) o.khiCat();
        return (j.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('');
      });
    } else {   // openai, deepseek: cùng dạng chat/completions
      var nd2 = anh.length ? anh.map(function (a) { return { type: 'image_url', image_url: { url: 'data:' + a.loai + ';base64,' + a.b64 } }; }).concat([{ type: 'text', text: chu }]) : chu;
      var bd2 = { model: mh, messages: [{ role: 'system', content: he }, { role: 'user', content: nd2 }] };
      if (o.json) bd2.response_format = { type: 'json_object' };
      var url = ncc === 'openai' ? NCC.openai.goc + 'v1/chat/completions' : NCC.deepseek.goc + 'chat/completions';
      p = goiHttp(ncc, url, bd2).then(function (j) {
        var m = j.choices && j.choices[0] && j.choices[0].message;
        if (!m) throw new Error('Không nhận được trả lời.');
        if (m.refusal) throw new Error('Mô hình từ chối: ' + m.refusal);
        if (j.choices[0].finish_reason === 'length' && o.khiCat) o.khiCat();
        return typeof m.content === 'string' ? m.content : (m.content || []).map(function (x) { return x.text || ''; }).join('');
      });
    }
    return p.then(function (t) { return o.json ? docJson(t) : t; });
  }
  function docJson(t) {
    t = String(t || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
    try { return JSON.parse(t); } catch (e) { }
    var a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { } }
    throw new Error('AI trả lời không đúng dạng dữ liệu. Thử lại hoặc đổi mô hình.');
  }

  // ---------- hộp Cài đặt AI ----------
  function thoat(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function moCaiDat() {
    var cu = document.getElementById('hop-ai'); if (cu) cu.remove();
    if (!coCauNoi()) { alert('Tính năng AI chỉ dùng trong app GeoInk đã cài.'); return; }
    var c = caiDat(), h = document.createElement('div'); h.id = 'hop-ai'; h.className = 'hop';
    h.innerHTML = '<div class="hop-noi-dung ai-khung"><h2>Cài đặt AI</h2>' +
      '<p class="ghi-chu">AI giúp đọc số liệu biểu đồ (code TikZ, ảnh) và chuyển ảnh đề toán thành LaTeX chuẩn. Thầy cô dùng <b>khoá API của mình</b>; khoá được cất mã hoá trên máy này, không gửi lên GeoLab.</p>' +
      '<div class="ai-ncc" id="ai-ncc">' + Object.keys(NCC).map(function (k) { return '<button data-ncc="' + k + '"><b>' + NCC[k].ten + '</b><small data-tt="' + k + '">…</small></button>'; }).join('') + '</div>' +
      '<div class="ai-chi-tiet"><div class="ai-ghi" id="ai-ghi"></div>' +
      '<label class="ai-dong"><span>Khoá API</span><span class="ai-khoa"><input id="ai-khoa" type="password" autocomplete="off" spellcheck="false" placeholder="Dán khoá API vào đây"><button class="nut chu" id="ai-hien" type="button">Hiện</button></span></label>' +
      '<div class="ai-nut"><button class="nut chu chinh" id="ai-luu">Lưu khoá và kiểm tra</button><button class="nut chu" id="ai-xoa">Xoá khoá</button><a href="#" id="ai-lay">Lấy khoá API ở đâu?</a></div>' +
      '<label class="ai-dong"><span>Mô hình</span><span class="ai-khoa"><select id="ai-mh"></select><button class="nut chu" id="ai-tai" type="button" title="Tải lại danh sách mô hình mới nhất">↻</button></span></label>' +
      '<div class="ai-tb" id="ai-tb"></div></div>' +
      '<div class="hanh-dong"><button class="nut chu chinh" data-dong>Xong</button></div></div>';
    document.body.appendChild(h);
    var $ = function (s) { return h.querySelector(s); }, ncc = c.ncc, tt = {};
    function tb(s, loi) { var e = $('#ai-tb'); e.textContent = s || ''; e.className = 'ai-tb' + (loi ? ' loi' : s ? ' tot' : ''); }
    function veMoHinh() {
      var ds = c.dsMoHinh[ncc] || [], chon = c.moHinh[ncc] || '', sel = $('#ai-mh');
      if (chon && ds.indexOf(chon) < 0) ds = [chon].concat(ds);
      sel.innerHTML = ds.length ? ds.map(function (m) { return '<option' + (m === chon ? ' selected' : '') + '>' + thoat(m) + '</option>'; }).join('') : '<option value="">(bấm "Lưu khoá và kiểm tra" để tải danh sách)</option>';
    }
    function veNcc() {
      h.querySelectorAll('[data-ncc]').forEach(function (b) { b.classList.toggle('chon', b.dataset.ncc === ncc); });
      Object.keys(NCC).forEach(function (k) { var e = h.querySelector('[data-tt="' + k + '"]'); var t = tt[k]; e.textContent = t && t.co ? 'Đã có khoá ••••' + t.duoi : 'Chưa có khoá'; e.classList.toggle('co', !!(t && t.co)); });
      $('#ai-ghi').textContent = NCC[ncc].ghiChu + (ncc === c.ncc ? ' (đang dùng)' : '');
      $('#ai-khoa').value = ''; $('#ai-khoa').placeholder = tt[ncc] && tt[ncc].co ? 'Đã lưu khoá ••••' + tt[ncc].duoi + ' — dán khoá mới để thay' : 'Dán khoá API vào đây';
      veMoHinh(); tb('');
    }
    function taiDs() {
      tb('Đang kiểm tra khoá và tải danh sách mô hình…');
      return layMoHinh(ncc).then(function (ds) {
        if (!ds.length) throw new Error('Khoá hợp lệ nhưng không thấy mô hình nào dùng được.');
        c.dsMoHinh[ncc] = ds; if (!c.moHinh[ncc] || ds.indexOf(c.moHinh[ncc]) < 0) c.moHinh[ncc] = ds[0];
        c.ncc = ncc; luuCaiDat(c); veNcc(); tb('Khoá dùng được. Đã tải ' + ds.length + ' mô hình, mới nhất ở đầu danh sách.');
      }, function (e) { tb(e.message, true); });
    }
    h.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ncc]'); if (b) { ncc = b.dataset.ncc; if (tt[ncc] && tt[ncc].co) { c.ncc = ncc; luuCaiDat(c); } veNcc(); }
      if (e.target === h || e.target.closest('[data-dong]')) h.remove();
    });
    $('#ai-hien').onclick = function () { var i = $('#ai-khoa'); i.type = i.type === 'password' ? 'text' : 'password'; this.textContent = i.type === 'password' ? 'Hiện' : 'Ẩn'; };
    $('#ai-lay').onclick = function (e) { e.preventDefault(); if (MT && MT.moLink) MT.moLink(NCC[ncc].layKhoa); };
    $('#ai-luu').onclick = function () {
      var k = $('#ai-khoa').value.trim();
      (k ? MT.aiKhoa('ghi', ncc, k) : Promise.resolve(null)).then(function (r) {
        if (r) tt = r.trangThai || tt;
        if (!(tt[ncc] && tt[ncc].co)) { tb('Dán khoá API trước đã.', true); return; }
        c.ncc = ncc; luuCaiDat(c); veNcc(); taiDs();
      });
    };
    $('#ai-tai').onclick = taiDs;
    $('#ai-xoa').onclick = function () {
      if (!confirm('Xoá khoá API của ' + NCC[ncc].ten + ' khỏi máy này?')) return;
      MT.aiKhoa('xoa', ncc).then(function (r) { tt = r.trangThai || {}; delete c.dsMoHinh[ncc]; delete c.moHinh[ncc]; luuCaiDat(c); veNcc(); tb('Đã xoá khoá.'); });
    };
    $('#ai-mh').onchange = function () { if (this.value) { c.moHinh[ncc] = this.value; c.ncc = ncc; luuCaiDat(c); veNcc(); } };
    trangThaiKhoa().then(function (t) { tt = t; veNcc(); });
    veNcc();
  }
  function sanSang() {   // có khoá + mô hình cho nhà cung cấp đang chọn chưa
    if (!coCauNoi()) return Promise.resolve(false);
    var c = caiDat();
    return trangThaiKhoa().then(function (t) { return !!(t[c.ncc] && t[c.ncc].co && c.moHinh[c.ncc]); });
  }
  function coMoHinh() { var c = caiDat(); return coCauNoi() && !!c.moHinh[c.ncc]; }   // đã chọn mô hình (khoá đã kiểm tra khi tải danh sách)
  function moTa() { var c = caiDat(); return NCC[c.ncc].ten + (c.moHinh[c.ncc] ? ' · ' + c.moHinh[c.ncc] : ''); }
  return { hoi: hoi, moCaiDat: moCaiDat, sanSang: sanSang, coMoHinh: coMoHinh, moTa: moTa, NCC: NCC, docJson: docJson };
})();
