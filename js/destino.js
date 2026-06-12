// ============================================================
// DESTINO.JS — Mapa Dinâmico AngoMovel
// Leaflet + OpenStreetMap + Nominatim + OSRM
// ============================================================

// ── Destinos turísticos de Angola ──
const destinosAngola = [
    { id: 1,  nome: 'Ilha do Mussulo',                lat: -9.0,    lng: 13.1667, cidade: 'Luanda',   desc: 'Península paradisíaca com praias deslumbrantes e águas cristalinas.', emoji: '🏖️', categoria: 'praia' },
    { id: 2,  nome: 'Quedas de Calandula',            lat: -9.0856, lng: 15.9533, cidade: 'Malanje',  desc: 'Uma das maiores cataratas de África com 105m de altura.', emoji: '💧', categoria: 'natureza' },
    { id: 3,  nome: 'Parque Nacional da Iona',        lat: -16.633, lng: 12.383,  cidade: 'Namibe',   desc: 'Maior parque nacional de Angola com paisagens desérticas únicas.', emoji: '🦁', categoria: 'parque' },
    { id: 4,  nome: 'Fenda da Tundavala',             lat: -14.916, lng: 13.5,    cidade: 'Huíla',    desc: 'Vista deslumbrante da Serra da Leba a 2.300m de altitude.', emoji: '🏔️', categoria: 'natureza' },
    { id: 5,  nome: 'Pedras Negras de Pungo Andongo', lat: -9.683,  lng: 15.716,  cidade: 'Malanje',  desc: 'Maravilha geológica com rochas de granito gigantes.', emoji: '🗿', categoria: 'cultura' },
    { id: 6,  nome: 'Lagoa Carumbo',                  lat: -8.333,  lng: 19.666,  cidade: 'Lunda Norte', desc: 'Lagoa paradisíaca no coração do Leste angolano.', emoji: '💎', categoria: 'natureza' },
    { id: 7,  nome: 'Luanda',                         lat: -8.836,  lng: 13.234,  cidade: 'Luanda',   desc: 'Capital vibrante com baía, fortaleza e cultura única.', emoji: '🏙️', categoria: 'cidade' },
    { id: 8,  nome: 'Benguela',                       lat: -12.576, lng: 13.405,  cidade: 'Benguela', desc: 'Cidade histórica do litoral com belas praias.', emoji: '🌊', categoria: 'praia' },
    { id: 9,  nome: 'Namibe',                         lat: -15.196, lng: 12.152,  cidade: 'Namibe',   desc: 'Portal do deserto com paisagens lunares únicas.', emoji: '🏜️', categoria: 'natureza' },
    { id: 10, nome: 'Malanje',                        lat: -9.540,  lng: 16.341,  cidade: 'Malanje',  desc: 'Cidade histórica próxima das Pedras Negras.', emoji: '🪨', categoria: 'cidade' },
    { id: 11, nome: 'Huambo',                         lat: -12.775, lng: 15.736,  cidade: 'Huambo',   desc: 'Cidade do planalto central com clima fresco.', emoji: '🚂', categoria: 'cidade' },
    { id: 12, nome: 'Cabinda',                        lat: -5.547,  lng: 12.188,  cidade: 'Cabinda',  desc: 'Enclave com floresta tropical rica em biodiversidade.', emoji: '🌴', categoria: 'natureza' },
    { id: 13, nome: 'Morro do Môco',                  lat: -11.366, lng: 14.866,  cidade: 'Huambo',   desc: 'Ponto mais alto de Angola com 2.620 metros.', emoji: '⛰️', categoria: 'natureza' },
    { id: 14, nome: 'Floresta do Mayombe',            lat: -4.9,    lng: 12.5,    cidade: 'Cabinda',  desc: 'Floresta tropical densa com fauna e flora ricas.', emoji: '🌿', categoria: 'natureza' },
    { id: 15, nome: 'Mbanza Kongo',                   lat: -6.266,  lng: 14.25,   cidade: 'Zaire',    desc: 'Antiga capital do Reino do Kongo, Património UNESCO.', emoji: '🏛️', categoria: 'cultura' },
];

