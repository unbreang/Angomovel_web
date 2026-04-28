// ============================================================
// SCRIPP.JS — Carregamento dinâmico de guias e destinos
// Página inicial AngoMovel
// ============================================================

// ── Destinos Mais Visitados ──
const destinos = [
    {
        id: 1,
        nome: "Ilha do Mussulo",
        localizacao: "Luanda",
        imagem: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
        visitas: 12450
    },
    {
        id: 2,
        nome: "Quedas de Calandula",
        localizacao: "Malanje",
        imagem: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80",
        visitas: 8750
    },
    {
        id: 3,
        nome: "Parque Nacional da Iona",
        localizacao: "Namibe",
        imagem: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80",
        visitas: 5430
    },
    {
        id: 4,
        nome: "Fenda da Tundavala",
        localizacao: "Huíla",
        imagem: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
        visitas: 3210
    },
    {
        id: 5,
        nome: "Epic Sana Luanda",
        localizacao: "Luanda",
        imagem: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
        visitas: 4003
    }
];

// ── Guias Mais Bem Avaliados ──
const guias = [
    {
        id: 1,
        nome: "João Santos",
        foto: "assets/timothy-barlin-2BJwlRZaR5M-unsplash.jpg",
        especialidade: "Guia de Praias",
        idiomas: ["Português", "Inglês"],
        avaliacao: 4.9,
        preco: 15000
    },
    {
        id: 2,
        nome: "Maria Fernandes",
        foto: "assets/stefan-stefancik-QXevDflbl8A-unsplash.jpg",
        especialidade: "Guia Cultural",
        idiomas: ["Português", "Espanhol"],
        avaliacao: 4.8,
        preco: 12000
    },
    {
        id: 3,
        nome: "Pedro Cambuta",
        foto: "assets/rodgers-otieno-DwTO1h0D4b4-unsplash.jpg",
        especialidade: "Guia de Aventura",
        idiomas: ["Português", "Inglês"],
        avaliacao: 4.7,
        preco: 18000
    },
    {
        id: 4,
        nome: "Ana Kianda",
        foto: "assets/michael-kyule-WFhRkXdI6_M-unsplash.jpg",
        especialidade: "Guia Gastronómica",
        idiomas: ["Português", "Francês"],
        avaliacao: 4.9,
        preco: 20000
    }
];

// ── Utilitários ──
function formatarPreco(preco) {
    return new Intl.NumberFormat('pt-AO').format(preco) + ' Kz';
}

function formatarVisitas(num) {
    return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;
}

function mostrarToast(msg) {
    const existing = document.querySelector('.toast-fav');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-fav';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// ── Renderizar Destinos ──
function carregarDestinos() {
    const container = document.getElementById('destinosContainer');
    if (!container) return;

    container.innerHTML = destinos.map((d, i) => `
        <div class="destino-card" onclick="window.location.href='abas/destino.html'">
            <img
                src="${d.imagem}"
                alt="${d.nome}"
                loading="lazy"
                onerror="this.src='https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80'"
            >
            <div class="destino-overlay">
                <h3 class="destino-nome">${d.nome}</h3>
                <p class="destino-local">📍 ${d.localizacao}</p>
                <div class="destino-stats">
                    <span>👁️ ${formatarVisitas(d.visitas)} visitas</span>
                    <span>❤️ ${formatarVisitas(Math.floor(d.visitas * 0.3))} favoritos</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ── Renderizar Guias ──
function carregarGuias() {
    const container = document.getElementById('guiasContainer');
    if (!container) return;

    container.innerHTML = guias.map(g => `
        <div class="guide-card" onclick="window.location.href='abas/guia.html'">
            <div class="guide-image">
                <img
                    src="${g.foto}"
                    alt="${g.nome}"
                    loading="lazy"
                    onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80'"
                >
                <div class="guide-rating-badge">⭐ ${g.avaliacao}</div>
            </div>
            <div class="guide-info">
                <h3 class="guide-name">${g.nome}</h3>
                <p class="guide-specialty">${g.especialidade}</p>
                <div class="guide-languages">
                    ${g.idiomas.map(i => `<span class="language-badge">${i}</span>`).join('')}
                </div>
                <div class="guide-price">
                    ${formatarPreco(g.preco)} <span>/dia</span>
                </div>
                <button class="btn-hire" onclick="event.stopPropagation(); window.location.href='abas/guia.html'">
                    📅 Agendar Agora
                </button>
            </div>
        </div>
    `).join('');
}

// ── Inicializar quando a página carregar ──
document.addEventListener('DOMContentLoaded', () => {
    carregarDestinos();
    carregarGuias();
});