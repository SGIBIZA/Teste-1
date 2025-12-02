// ---------------------------
// SCRIPT N3 – Painel de Metas
// ---------------------------

function carregarN3() {
  Papa.parse("https://raw.githubusercontent.com/SGIBIZA/Teste-1/main/base_n3.csv", {
    download: true,
    header: true,
    complete: function (results) {
      const dados = results.data || [];

      const mesSelecionado = document.getElementById("filtroMes").value;   // ex.: "Março"
      const anoSelecionado = document.getElementById("filtroAno").value;   // ex.: "2025"

      // Atualiza o título dinamicamente
      document.querySelector("header h1").innerText =
        `Painel de Metas N3 – ${mesSelecionado} / ${anoSelecionado}`;

      const container = document.getElementById("cards-container");
      container.innerHTML = "";

      // ---------------- Filtro pelos campos corretos ----------------
      const filtrado = dados.filter(r => {
        const mesTexto = (r["Mês texto"] || "").trim(); // coluna do CSV
        const ano = String(r["Ano"] || "").trim();      // coluna do CSV

        return mesTexto === mesSelecionado && ano === anoSelecionado;
      });
      // --------------------------------------------------------------

      if (!filtrado || filtrado.length === 0) {
        container.innerHTML = `
          <div style="
            grid-column: 1 / -1;
            background: #fff8e1;
            border: 1px solid #f0c36d;
            padding: 20px;
            border-radius: 10px;
            text-align: center; 
            color: #6b4e16;
          ">
            Nenhum dado encontrado para ${mesSelecionado} / ${anoSelecionado}.
          </div>
        `;
        return;
      }

      // -------- Criar cards para cada linha filtrada --------
      filtrado.forEach(row => {
        const card = document.createElement("div");
        card.className = "card";

        const area      = row["Área"] || "-";
        const indicador = row["Indicador"] || "Sem nome";
        const meta      = row["Meta"] || "-";
        const resultado = row["Resultado"] || "-";
        const mesTexto  = row["Mês texto"] || "-";
        const status    = row["Status"] || "-";

        // Farol baseado no Status
        let farolClass = "amarelo";
        const statusNorm = status.toLowerCase();

        if (statusNorm.includes("atingida")) {
          farolClass = "verde";
        } else if (statusNorm.includes("parcial") || statusNorm.includes("andamento")) {
          farolClass = "amarelo";
        } else if (statusNorm.trim() === "" || statusNorm.includes("indefinido")) {
          farolClass = "vermelho"; // por enquanto joga pra vermelho
        } else {
          farolClass = "vermelho";
        }

        card.innerHTML = `
          <div class="farol ${farolClass}"></div>

          <h2>${indicador}</h2>

          <p><strong>Área:</strong> ${area}</p>
          <p><strong>Meta:</strong> ${meta}</p>
          <p><strong>Resultado:</strong> ${resultado}</p>
          <p><strong>Mês:</strong> ${mesTexto}</p>
          <p><strong>Status:</strong> ${status}</p>
        `;

        container.appendChild(card);
      });
      // -------------------------------------------------------
    }
  });
}

// Carregar ao abrir
document.addEventListener("DOMContentLoaded", carregarN3);

// Filtros
document.getElementById("filtroMes").addEventListener("change", carregarN3);
document.getElementById("filtroAno").addEventListener("change", carregarN3);
