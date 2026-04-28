// ============================================================
// DESTINO.JS — Mapa interativo de Angola com sistema de
// favoritos linkado com a aba Destinos
// ============================================================

// ── Dados dos destinos ──
const destinos = [
    {
        id: 1,
        nome: "Ilha de Luanda",
        cidade: "Luanda",
        coordenadas: [-8.7833, 13.2833],
        descricao: "Principal ponto turístico da capital, com praias, restaurantes e vida noturna",
        tipo: "praia",
        icone: "🏖️",
        info: "Acesso por ponte, muitos quiosques e hotéis"
    },
    {
        id: 2,
        nome: "Praia Morena",
        cidade: "Benguela",
        coordenadas: [-12.5833, 13.4167],
        descricao: "Águas claras e tranquilas, ideal para famílias",
        tipo: "praia",
        icone: "🏝️",
        info: "Boa infraestrutura, estacionamento disponível"
    },
    {
        id: 3,
        nome: "Serra da Leba",
        cidade: "Namibe",
        coordenadas: [-15.0833, 13.2667],
        descricao: "Estrada montanhosa com paisagens deslumbrantes",
        tipo: "montanha",
        icone: "⛰️",
        info: "Vista panorâmica, ótimo para fotos"
    },
    {
        id: 4,
        nome: "Praia do Sonho",
        cidade: "Namibe",
        coordenadas: [-15.1667, 12.1500],
        descricao: "Uma das mais belas praias de Angola",
        tipo: "praia",
        icone: "🌊",
        info: "Natureza preservada, águas cristalinas"
    },
    {
        id: 5,
        nome: "Restinga",
        cidade: "Lobito",
        coordenadas: [-12.3500, 13.5500],
        descricao: "Península com praias urbanas e calçadão",
        tipo: "praia",
        icone: "🌅",
        info: "Por do sol espetacular, bares e restaurantes"
    },
    {
        id: 6,
        nome: "Sangano",
        cidade: "Luanda",
        coordenadas: [-9.5833, 13.1500],
        descricao: "Praia famosa para surf e esportes aquáticos",
        tipo: "praia",
        icone: "🏄",
        info: "Ondas fortes, escola de surf disponível"
    },
    {
        id: 7,
        nome: "Fenda da Tundavala",
        cidade: "Huíla",
        coordenadas: [-14.8167, 13.2333],
        descricao: "Desfiladeiro com vista impressionante",
        tipo: "natureza",
        icone: "🏞️",
        info: "Mirante natural, trekking e fotografia"
    },
    {
        id: 8,
        nome: "Caota",
        cidade: "Namibe",
        coordenadas: [-15.0333, 12.2167],
        descricao: "Praia selvagem cercada por falésias",
        tipo: "praia",
        icone: "🏜️",
        info: "Acesso 4x4 recomendado, natureza intocada"
    }
];

// ── Variáveis globais ──
let mapa;
let marcadores = [];
let rotaAtual = null;
let transporteAtual = 'car';
let destinoSelecionado = null;

// ── Sistema de Favoritos (3 tipos) ──
// favorito: ❤️ | visitar: 📍 | guia: 🧭
const TIPOS_FAV = { favorito: 'favorito', visitar: 'visitar', guia: 'guia' };

function carregarFavoritosStorage() {
    try {
        return JSON.parse(localStorage.getItem('angomovel_favoritos')) || {};
    } catch { return {}; }
}

function salvarFavoritosStorage(favs) {
    localStorage.setItem('angomovel_favoritos', JSON.stringify(favs));
}

function toggleFavorito(destinoId, tipo) {
    const favs = carregarFavoritosStorage();
    if (!favs[destinoId]) favs[destinoId] = {};

    if (favs[destinoId][tipo]) {
        delete favs[destinoId][tipo];
        if (Object.keys(favs[destinoId]).length === 0) delete favs[destinoId];
        mostrarToast(mensagemToast(tipo, false));
    } else {
        favs[destinoId][tipo] = true;
        mostrarToast(mensagemToast(tipo, true));

        // Se marcou como "visitar" → adiciona à rota automática
        if (tipo === TIPOS_FAV.visitar) {
            adicionarAosDestaques(destinoId);
        }
    }

    salvarFavoritosStorage(favs);
    atualizarBotoesFav(destinoId);
    atualizarDestaques();
}

function isFavorito(destinoId, tipo) {
    const favs = carregarFavoritosStorage();
    return !!(favs[destinoId] && favs[destinoId][tipo]);
}