// ── Estado ──
let mapa, routingControl, marcadorUser;
let tipoTransporte = 'car';
let timeoutPesq    = null;
let destinoActivo  = null;
let marcadores     = [];

// ── Inicializar mapa ──
document.addEventListener('DOMContentLoaded', () => {
    inicializarMapa();
    carregarDestinos();
    carregarDestaques();
    carregarFavoritos();
    preencherDatalist();
});

function inicializarMapa() {
    mapa = L.map('mapa', {
        center: [-11.2027, 17.8739],
        zoom: 6,
        zoomControl: false,
    });

    // Controlo de zoom à direita
    L.control.zoom({ position: 'bottomright' }).addTo(mapa);

    // Tiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    }).addTo(mapa);

    // Adicionar marcadores
    destinosAngola.forEach(d => adicionarMarcador(d));
}

// ── Ícones ──
function criarIcone(cor = '#E8192C') {
    return L.divIcon({
        html: `<div style="
            width:26px;height:26px;
            background:${cor};
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:2px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,0.35);
        "></div>`,
        iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -28],
        className: '',
    });
}

const iconeUser = L.divIcon({
    html: `<div style="
        width:22px;height:22px;
        background:#4CAF50;border-radius:50%;
        border:3px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [22, 22], iconAnchor: [11, 11],
    className: '',
});

// ── Adicionar marcador no mapa ──
function adicionarMarcador(d) {
    const m = L.marker([d.lat, d.lng], { icon: criarIcone() })
        .addTo(mapa)
        .bindPopup(criarPopup(d), { maxWidth: 240 });

    m.on('click', () => destacarItem(d.id));
    marcadores.push({ id: d.id, marcador: m });
}

function criarPopup(d) {
    const favs = obterFavoritos();
    const isFav = favs.some(f => f.id === d.id);
    return `
        <div style="font-family:sans-serif;min-width:200px;">
            <div style="font-size:22px;margin-bottom:4px;">${d.emoji}</div>
            <strong style="font-size:14px;color:#E8192C;">${d.nome}</strong><br>
            <span style="font-size:11px;color:#888;">📍 ${d.cidade}</span><br>
            <p style="font-size:12px;color:#555;margin:6px 0;line-height:1.5;">${d.desc}</p>
            <div style="display:flex;gap:6px;margin-top:8px;">
                <button onclick="usarComoDestino('${d.nome}')"
                    style="flex:1;background:#E8192C;color:#fff;border:none;padding:7px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;">
                    🧭 Ir para aqui
                </button>
                <button onclick="toggleFavMapa(${d.id}, '${d.nome}', '${d.cidade}')"
                    id="favBtn${d.id}"
                    style="background:${isFav ? '#E8192C' : '#f5f5f5'};color:${isFav ? '#fff' : '#333'};border:none;padding:7px 10px;border-radius:6px;cursor:pointer;font-size:14px;">
                    ${isFav ? '❤️' : '🤍'}
                </button>
            </div>
        </div>
    `;
}

// ── Carregar lista de destinos na sidebar ──
function carregarDestinos() {
    const lista = document.getElementById('destinosLista');
    lista.innerHTML = destinosAngola.map(d => `
        <div class="destino-item" id="item-${d.id}" onclick="focarDestino(${d.id})">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="font-size:20px;">${d.emoji}</span>
                <h4>${d.nome}</h4>
            </div>
            <div class="cidade">${d.cidade}</div>
            <div class="descricao">${d.desc}</div>
            <div style="display:flex;gap:6px;margin-top:8px;">
                <button onclick="event.stopPropagation(); usarComoDestino('${d.nome}')"
                    style="flex:1;padding:6px;background:#E8192C;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;">
                    🧭 Usar como destino
                </button>
                <button onclick="event.stopPropagation(); toggleFavMapa(${d.id}, '${d.nome}', '${d.cidade}')"
                    id="favSide${d.id}"
                    style="padding:6px 10px;background:#f5f5f5;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
                    ${obterFavoritos().some(f => f.id === d.id) ? '❤️' : '🤍'}
                </button>
            </div>
        </div>
    `).join('');
}

// ── Focar num destino ──
function focarDestino(id) {
    const d = destinosAngola.find(d => d.id === id);
    if (!d) return;

    destinoActivo = id;

    // Ir para o marcador
    mapa.setView([d.lat, d.lng], 12, { animate: true });

    // Abrir popup
    const m = marcadores.find(m => m.id === id);
    if (m) m.marcador.openPopup();

    // Destacar item na sidebar
    document.querySelectorAll('.destino-item').forEach(el => el.classList.remove('ativo'));
    document.getElementById(`item-${id}`)?.classList.add('ativo');
    document.getElementById(`item-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function destacarItem(id) {
    document.querySelectorAll('.destino-item').forEach(el => el.classList.remove('ativo'));
    document.getElementById(`item-${id}`)?.classList.add('ativo');
    document.getElementById(`item-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Destaques no mapa ──
function carregarDestaques() {
    const destaques = destinosAngola.slice(0, 5);
    document.getElementById('destaquesList').innerHTML = destaques.map(d => `
        <div class="destaque-item" onclick="focarDestino(${d.id})">
            ${d.emoji} ${d.nome}
        </div>
    `).join('');
}

// ── Preenchimento dos datalists ──
function preencherDatalist() {
    const nomes = destinosAngola.map(d => `<option value="${d.nome}">`).join('');
    document.getElementById('origemSugestoes').innerHTML  = nomes;
    document.getElementById('destinoSugestoes').innerHTML = nomes;
}

// ── Pesquisa dinâmica (Nominatim) ──
function pesquisar() {
    const texto = document.getElementById('inputPesquisa').value.trim();
    const sugestoesEl = document.getElementById('sugestoes');
    const btnLimpar = document.getElementById('btnLimparPesq');

    btnLimpar.style.display = texto ? 'flex' : 'none';
    clearTimeout(timeoutPesq);

    // Primeiro filtra localmente
    if (texto.length >= 2) {
        const local = destinosAngola.filter(d =>
            d.nome.toLowerCase().includes(texto.toLowerCase()) ||
            d.cidade.toLowerCase().includes(texto.toLowerCase())
        );

        if (local.length > 0) {
            sugestoesEl.style.display = 'block';
            sugestoesEl.innerHTML = local.map(d => `
                <div class="sugestao-item" onclick="focarDestino(${d.id})">
                    ${d.emoji} <strong>${d.nome}</strong> — ${d.cidade}
                </div>
            `).join('');
            return;
        }
    }

    // Depois pesquisa online (Nominatim)
    if (texto.length >= 3) {
        timeoutPesq = setTimeout(async () => {
            try {
                const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(texto + ' Angola')}&format=json&limit=5&accept-language=pt`);
                const data = await res.json();

                if (!data.length) { sugestoesEl.style.display = 'none'; return; }

                sugestoesEl.style.display = 'block';
                sugestoesEl.innerHTML = data.map(item => `
                    <div class="sugestao-item" onclick="irParaCoordenadas(${item.lat}, ${item.lon}, '${item.display_name.split(',')[0].replace(/'/g, "\\'")}')">
                        📍 ${item.display_name.split(',').slice(0,2).join(',')}
                    </div>
                `).join('');
            } catch (e) { sugestoesEl.style.display = 'none'; }
        }, 500);
    } else {
        sugestoesEl.style.display = 'none';
    }
}

