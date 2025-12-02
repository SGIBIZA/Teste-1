// ---------------------------
// SCRIPT N3 – Painel de Metas
// ---------------------------

function carregarN3() {
  Papa.parse("https://raw.githubusercontent.com/SGIBIZA/Teste-1/main/base_n3.csv", {
    download: true,
    header: true,
    complete: function (results) {
      const dados = results.data;

      const mes = document.getElementById("filtroMes").value;
      const ano = document.getElementById("filtroAno").value;

      // Atualiza o título dinamicamente
      document.querySelector("header h1").innerText =
        `Painel de Metas N3 – ${mes} / ${ano}`;

      const container = document.getElementById("cards-container");
      container.innerHTML = "";

      // Filtrar dados
      const filtrado = dados.filter(r => r.Mês === mes && String(r.Ano) === ano);

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
            Nenhum dado encontrado para ${mes} / ${ano}.
          </div>
        `;
        return;
      }

      // Criar cards
      filtrado.forEach(row => {
        const card = document.createElement("div");
        card.className = "card";

        // Definir cor do farol
        let farolClass = "amarelo";
        if (row.Farol === "Verde") farolClass = "verde";
        if (row.Farol === "Vermelho") farolClass = "vermelho";

        card.innerHTML = `
          <div class="farol ${farolClass}"></div>

          <h2>${row.Indicador || "Sem nome"}</h2>

          <p><strong>Área:</strong> ${row.Área || "-"}</p>
          <p><strong>Resultado:</strong> ${row.Resultado || "-"}</p>
          <p><strong>Análise:</strong> ${row.Análise || "-"}</p>
          <p><strong>Ação:</strong> ${row.Ação || "-"}</p>
        `;

        container.appendChild(card);
      });
    }
  });
}

// Carregar ao abrir
document.addEventListener("DOMContentLoaded", carregarN3);

// Filtros
document.getElementById("filtroMes").addEventListener("change", carregarN3);
document.getElementById("filtroAno").addEventListener("change", carregarN3);