function mensagemToast(tipo, adicionado) {
    const emojis = { favorito: '❤️', visitar: '📍', guia: '🧭' };
    const labels = { favorito: 'Favorito', visitar: 'Visitar', guia: 'Para o Guia' };
    return adicionado
        ? `${emojis[tipo]} Adicionado a "${labels[tipo]}"`
        : `${emojis[tipo]} Removido de "${labels[tipo]}"`;
}

function mostrarToast(msg) {
    const existing = document.querySelector('.toast-fav');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-fav';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
}

function atualizarBotoesFav(destinoId) {
    const btns = document.querySelectorAll(`[data-fav-id="${destinoId}"]`);
    btns.forEach(btn => {
        const tipo = btn.dataset.favTipo;
        btn.classList.toggle('ativo', isFavorito(destinoId, tipo));
    });
}

// ── Destaques (lugares marcados como "Visitar") ──
function adicionarAosDestaques(destinoId) {
    atualizarDestaques();
}

function atualizarDestaques() {
    const favs = carregarFavoritosStorage();
    const container = document.getElementById('destaquesList');
    if (!container) return;

    const paraVisitar = Object.keys(favs).filter(id => favs[id][TIPOS_FAV.visitar]);

    if (paraVisitar.length === 0) {
        container.innerHTML = '<span style="font-size:11px;color:#999;">Marque destinos para visitar</span>';
        return;
    }

    container.innerHTML = paraVisitar.map(id => {
        const d = destinos.find(dest => dest.id === parseInt(id));
        if (!d) return '';
        return `<div class="destaque-item" onclick="selecionarDestino(${d.id})">
            ${d.icone} ${d.nome}
        </div>`;
    }).join('');
}

