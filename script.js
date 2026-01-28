(() => {
  const $ = (s, el=document) => el.querySelector(s);

  const els = {
    grid: $('#grid'),
    empty: $('#empty'),
    q: $('#q'),
    clearQ: $('#clearQ'),
    countInfo: $('#countInfo'),
    chips: $('#activeChips'),

    dialog: $('#filtersDialog'),
    btnFilters: $('#btnFilters'),
    clearFilters: $('#clearFilters'),
    fUnidade: $('#fUnidade'),
    fArea: $('#fArea'),

    detailsDialog: $('#detailsDialog'),
    detailsTitle: $('#detailsTitle'),
    dColab: $('#dColab'),
    dArea: $('#dArea'),
    dUnidade: $('#dUnidade'),
    dTema: $('#dTema'),
    dDesc: $('#dDesc'),
  };

  const state = {
    rows: [],
    filtered: [],
    filters: {
      q: '',
      unidade: 'Todos',
      area: 'Todos',
    }
  };

  // ===== Helpers =====
  const norm = (v) => (v ?? '').toString().trim();
  const normHeader = (h) => norm(h).replace(/\s+/g, ' ').replace(/\n/g, ' ').toLowerCase();

  function pickCol(row, candidates){
    // candidates: array of possible normalized headers
    for (const c of candidates) {
      if (row[c] != null && norm(row[c]) !== '') return norm(row[c]);
    }
    return '';
  }

  function makeTitleFromText(text){
    const t = norm(text);
    if (!t) return 'Iniciativa';
    // usa primeira frase/linha como título (curto)
    const first = t.split(/\n|\r|\./)[0].trim();
    if (first.length >= 10 && first.length <= 64) return first;
    // fallback: primeiras palavras
    return t.split(/\s+/).slice(0, 7).join(' ') + (t.split(/\s+/).length > 7 ? '…' : '');
  }

  function inferTema(text){
    const t = norm(text).toLowerCase();
    // heurística simples (você pode evoluir depois)
    if (t.includes('power automate') || t.includes('automat')) return 'Automação / IA';
    if (t.includes('dashboard') || t.includes('bi')) return 'Dados / IA';
    if (t.includes('padron') || t.includes('process')) return 'Processos / IA';
    if (t.includes('trein') || t.includes('capacit')) return 'Pessoas / IA';
    return 'IA / Inovação';
  }

  function render(){
    els.grid.innerHTML = '';
    const list = state.filtered;

    els.countInfo.textContent = `Iniciativas publicadas: ${list.length}`;

    if (!list.length){
      els.empty.classList.remove('hidden');
      return;
    }
    els.empty.classList.add('hidden');

    const frag = document.createDocumentFragment();
    for (const item of list){
      frag.appendChild(cardEl(item));
    }
    els.grid.appendChild(frag);
  }

  function cardEl(item){
    const a = document.createElement('article');
    a.className = 'card';

    a.innerHTML = `
      <div class="card__id">Iniciativa #${String(item.id).padStart(3,'0')}</div>
      <h3 class="card__title">${escapeHtml(item.titulo)}</h3>
      <p class="card__desc"><b>Descrição:</b> ${escapeHtml(item.descricao)}</p>

      <div class="meta">
        <div><b>Colaborador:</b> <span>${escapeHtml(item.colaborador || '-')}</span></div>
        <div><b>Área:</b> <span>${escapeHtml(item.area || '-')}</span></div>
        <div><b>Filial:</b> <span>${escapeHtml(item.unidade || '-')}</span></div>
        <div><b>Tema:</b> <span>${escapeHtml(item.tema || 'IA / Inovação')}</span></div>
      </div>

      <div class="card__actions">
        <a class="link" href="#" data-action="details">Ver detalhes →</a>
        <span class="arrow">→</span>
      </div>
    `;

    a.querySelector('[data-action="details"]').addEventListener('click', (e) => {
      e.preventDefault();
      openDetails(item);
    });

    // Clique no card inteiro também abre
    a.addEventListener('click', (e) => {
      const isLink = e.target.closest('a');
      if (isLink) return;
      openDetails(item);
    });

    return a;
  }

  function openDetails(item){
    // Se tiver anexo (pdf/imagem), abre em nova aba
    if (item.anexo){
      window.open(item.anexo, '_blank', 'noopener');
      return;
    }

    // Senão abre modal com texto completo
    els.detailsTitle.textContent = `Iniciativa #${String(item.id).padStart(3,'0')} — ${item.titulo}`;
    els.dColab.textContent = item.colaborador || '-';
    els.dArea.textContent = item.area || '-';
    els.dUnidade.textContent = item.unidade || '-';
    els.dTema.textContent = item.tema || 'IA / Inovação';
    els.dDesc.textContent = item.descricao || '-';

    els.detailsDialog.showModal();
  }

  function applyFilters(){
    const q = state.filters.q.toLowerCase();

    state.filtered = state.rows.filter(r => {
      const okUnidade = state.filters.unidade === 'Todos' || r.unidade === state.filters.unidade;
      const okArea = state.filters.area === 'Todos' || r.area === state.filters.area;

      const hay = `${r.id} ${r.titulo} ${r.descricao} ${r.colaborador} ${r.area} ${r.unidade} ${r.tema}`.toLowerCase();
      const okQ = !q || hay.includes(q);

      return okUnidade && okArea && okQ;
    });

    renderChips();
    render();
  }

  function renderChips(){
    const chips = [];
    if (state.filters.unidade !== 'Todos') chips.push(`Filial: ${state.filters.unidade}`);
    if (state.filters.area !== 'Todos') chips.push(`Área: ${state.filters.area}`);
    if (state.filters.q) chips.push(`Busca: "${state.filters.q}"`);

    els.chips.innerHTML = chips.map(c => `<span class="chip">${escapeHtml(c)}</span>`).join('');
  }

  function fillSelect(selectEl, values){
    selectEl.innerHTML = '';
    const optAll = document.createElement('option');
    optAll.value = 'Todos';
    optAll.textContent = 'Todos';
    selectEl.appendChild(optAll);

    values.forEach(v => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = v;
      selectEl.appendChild(o);
    });
  }

  function escapeHtml(str){
    return (str ?? '').toString()
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'","&#039;");
  }

  // ===== Load XLSX =====
  async function loadXlsx(){
    // coloque seu excel aqui
    const url = 'iniciativas.xlsx';

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Não consegui carregar ${url} (${res.status})`);
    const buf = await res.arrayBuffer();

    const wb = XLSX.read(buf, { type: 'array' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];

    // pega tudo como objetos
    const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });

    // normaliza headers (se vierem com \n)
    // sheet_to_json já usa os nomes originais; vamos mapear para um "row" com chaves normalizadas
    const normalized = raw.map((row) => {
      const out = {};
      for (const k of Object.keys(row)){
        out[normHeader(k)] = row[k];
      }
      return out;
    });

    // Detecta colunas (aceita variações)
    const COL_COLAB = ['nome colaborador(a)', 'colaborador', 'nome', 'nome do colaborador'];
    const COL_UNIDADE = ['unidade', 'filial'];
    const COL_AREA = ['area', 'área', 'setor'];
    const COL_DESC = [
      'descreva a solução realizada pelo seu(sua) colaborador(a) (em 2025)',
      'descricao', 'descrição', 'iniciativa', 'solucao', 'solução'
    ];
    const COL_ANEXO = ['anexo', 'pdf', 'arquivo', 'link', 'detalhes', 'detalhes_url'];

    const rows = normalized.map((r, idx) => {
      const colaborador = pickCol(r, COL_COLAB);
      const unidade = pickCol(r, COL_UNIDADE);
      const area = pickCol(r, COL_AREA);
      const descricao = pickCol(r, COL_DESC);
      const anexo = pickCol(r, COL_ANEXO);

      const titulo = makeTitleFromText(descricao);
      const tema = inferTema(descricao);

      return {
        id: idx + 1,
        colaborador,
        unidade,
        area,
        titulo,
        descricao: norm(descricao),
        tema,
        anexo: norm(anexo)
      };
    });

    state.rows = rows;

    // Preenche filtros
    const unidades = [...new Set(rows.map(r => r.unidade).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    const areas = [...new Set(rows.map(r => r.area).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    fillSelect(els.fUnidade, unidades);
    fillSelect(els.fArea, areas);

    state.filtered = [...rows];
    renderChips();
    render();
  }

  // ===== Events =====
  function bind(){
    els.q.addEventListener('input', () => {
      state.filters.q = els.q.value.trim();
      applyFilters();
    });

    els.clearQ.addEventListener('click', () => {
      els.q.value = '';
      state.filters.q = '';
      applyFilters();
      els.q.focus();
    });

    els.btnFilters.addEventListener('click', () => {
      // sincroniza selects com estado
      els.fUnidade.value = state.filters.unidade;
      els.fArea.value = state.filters.area;
      els.dialog.showModal();
    });

    els.clearFilters.addEventListener('click', () => {
      state.filters.unidade = 'Todos';
      state.filters.area = 'Todos';
      applyFilters();
      els.dialog.close();
    });

    els.dialog.addEventListener('close', () => {
      // Se fechou por "Aplicar"
      if (els.dialog.returnValue === 'ok'){
        state.filters.unidade = els.fUnidade.value || 'Todos';
        state.filters.area = els.fArea.value || 'Todos';
        applyFilters();
      }
    });
  }

  // ===== Init =====
  bind();
  loadXlsx().catch(err => {
    console.error(err);
    els.countInfo.textContent = 'Erro ao carregar iniciativas';
    els.empty.classList.remove('hidden');
    els.empty.innerHTML = `
      <h2>Erro ao carregar o arquivo Excel</h2>
      <p>Confira se o arquivo está em <b>iniciativas.xlsx</b> e se o GitHub Pages está servindo a pasta corretamente.</p>
      <p style="color:#777;font-size:12px">${escapeHtml(err.message)}</p>
    `;
  });
})();