function irParaCoordenadas(lat, lng, nome) {
    mapa.setView([lat, lng], 13, { animate: true });
    document.getElementById('sugestoes').style.display = 'none';
    document.getElementById('inputPesquisa').value = nome;

    L.marker([lat, lng], { icon: criarIcone('#D4A017') })
        .addTo(mapa)
        .bindPopup(`<strong>${nome}</strong>`)
        .openPopup();
}

function limparPesquisa() {
    document.getElementById('inputPesquisa').value = '';
    document.getElementById('sugestoes').style.display = 'none';
    document.getElementById('btnLimparPesq').style.display = 'none';
}

// ── Usar como destino ──
function usarComoDestino(nome) {
    document.getElementById('destinoInput').value = nome;
    mostrarStatus(`🏁 Destino definido: ${nome}`, 'ok');
}

// ── Selecionar transporte ──
function selTransporte(tipo, btn) {
    tipoTransporte = tipo;
    document.querySelectorAll('.transporte-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    if (routingControl) calcularRota(); // recalcular se já existe rota
}

// ── Calcular rota ──
async function calcularRota() {
    const origemTexto  = document.getElementById('origemInput').value.trim();
    const destinoTexto = document.getElementById('destinoInput').value.trim();

    if (!origemTexto || !destinoTexto) {
        mostrarStatus('⚠️ Preenche a origem e o destino!', 'erro');
        return;
    }

    mostrarStatus('🔄 A calcular rota...', '');

    try {
        // Geocodificar os dois pontos
        const [resO, resD] = await Promise.all([
            fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(origemTexto + ' Angola')}&format=json&limit=1`),
            fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destinoTexto + ' Angola')}&format=json&limit=1`),
        ]);

        const [dataO, dataD] = await Promise.all([resO.json(), resD.json()]);

        if (!dataO.length) { mostrarStatus(`❌ "${origemTexto}" não encontrado`, 'erro'); return; }
        if (!dataD.length) { mostrarStatus(`❌ "${destinoTexto}" não encontrado`, 'erro'); return; }

        const ptO = L.latLng(parseFloat(dataO[0].lat), parseFloat(dataO[0].lon));
        const ptD = L.latLng(parseFloat(dataD[0].lat), parseFloat(dataD[0].lon));

        // Perfil de transporte
        const perfis = { car: 'car', bike: 'bike', foot: 'foot' };
        const perfil = perfis[tipoTransporte] || 'car';

        // Remover rota anterior
        if (routingControl) mapa.removeControl(routingControl);

        // Criar rota
        routingControl = L.Routing.control({
            waypoints: [ptO, ptD],
            routeWhileDragging: true,
            showAlternatives: true,
            router: L.Routing.osrmv1({
                serviceUrl: `https://router.project-osrm.org/route/v1`,
                profile: perfil,
            }),
            lineOptions: {
                styles: [{ color: '#E8192C', weight: 5, opacity: 0.85 }],
            },
            altLineOptions: {
                styles: [{ color: '#F0B429', weight: 3, opacity: 0.6 }],
            },
            createMarker: (i, wp) => {
                return L.marker(wp.latLng, {
                    icon: L.divIcon({
                        html: `<div style="
                            width:32px;height:32px;
                            background:${i === 0 ? '#4CAF50' : '#E8192C'};
                            border-radius:50%;border:3px solid #fff;
                            display:flex;align-items:center;justify-content:center;
                            color:#fff;font-weight:900;font-size:15px;
                            box-shadow:0 2px 10px rgba(0,0,0,0.3);
                        ">${i === 0 ? 'A' : 'B'}</div>`,
                        iconSize: [32,32], iconAnchor: [16,16], className: '',
                    })
                });
            },
            collapsible: true,
        }).addTo(mapa);

        // Quando a rota for calculada
        routingControl.on('routesfound', e => {
            const rota  = e.routes[0].summary;
            const dist  = (rota.totalDistance / 1000).toFixed(1);
            const mins  = Math.round(rota.totalTime / 60);
            const horas = Math.floor(mins / 60);
            const minR  = mins % 60;
            const tempo = horas > 0 ? `${horas}h ${minR}min` : `${minR} min`;

            // Mostrar info
            document.getElementById('rotaOrigem').textContent   = origemTexto;
            document.getElementById('rotaDestino').textContent  = destinoTexto;
            document.getElementById('rotaDistancia').textContent = `${dist} km`;
            document.getElementById('rotaTempo').textContent    = tempo;
            document.getElementById('rotaInfo').classList.add('mostrar');

            mostrarStatus(`✅ Rota calculada: ${dist} km • ${tempo}`, 'ok');
        });

        routingControl.on('routingerror', () => {
            mostrarStatus('❌ Não foi possível calcular a rota', 'erro');
        });

    } catch (e) {
        mostrarStatus(`❌ Erro: ${e.message}`, 'erro');
    }
}

