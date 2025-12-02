// =============================
// SCRIPT PARA METAS N3
// =============================

// Caminho do CSV no GitHub Pages
const CSV_URL = "base_n3.csv"; 

// Normaliza nomes de colunas (Á → A, ç → c, remove espaços etc.)
function normalizar(str) {
  return (str || "")
    .toString()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w]/g, "");
}

// Variáveis que serão preenchidas com os nomes reais das colunas do CSV
let campoArea, campoIndicador, campoMeta, campoResultado, campoMesTexto, campoAno, campoStatus;

// Mapeia os nomes reais do CSV para o script
function mapearCampos(listaCampos) {
  function achar(alvo) {
    const alvoNorm = normalizar(alvo);
    return listaCampos.find(c => normalizar(c) === alvoNorm) || alvo;
  }
  campoArea       = achar("Área");
  campoIndicador  = achar("Indicador");
  campoMeta       = achar("Meta");
  campoResultado  = achar("Resultado");
  campoMesTexto   = achar("Mês texto");
  campoAno        = achar("Ano");
  campoStatus     = achar("Status");
}

// Determina cor do farol
function corFarol(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("ñ atingido")) return "vermelho";
  if (s.includes("atingido")) return "verde";
  if (s.includes("indef")) return "amarelo";
  return "amarelo";
}

// Cria um card de visualização
function criarCard(meta) {
  const div = document.createElement("div");
  const farol = corFarol(meta[campoStatus]);

  div.className = "card";
  div.innerHTML = `
    <h2>${meta[campoIndicador]}</h2>
    <p><strong>Área:</strong> ${meta[campoArea]}</p>
    <p><strong>Meta:</strong> ${meta[campoMeta]}</p>
    <p><strong>Resultado:</strong> ${meta[campoResultado]}</p>
    <p><strong>Status:</strong> ${meta[campoStatus]}</p>
    <p><strong>Mês:</strong> ${meta[campoMesTexto]}</p>
    <div class="farol ${farol}"></div>
  `;
  return div;
}

// Preenche os filtros Mês / Ano
function preencherFiltros(dados) {
  const selMes = document.getElementById("filtroMes");
  const selAno = document.getElementById("filtroAno");

  const meses = [...new Set(dados.map(d => d[campoMesTexto]))].filter(Boolean);
  const anos  = [...new Set(dados.map(d => d[campoAno]))].filter(Boolean);

  selMes.innerHTML = "";
  selAno.innerHTML = "";

  meses.forEach(m => selMes.innerHTML += `<option value="${m}">${m}</option>`);
  anos.forEach(a => selAno.innerHTML += `<option value="${a}">${a}</option>`);
}

// Atualiza os cards conforme filtros
function atualizarCards(dados) {
  const mes = document.getElementById("filtroMes").value;
  const ano = document.getElementById("filtroAno").value;

  const filtrado = dados.filter(d =>
    d[campoMesTexto] === mes &&
    String(d[campoAno]) === String(ano)
  );

  const container = document.getElementById("cards-container");
  container.innerHTML = "";

  filtrado.forEach(item => container.appendChild(criarCard(item)));
}

// Carrega o CSV e inicia tudo
function carregarN3() {
  Papa.parse(CSV_URL, {
    download: true,
    header: true,
    delimiter: ";",
    skipEmptyLines: true,

    complete: function (results) {
      const dados = results.data;

      // Lista de colunas reais do CSV
      const campos = results.meta.fields;
      mapearCampos(campos);

      // Filtra somente linhas válidas
      const filtrado = dados.filter(l =>
        l[campoIndicador] &&
        l[campoMesTexto]
      );

      preencherFiltros(filtrado);
      atualizarCards(filtrado);

      // Eventos
      document.getElementById("filtroMes").addEventListener("change", () => atualizarCards(filtrado));
      document.getElementById("filtroAno").addEventListener("change", () => atualizarCards(filtrado));
    },

    error: function (err) {
      console.error("Erro ao carregar CSV METAS N3:", err);
    }
  });
}

// Quando a página abrir → carrega N3
document.addEventListener("DOMContentLoaded", carregarN3);
