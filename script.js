// Versículos para exibir aleatoriamente
const versiculos = [
  "Salmos 119:105 - Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.",
  "João 3:16 - Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito...",
  "Filipenses 4:13 - Tudo posso naquele que me fortalece.",
  "Isaías 41:10 - Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus.",
  "Provérbios 3:5 - Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento."
];

// Exibir versículo do dia
function mostrarVersiculo() {
  const dia = new Date().getDate();
  const versiculo = versiculos[dia % versiculos.length];
  document.getElementById("versiculo-dia").textContent = versiculo;
}

// Ao carregar a página
window.onload = () => {
  mostrarVersiculo();
};