// ── Limpar rota ──
function limparRota() {
    if (routingControl) { mapa.removeControl(routingControl); routingControl = null; }
    document.getElementById('rotaInfo').classList.remove('mostrar');
    document.getElementById('origemInput').value  = '';
    document.getElementById('destinoInput').value = '';
    mostrarStatus('🗑️ Rota removida', '');
}

// ── Minha localização ──
function minhaLocalizacao() {
    if (!navigator.geolocation) {
        mostrarStatus('❌ O teu browser não suporta geolocalização', 'erro');
        return;
    }

    mostrarStatus('📡 A obter localização...', '');

    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (marcadorUser) mapa.removeLayer(marcadorUser);
        marcadorUser = L.marker([lat, lng], { icon: iconeUser })
            .addTo(mapa)
            .bindPopup('<strong>📍 A tua localização</strong>')
            .openPopup();

        mapa.setView([lat, lng], 12, { animate: true });
        document.getElementById('origemInput').value = 'A minha localização';
        mostrarStatus('✅ Localização obtida com sucesso!', 'ok');

    }, () => {
        mostrarStatus('❌ Não foi possível obter a localização', 'erro');
    });
}

// ── Favoritos ──
function obterFavoritos() {
    return JSON.parse(localStorage.getItem('angomovel_favoritos') || '[]');
}