// ── Inicializar mapa ──
function initMap() {
    mapa = L.map('mapa').setView([-12.5, 17.5], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(mapa);

    L.control.zoom({ position: 'topright' }).addTo(mapa);
    L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(mapa);

    carregarDestinos();
    preencherSelects();
    atualizarDestaques();
}

// ── Carregar destinos no mapa e na lista ──
function carregarDestinos() {
    const listaContainer = document.getElementById('destinosLista');
    listaContainer.innerHTML = '';

    destinos.forEach(destino => {
        // Marcador personalizado
        const iconePersonalizado = L.divIcon({
            html: `<div style="
                background: white;
                border-radius: 50%;
                width: 34px; height: 34px;
                display: flex; align-items: center; justify-content: center;
                border: 2px solid #E61C2E;
                box-shadow: 0 3px 8px rgba(0,0,0,0.25);
                font-size: 16px;
            ">${destino.icone}</div>`,
            className: '',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
        });

        const marcador = L.marker(destino.coordenadas, {
            icon: iconePersonalizado
        }).addTo(mapa);

        marcador.bindPopup(`
            <div class="popup-conteudo">
                <h4>${destino.icone} ${destino.nome}</h4>
                <p><strong>📍 ${destino.cidade}</strong></p>
                <p>${destino.descricao}</p>
                <p><small>${destino.info}</small></p>
            </div>
        `);

        marcador.on('click', () => selecionarDestino(destino.id));
        marcadores.push({ id: destino.id, marcador, dados: destino });

        // Item na lista lateral
        const el = document.createElement('div');
        el.className = 'destino-item';
        el.dataset.id = destino.id;
        el.onclick = () => selecionarDestino(destino.id);

        el.innerHTML = `
            <h4>${destino.icone} ${destino.nome}</h4>
            <div class="cidade">${destino.cidade}</div>
            <div class="descricao">${destino.descricao}</div>
            <div class="coordenadas">Lat: ${destino.coordenadas[0].toFixed(4)}, Long: ${destino.coordenadas[1].toFixed(4)}</div>
            <div class="fav-btns" onclick="event.stopPropagation()">
                <button class="btn-fav tipo-favorito ${isFavorito(destino.id, 'favorito') ? 'ativo' : ''}"
                    data-fav-id="${destino.id}" data-fav-tipo="favorito"
                    data-tooltip="Favorito"
                    onclick="toggleFavorito(${destino.id}, 'favorito')">❤️</button>
                <button class="btn-fav tipo-visitar ${isFavorito(destino.id, 'visitar') ? 'ativo' : ''}"
                    data-fav-id="${destino.id}" data-fav-tipo="visitar"
                    data-tooltip="Quero Visitar"
                    onclick="toggleFavorito(${destino.id}, 'visitar')">📍</button>
                <button class="btn-fav tipo-guia ${isFavorito(destino.id, 'guia') ? 'ativo' : ''}"
                    data-fav-id="${destino.id}" data-fav-tipo="guia"
                    data-tooltip="Para o Guia"
                    onclick="toggleFavorito(${destino.id}, 'guia')">🧭</button>
            </div>
        `;

        listaContainer.appendChild(el);
    });
}

// ── Preencher selects de rota ──
function preencherSelects() {
    const origemSelect = document.getElementById('origem');
    const destinoSelect = document.getElementById('destino');

    origemSelect.innerHTML = '<option value="">📍 Selecione a origem</option>';
    destinoSelect.innerHTML = '<option value="">🏁 Selecione o destino</option>';

    destinos.forEach(d => {
        const opt = `<option value="${d.id}">${d.icone} ${d.nome} — ${d.cidade}</option>`;
        origemSelect.innerHTML += opt;
        destinoSelect.innerHTML += opt;
    });
}

// ── Selecionar destino ──
function selecionarDestino(id) {
    document.querySelectorAll('.destino-item').forEach(i => i.classList.remove('ativo'));
    const item = document.querySelector(`.destino-item[data-id="${id}"]`);
    if (item) {
        item.classList.add('ativo');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const marcadorInfo = marcadores.find(m => m.id === id);
    if (marcadorInfo) {
        mapa.setView(marcadorInfo.dados.coordenadas, 10);
        marcadorInfo.marcador.openPopup();
        destinoSelecionado = marcadorInfo.dados;
    }
}

// ── Traçar rota ──
function tracarRota(origemId, destinoId) {
    limparRota();

    const origem = destinos.find(d => d.id === parseInt(origemId));
    const destino = destinos.find(d => d.id === parseInt(destinoId));

    if (!origem || !destino) {
        mostrarToast('⚠️ Selecione origem e destino válidos');
        return;
    }

    rotaAtual = L.Routing.control({
        waypoints: [
            L.latLng(origem.coordenadas[0], origem.coordenadas[1]),
            L.latLng(destino.coordenadas[0], destino.coordenadas[1])
        ],
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: transporteAtual
        }),
        lineOptions: {
            styles: [{ color: '#E61C2E', opacity: 0.85, weight: 6 }]
        },
        showAlternatives: true,
        fitSelectedRoutes: true,
        show: false
    }).addTo(mapa);

    rotaAtual.on('routesfound', function(e) {
        const route = e.routes[0];
        const tempoSeg = route.summary.totalTime;
        const horas = Math.floor(tempoSeg / 3600);
        const minutos = Math.floor((tempoSeg % 3600) / 60);
        let tempoStr = horas > 0 ? `${horas}h ` : '';
        tempoStr += minutos > 0 ? `${minutos}min` : '< 1min';

        document.getElementById('rotaOrigem').textContent    = `Origem: ${origem.icone} ${origem.nome}`;
        document.getElementById('rotaDestino').textContent   = `Destino: ${destino.icone} ${destino.nome}`;
        document.getElementById('rotaDistancia').textContent = `Distância: ${(route.summary.totalDistance / 1000).toFixed(1)} km`;
        document.getElementById('rotaTempo').textContent     = `Tempo estimado: ${tempoStr}`;
        document.getElementById('rotaInfo').classList.add('mostrar');
    });
}

// ── Limpar rota ──
function limparRota() {
    if (rotaAtual) {
        mapa.removeControl(rotaAtual);
        rotaAtual = null;
    }
    document.getElementById('rotaInfo').classList.remove('mostrar');
}

// ── Event Listeners ──
document.addEventListener('DOMContentLoaded', function () {
    initMap();

    document.getElementById('traçarRota').addEventListener('click', function () {
        const origem  = document.getElementById('origem').value;
        const destino = document.getElementById('destino').value;
        if (origem && destino) {
            tracarRota(origem, destino);
        } else {
            mostrarToast('⚠️ Selecione origem e destino');
        }
    });

    document.getElementById('limparRota').addEventListener('click', limparRota);

    document.querySelectorAll('.transporte-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.transporte-btn').forEach(b => b.classList.remove('ativo'));
            this.classList.add('ativo');
            transporteAtual = this.dataset.transporte;
            if (rotaAtual) {
                const origem  = document.getElementById('origem').value;
                const destino = document.getElementById('destino').value;
                if (origem && destino) { limparRota(); tracarRota(origem, destino); }
            }
        });
    });
});