function toggleFavMapa(id, nome, cidade) {
    const token = localStorage.getItem('angomovel_token');
    if (!token) {
        mostrarStatus('👤 Faz login para guardar favoritos!', 'erro');
        return;
    }

    let favs = obterFavoritos();
    const idx = favs.findIndex(f => f.id === id);
    const adicionado = idx < 0;

    if (adicionado) {
        favs.push({
            id, nome,
            local: cidade,
            imagem: `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80`,
            data: new Date().toISOString()
        });
        mostrarStatus(`❤️ ${nome} adicionado aos favoritos!`, 'ok');
    } else {
        favs.splice(idx, 1);
        mostrarStatus(`💔 ${nome} removido dos favoritos`, '');
    }

    localStorage.setItem('angomovel_favoritos', JSON.stringify(favs));

    // Actualizar botões
    const emoji = adicionado ? '❤️' : '🤍';
    const btnMapa = document.getElementById(`favBtn${id}`);
    const btnSide = document.getElementById(`favSide${id}`);
    if (btnMapa) { btnMapa.textContent = emoji; btnMapa.style.background = adicionado ? '#E8192C' : '#f5f5f5'; btnMapa.style.color = adicionado ? '#fff' : '#333'; }
    if (btnSide) btnSide.textContent = emoji;

    carregarFavoritos();
}

function carregarFavoritos() {
    const favs = obterFavoritos();
    const secao = document.getElementById('secaoFavoritos');
    const lista = document.getElementById('listaFavoritos');

    if (favs.length === 0) {
        secao.style.display = 'none';
        return;
    }

    secao.style.display = 'block';
    lista.innerHTML = favs.map(f => {
        const d = destinosAngola.find(d => d.id === f.id);
        return `
            <div class="destino-item" onclick="${d ? `focarDestino(${d.id})` : ''}">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                    <span style="font-size:18px;">${d?.emoji || '📍'}</span>
                    <h4>${f.nome}</h4>
                    <button onclick="event.stopPropagation(); toggleFavMapa(${f.id}, '${f.nome}', '${f.local}')"
                        style="margin-left:auto;background:none;border:none;cursor:pointer;font-size:14px;">❤️</button>
                </div>
                <div class="cidade">${f.local}</div>
            </div>
        `;
    }).join('');
}

// ── Status ──
function mostrarStatus(msg, tipo) {
    const el = document.getElementById('mapaStatus');
    el.textContent = msg;
    el.className = `mapa-status ${tipo}`;
    el.style.display = 'block';
    if (tipo === 'ok') setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// Fechar sugestões ao clicar fora
document.addEventListener('click', e => {
    if (!e.target.closest('.pesquisa-box')) {
        document.getElementById('sugestoes').style.display = 'none';
    }
});