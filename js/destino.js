// ============================================================
// DESTINO.JS — Mapa Dinâmico AngoMovel
// Leaflet + OpenStreetMap + Nominatim + OSRM
// ============================================================

const destinosAngola = [
    { id: 1,  nome: 'Ilha do Mussulo',                lat: -9.0,    lng: 13.1667, cidade: 'Luanda',      desc: 'Península paradisíaca com praias deslumbrantes e águas cristalinas.', emoji: '🏖️' },
    { id: 2,  nome: 'Quedas de Calandula',            lat: -9.0856, lng: 15.9533, cidade: 'Malanje',     desc: 'Uma das maiores cataratas de África com 105m de altura.', emoji: '💧' },
    { id: 3,  nome: 'Parque Nacional da Iona',        lat: -16.633, lng: 12.383,  cidade: 'Namibe',      desc: 'Maior parque nacional de Angola com paisagens desérticas únicas.', emoji: '🦁' },
    { id: 4,  nome: 'Fenda da Tundavala',             lat: -14.916, lng: 13.5,    cidade: 'Huíla',       desc: 'Vista deslumbrante da Serra da Leba a 2.300m de altitude.', emoji: '🏔️' },
    { id: 5,  nome: 'Pedras Negras de Pungo Andongo', lat: -9.683,  lng: 15.716,  cidade: 'Malanje',     desc: 'Maravilha geológica com rochas de granito gigantes.', emoji: '🗿' },
    { id: 6,  nome: 'Lagoa Carumbo',                  lat: -8.333,  lng: 19.666,  cidade: 'Lunda Norte', desc: 'Lagoa paradisíaca no coração do Leste angolano.', emoji: '💎' },
    { id: 7,  nome: 'Luanda',                         lat: -8.836,  lng: 13.234,  cidade: 'Luanda',      desc: 'Capital vibrante com baía, fortaleza e cultura única.', emoji: '🏙️' },
    { id: 8,  nome: 'Benguela',                       lat: -12.576, lng: 13.405,  cidade: 'Benguela',    desc: 'Cidade histórica do litoral com belas praias.', emoji: '🌊' },
    { id: 9,  nome: 'Namibe',                         lat: -15.196, lng: 12.152,  cidade: 'Namibe',      desc: 'Portal do deserto com paisagens lunares únicas.', emoji: '🏜️' },
    { id: 10, nome: 'Malanje',                        lat: -9.540,  lng: 16.341,  cidade: 'Malanje',     desc: 'Cidade histórica próxima das Pedras Negras.', emoji: '🪨' },
    { id: 11, nome: 'Huambo',                         lat: -12.775, lng: 15.736,  cidade: 'Huambo',      desc: 'Cidade do planalto central com clima fresco.', emoji: '🚂' },
    { id: 12, nome: 'Cabinda',                        lat: -5.547,  lng: 12.188,  cidade: 'Cabinda',     desc: 'Enclave com floresta tropical rica em biodiversidade.', emoji: '🌴' },
    { id: 13, nome: 'Morro do Môco',                  lat: -11.366, lng: 14.866,  cidade: 'Huambo',      desc: 'Ponto mais alto de Angola com 2.620 metros.', emoji: '⛰️' },
    { id: 14, nome: 'Floresta do Mayombe',            lat: -4.9,    lng: 12.5,    cidade: 'Cabinda',     desc: 'Floresta tropical densa com fauna e flora ricas.', emoji: '🌿' },
    { id: 15, nome: 'Mbanza Kongo',                   lat: -6.266,  lng: 14.25,   cidade: 'Zaire',       desc: 'Antiga capital do Reino do Kongo, Património UNESCO.', emoji: '🏛️' },
];

// ── Estado global ──
let mapa           = null;
let routingControl = null;
let marcadorUser   = null;
let tipoTransporte = 'car';
let timeoutPesq    = null;
let marcadores     = [];
let estrelaSel     = 0;

// ══════════════════════════════════════════
// INICIALIZAÇÃO
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    inicializarMapa();
    carregarDestinos();
    carregarDestaques();
    carregarFavoritos();
    preencherDatalist();
    configurarPesquisa();
});

function inicializarMapa() {
    mapa = L.map('mapa', {
        center: [-11.2027, 17.8739],
        zoom: 6,
        zoomControl: false,
    });

      const iconeUser = L.divIcon({
    html: '<div style="width:22px;height:22px;background:#4CAF50;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
    iconSize: [22, 22], iconAnchor: [11, 11],
    className: '',
});

    L.control.zoom({ position: 'bottomright' }).addTo(mapa);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    }).addTo(mapa);

    destinosAngola.forEach(d => adicionarMarcador(d));
}

// ══════════════════════════════════════════
// ÍCONES
// ══════════════════════════════════════════
function criarIcone(cor) {
    cor = cor || '#E8192C';
    return L.divIcon({
        html: '<div style="width:26px;height:26px;background:' + cor + ';border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>',
        iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -28],
        className: '',
    });
}



// ══════════════════════════════════════════
// MARCADORES
// ══════════════════════════════════════════
function adicionarMarcador(d) {
    const m = L.marker([d.lat, d.lng], { icon: criarIcone() })
        .addTo(mapa)
        .bindPopup(criarPopup(d), { maxWidth: 240 });

    m.on('click', function() { destacarItem(d.id); });
    marcadores.push({ id: d.id, marcador: m });
}

function criarPopup(d) {
    const favs  = obterFavoritos();
    const isFav = favs.some(function(f) { return f.id === d.id; });
    return '<div style="font-family:sans-serif;min-width:200px;">'
        + '<div style="font-size:22px;margin-bottom:4px;">' + d.emoji + '</div>'
        + '<strong style="font-size:14px;color:#E8192C;">' + d.nome + '</strong><br>'
        + '<span style="font-size:11px;color:#888;">📍 ' + d.cidade + '</span>'
        + '<p style="font-size:12px;color:#555;margin:6px 0;line-height:1.5;">' + d.desc + '</p>'
        + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">'
        + '<button onclick="usarComoDestino(\'' + d.nome + '\')" style="flex:1;background:#E8192C;color:#fff;border:none;padding:7px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;">🧭 Ir para aqui</button>'
        + '<button onclick="abrirAvaliacoes(' + d.id + ', \'' + d.nome.replace(/'/g, "\\'") + '\')" style="flex:1;background:#F0B429;color:#0A0A0A;border:none;padding:7px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;">⭐ Avaliar</button>'
        + '<button onclick="toggleFavMapa(' + d.id + ', \'' + d.nome.replace(/'/g, "\\'") + '\', \'' + d.cidade + '\')" id="favBtn' + d.id + '" style="background:' + (isFav ? '#E8192C' : '#f5f5f5') + ';color:' + (isFav ? '#fff' : '#333') + ';border:none;padding:7px 10px;border-radius:6px;cursor:pointer;font-size:14px;">' + (isFav ? '❤️' : '🤍') + '</button>'
        + '</div></div>';
}

// ══════════════════════════════════════════
// LISTA DE DESTINOS NA SIDEBAR
// ══════════════════════════════════════════
function carregarDestinos() {
    const lista = document.getElementById('destinosLista');
    if (!lista) return;

    lista.innerHTML = destinosAngola.map(function(d) {
        const isFav = obterFavoritos().some(function(f) { return f.id === d.id; });
        return '<div class="destino-item" id="item-' + d.id + '" onclick="focarDestino(' + d.id + ')">'
            + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">'
            + '<span style="font-size:18px;">' + d.emoji + '</span>'
            + '<h4>' + d.nome + '</h4>'
            + '</div>'
            + '<div class="cidade">' + d.cidade + '</div>'
            + '<div class="descricao">' + d.desc + '</div>'
            + '<div style="display:flex;gap:6px;margin-top:8px;">'
            + '<button onclick="event.stopPropagation();usarComoDestino(\'' + d.nome + '\')" style="flex:1;padding:6px;background:#E8192C;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;">🧭 Usar como destino</button>'
            + '<button onclick="event.stopPropagation();toggleFavMapa(' + d.id + ',\'' + d.nome.replace(/'/g, "\\'") + '\',\'' + d.cidade + '\')" id="favSide' + d.id + '" style="padding:6px 10px;background:#f5f5f5;border:none;border-radius:6px;cursor:pointer;font-size:13px;">' + (isFav ? '❤️' : '🤍') + '</button>'
            + '</div></div>';
    }).join('');
}

function focarDestino(id) {
    const d = destinosAngola.find(function(d) { return d.id === id; });
    if (!d) return;

    mapa.setView([d.lat, d.lng], 12, { animate: true });

    const m = marcadores.find(function(m) { return m.id === id; });
    if (m) m.marcador.openPopup();

    document.querySelectorAll('.destino-item').forEach(function(el) { el.classList.remove('ativo'); });
    var item = document.getElementById('item-' + id);
    if (item) { item.classList.add('ativo'); item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}

function destacarItem(id) {
    document.querySelectorAll('.destino-item').forEach(function(el) { el.classList.remove('ativo'); });
    var item = document.getElementById('item-' + id);
    if (item) { item.classList.add('ativo'); item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}

// ══════════════════════════════════════════
// DESTAQUES
// ══════════════════════════════════════════
function carregarDestaques() {
    var el = document.getElementById('destaquesList');
    if (!el) return;
    el.innerHTML = destinosAngola.slice(0, 5).map(function(d) {
        return '<div class="destaque-item" onclick="focarDestino(' + d.id + ')">' + d.emoji + ' ' + d.nome + '</div>';
    }).join('');
}

// ══════════════════════════════════════════
// DATALIST PARA ROTAS
// ══════════════════════════════════════════
function preencherDatalist() {
    var nomes = destinosAngola.map(function(d) { return '<option value="' + d.nome + '">'; }).join('');
    var o = document.getElementById('origemSugestoes');
    var dest = document.getElementById('destinoSugestoes');
    if (o) o.innerHTML = nomes;
    if (dest) dest.innerHTML = nomes;
}

// ══════════════════════════════════════════
// PESQUISA
// ══════════════════════════════════════════
function configurarPesquisa() {
    var input = document.getElementById('inputPesquisa');
    if (!input) return;
    input.addEventListener('input', pesquisar);
}

function pesquisar() {
    var input = document.getElementById('inputPesquisa');
    var sugestoesEl = document.getElementById('sugestoes');
    var btnLimpar = document.getElementById('btnLimparPesq');
    if (!input || !sugestoesEl) return;

    var texto = input.value.trim();
    if (btnLimpar) btnLimpar.style.display = texto ? 'flex' : 'none';

    clearTimeout(timeoutPesq);

    if (texto.length < 2) {
        sugestoesEl.style.display = 'none';
        return;
    }

    // Filtrar localmente primeiro
    var local = destinosAngola.filter(function(d) {
        return d.nome.toLowerCase().indexOf(texto.toLowerCase()) >= 0 ||
               d.cidade.toLowerCase().indexOf(texto.toLowerCase()) >= 0;
    });

    if (local.length > 0) {
        sugestoesEl.style.display = 'block';
        sugestoesEl.innerHTML = local.map(function(d) {
            return '<div class="sugestao-item" onclick="focarDestino(' + d.id + ');document.getElementById(\'sugestoes\').style.display=\'none\'">'
                + d.emoji + ' <strong>' + d.nome + '</strong> — ' + d.cidade + '</div>';
        }).join('');
        return;
    }

    // Pesquisa online Nominatim
    if (texto.length >= 3) {
        timeoutPesq = setTimeout(function() {
            fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(texto + ' Angola') + '&format=json&limit=5&accept-language=pt')
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    if (!data.length) { sugestoesEl.style.display = 'none'; return; }
                    sugestoesEl.style.display = 'block';
                    sugestoesEl.innerHTML = data.map(function(item) {
                        return '<div class="sugestao-item" onclick="irParaCoordenadas(' + item.lat + ',' + item.lon + ',\'' + item.display_name.split(',')[0].replace(/'/g, "\\'") + '\')">'
                            + '📍 ' + item.display_name.split(',').slice(0,2).join(',') + '</div>';
                    }).join('');
                })
                .catch(function() { sugestoesEl.style.display = 'none'; });
        }, 500);
    }
}

function irParaCoordenadas(lat, lng, nome) {
    mapa.setView([lat, lng], 13, { animate: true });
    document.getElementById('sugestoes').style.display = 'none';
    document.getElementById('inputPesquisa').value = nome;
    L.marker([lat, lng], { icon: criarIcone('#D4A017') })
        .addTo(mapa).bindPopup('<strong>' + nome + '</strong>').openPopup();
}

function limparPesquisa() {
    var input = document.getElementById('inputPesquisa');
    var sugestoes = document.getElementById('sugestoes');
    var btn = document.getElementById('btnLimparPesq');
    if (input) input.value = '';
    if (sugestoes) sugestoes.style.display = 'none';
    if (btn) btn.style.display = 'none';
}

// ══════════════════════════════════════════
// ROTAS
// ══════════════════════════════════════════
function usarComoDestino(nome) {
    // Tenta origemInput, senão destino (antigo)
    var origemEl  = document.getElementById('origemInput')  || document.getElementById('origem');
    var destinoEl = document.getElementById('destinoInput') || document.getElementById('destino');

    if (!origemEl || !origemEl.value) {
        if (origemEl) origemEl.value = nome;
    } else {
        if (destinoEl) destinoEl.value = nome;
    }
    mostrarStatus('📍 ' + nome + ' adicionado à rota', 'ok');
}

function selTransporte(tipo, btn) {
    tipoTransporte = tipo;
    document.querySelectorAll('.transporte-btn').forEach(function(b) { b.classList.remove('ativo'); });
    btn.classList.add('ativo');
}

async function calcularRota() {
    // Suporta IDs antigos e novos
    var origemEl  = document.getElementById('origemInput')  || document.getElementById('origem');
    var destinoEl = document.getElementById('destinoInput') || document.getElementById('destino');

    if (!origemEl || !destinoEl) {
        mostrarStatus('⚠️ Elementos de rota não encontrados', 'erro');
        return;
    }

    var origemTexto  = origemEl.value.trim  ? origemEl.value.trim()   : (origemEl.options[origemEl.selectedIndex]?.text || '');
    var destinoTexto = destinoEl.value.trim ? destinoEl.value.trim()  : (destinoEl.options[destinoEl.selectedIndex]?.text || '');

    if (!origemTexto || !destinoTexto) {
        mostrarStatus('⚠️ Preenche a origem e o destino!', 'erro');
        return;
    }

    mostrarStatus('🔄 A calcular rota...', '');

    try {
        var respostas = await Promise.all([
            fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(origemTexto + ' Angola') + '&format=json&limit=1'),
            fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(destinoTexto + ' Angola') + '&format=json&limit=1'),
        ]);

        var dados = await Promise.all(respostas.map(function(r) { return r.json(); }));
        var dataO = dados[0], dataD = dados[1];

        if (!dataO.length) { mostrarStatus('❌ "' + origemTexto + '" não encontrado', 'erro'); return; }
        if (!dataD.length) { mostrarStatus('❌ "' + destinoTexto + '" não encontrado', 'erro'); return; }

        var ptO = L.latLng(parseFloat(dataO[0].lat), parseFloat(dataO[0].lon));
        var ptD = L.latLng(parseFloat(dataD[0].lat), parseFloat(dataD[0].lon));

        if (routingControl) mapa.removeControl(routingControl);

        routingControl = L.Routing.control({
            waypoints: [ptO, ptD],
            routeWhileDragging: false,
            showAlternatives: false,
            router: new L.Routing.OSRMv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: tipoTransporte === 'bike' ? 'bike' : tipoTransporte === 'foot' ? 'foot' : 'driving',
            }),
            lineOptions: {
                styles: [{ color: '#E8192C', weight: 5, opacity: 0.85 }],
            },
            createMarker: function(i, wp) {
                return L.marker(wp.latLng, {
                    icon: L.divIcon({
                        html: '<div style="width:30px;height:30px;background:' + (i === 0 ? '#4CAF50' : '#E8192C') + ';border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">' + (i === 0 ? 'A' : 'B') + '</div>',
                        iconSize: [30,30], iconAnchor: [15,15], className: '',
                    })
                });
            },
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            collapsible: true,
        }).addTo(mapa);

        routingControl.on('routesfound', function(e) {
            var rota  = e.routes[0].summary;
            var dist  = (rota.totalDistance / 1000).toFixed(1);
            var mins  = Math.round(rota.totalTime / 60);
            var horas = Math.floor(mins / 60);
            var minR  = mins % 60;
            var tempo = horas > 0 ? horas + 'h ' + minR + 'min' : minR + ' min';

            var rotaInfo = document.getElementById('rotaInfo');
            if (rotaInfo) rotaInfo.classList.add('mostrar');

            var elO = document.getElementById('rotaOrigem');
            var elD = document.getElementById('rotaDestino');
            var elDist = document.getElementById('rotaDistancia');
            var elT = document.getElementById('rotaTempo');
            if (elO) elO.textContent = origemTexto;
            if (elD) elD.textContent = destinoTexto;
            if (elDist) elDist.textContent = dist + ' km';
            if (elT) elT.textContent = tempo;

            mostrarStatus('✅ Rota: ' + dist + ' km • ' + tempo, 'ok');
        });

        routingControl.on('routingerror', function() {
            mostrarStatus('❌ Não foi possível calcular a rota', 'erro');
        });

    } catch(e) {
        mostrarStatus('❌ Erro: ' + e.message, 'erro');
    }
}

function limparRota() {
    if (routingControl) { mapa.removeControl(routingControl); routingControl = null; }
    var rotaInfo = document.getElementById('rotaInfo');
    if (rotaInfo) rotaInfo.classList.remove('mostrar');
    var origemEl  = document.getElementById('origemInput')  || document.getElementById('origem');
    var destinoEl = document.getElementById('destinoInput') || document.getElementById('destino');
    if (origemEl && origemEl.tagName === 'INPUT')  origemEl.value = '';
    if (destinoEl && destinoEl.tagName === 'INPUT') destinoEl.value = '';
    mostrarStatus('🗑️ Rota removida', '');
}

function minhaLocalizacao() {
    if (!navigator.geolocation) {
        mostrarStatus('❌ O teu browser não suporta geolocalização', 'erro');
        return;
    }
    mostrarStatus('📡 A obter localização...', '');
    navigator.geolocation.getCurrentPosition(function(pos) {
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        if (marcadorUser) mapa.removeLayer(marcadorUser);
        marcadorUser = L.marker([lat, lng], { icon: iconeUser })
            .addTo(mapa).bindPopup('<strong>📍 A tua localização</strong>').openPopup();
        mapa.setView([lat, lng], 12, { animate: true });
        var origemEl = document.getElementById('origemInput') || document.getElementById('origem');
        if (origemEl && origemEl.tagName === 'INPUT') origemEl.value = 'A minha localização';
        mostrarStatus('✅ Localização obtida!', 'ok');
    }, function() {
        mostrarStatus('❌ Não foi possível obter a localização', 'erro');
    });
}

// ══════════════════════════════════════════
// FAVORITOS
// ══════════════════════════════════════════
function obterFavoritos() {
    try { return JSON.parse(localStorage.getItem('angomovel_favoritos') || '[]'); }
    catch(e) { return []; }
}

function toggleFavMapa(id, nome, cidade) {
    var token = localStorage.getItem('angomovel_token');
    if (!token) {
        mostrarStatus('👤 Faz login para guardar favoritos!', 'erro');
        return;
    }
    var favs = obterFavoritos();
    var idx  = favs.findIndex(function(f) { return f.id === id; });
    var adicionado = idx < 0;

    if (adicionado) {
        favs.push({ id: id, nome: nome, local: cidade,
            imagem: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
            data: new Date().toISOString() });
        mostrarStatus('❤️ ' + nome + ' adicionado aos favoritos!', 'ok');
    } else {
        favs.splice(idx, 1);
        mostrarStatus('💔 ' + nome + ' removido dos favoritos', '');
    }

    localStorage.setItem('angomovel_favoritos', JSON.stringify(favs));

    var btnMapa = document.getElementById('favBtn' + id);
    var btnSide = document.getElementById('favSide' + id);
    if (btnMapa) { btnMapa.textContent = adicionado ? '❤️' : '🤍'; btnMapa.style.background = adicionado ? '#E8192C' : '#f5f5f5'; btnMapa.style.color = adicionado ? '#fff' : '#333'; }
    if (btnSide) btnSide.textContent = adicionado ? '❤️' : '🤍';

    carregarFavoritos();
}

function carregarFavoritos() {
    var favs  = obterFavoritos();
    var secao = document.getElementById('secaoFavoritos');
    var lista = document.getElementById('listaFavoritos');
    if (!secao || !lista) return;

    if (!favs.length) { secao.style.display = 'none'; return; }
    secao.style.display = 'block';

    lista.innerHTML = favs.map(function(f) {
        var d = destinosAngola.find(function(d) { return d.id === f.id; });
        return '<div class="destino-item" onclick="' + (d ? 'focarDestino(' + d.id + ')' : '') + '">'
            + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">'
            + '<span style="font-size:18px;">' + (d ? d.emoji : '📍') + '</span>'
            + '<h4>' + f.nome + '</h4>'
            + '<button onclick="event.stopPropagation();toggleFavMapa(' + f.id + ',\'' + f.nome.replace(/'/g,"\\'") + '\',\'' + (f.local||'') + '\')" style="margin-left:auto;background:none;border:none;cursor:pointer;font-size:14px;">❤️</button>'
            + '</div>'
            + '<div class="cidade">' + (f.local || '') + '</div>'
            + '</div>';
    }).join('');
}

// ══════════════════════════════════════════
// STATUS
// ══════════════════════════════════════════
function mostrarStatus(msg, tipo) {
    var el = document.getElementById('mapaStatus');
    if (!el) return;
    el.textContent = msg;
    el.className = 'mapa-status ' + (tipo || '');
    el.style.display = 'block';
    if (tipo === 'ok') setTimeout(function() { el.style.display = 'none'; }, 3000);
}

// Fechar sugestões ao clicar fora
document.addEventListener('click', function(e) {
    var sugestoes = document.getElementById('sugestoes');
    if (sugestoes && !e.target.closest('.pesquisa-box')) {
        sugestoes.style.display = 'none';
    }
});

// ══════════════════════════════════════════
// AVALIAÇÕES
// ══════════════════════════════════════════
async function abrirAvaliacoes(destinoId, destinoNome) {
    var token = localStorage.getItem('angomovel_token');
    var avaliacoes = [], media = 0, total = 0;

    try {
        var res  = await fetch('http://localhost:3000/api/v1/avaliacoes/destino/' + destinoId);
        var data = await res.json();
        avaliacoes = data.avaliacoes || [];
        media      = data.media      || 0;
        total      = data.total      || 0;
    } catch(e) {}

    document.getElementById('modalAvaliacoes') && document.getElementById('modalAvaliacoes').remove();
    estrelaSel = 0;

    var modal = document.createElement('div');
    modal.id = 'modalAvaliacoes';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';

    var estrelasFix = renderEstrelasFixas(media);
    var formHtml = token
        ? '<div style="background:#F5F0E8;border-radius:16px;padding:20px;margin-bottom:24px;">'
            + '<h3 style="font-family:\'Playfair Display\',serif;font-size:15px;font-weight:800;color:#111;margin-bottom:12px;">✏️ A tua avaliação</h3>'
            + '<div style="display:flex;gap:4px;margin-bottom:12px;">'
            + [1,2,3,4,5].map(function(n) { return '<span onclick="selEstrela(' + n + ')" id="estrela' + n + '" style="font-size:32px;cursor:pointer;color:#ddd;transition:0.15s;">★</span>'; }).join('')
            + '</div>'
            + '<textarea id="comentarioInput" placeholder="Partilha a tua experiência..." style="width:100%;padding:12px;border:1.5px solid rgba(0,0,0,0.1);border-radius:10px;font-family:\'Plus Jakarta Sans\',sans-serif;font-size:13px;resize:none;height:80px;outline:none;margin-bottom:12px;background:#fff;"></textarea>'
            + '<button onclick="enviarAvaliacao(' + destinoId + ',\'' + destinoNome.replace(/'/g,"\\'") + '\')" style="padding:11px 24px;background:#E8192C;color:#fff;border:none;border-radius:999px;font-weight:800;font-size:13px;cursor:pointer;">⭐ Publicar Avaliação</button>'
            + '</div>'
        : '<div style="background:#F5F0E8;border-radius:16px;padding:16px;margin-bottom:24px;text-align:center;">'
            + '<p style="font-size:13px;color:#6b6560;margin-bottom:10px;">Faz login para avaliar este destino</p>'
            + '<a href="../abas/cadastroAngo.html" style="padding:10px 20px;background:#E8192C;color:#fff;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;">Fazer Login</a>'
            + '</div>';

    var avaliacoesHtml = avaliacoes.length
        ? avaliacoes.map(function(a) {
            return '<div style="background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:14px;padding:16px;margin-bottom:10px;">'
                + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
                + '<div style="display:flex;align-items:center;gap:10px;">'
                + '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#CC0000,#E8192C);display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:14px;">' + a.utilizador_nome[0].toUpperCase() + '</div>'
                + '<div><div style="font-size:13px;font-weight:700;color:#111;">' + a.utilizador_nome + '</div>'
                + '<div style="font-size:10px;color:#888;">' + new Date(a.criado_em).toLocaleDateString('pt-AO') + '</div></div>'
                + '</div><span style="font-size:14px;">' + renderEstrelasFixas(a.nota) + '</span></div>'
                + (a.comentario ? '<p style="font-size:13px;color:#555;line-height:1.6;margin-bottom:8px;">' + a.comentario + '</p>' : '')
                + '<button onclick="marcarUtil(\'' + a.id + '\',this)" style="background:none;border:1px solid rgba(0,0,0,0.1);border-radius:999px;padding:4px 12px;font-size:11px;color:#6b6560;cursor:pointer;">👍 Útil (' + (a.util||0) + ')</button>'
                + '</div>';
        }).join('')
        : '<div style="text-align:center;padding:32px;color:#9a9590;"><div style="font-size:40px;margin-bottom:10px;">💬</div><p>Ainda sem avaliações. Sê o primeiro!</p></div>';

    modal.innerHTML = '<div style="background:#fff;border-radius:24px;width:100%;max-width:560px;max-height:85vh;overflow-y:auto;box-shadow:0 40px 80px rgba(0,0,0,0.3);">'
        + '<div style="background:linear-gradient(135deg,#0A0A0A,#1a0a0a);padding:24px 28px;border-radius:24px 24px 0 0;position:relative;">'
        + '<button onclick="fecharModalAval()" style="position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:16px;cursor:pointer;">✕</button>'
        + '<h2 style="font-family:\'Playfair Display\',serif;font-size:20px;font-weight:900;color:#fff;margin-bottom:8px;">' + destinoNome + '</h2>'
        + '<div style="display:flex;align-items:center;gap:10px;">'
        + '<span style="font-size:18px;">' + estrelasFix + '</span>'
        + '<span style="font-size:20px;font-weight:900;color:#F0B429;font-family:\'Playfair Display\',serif;">' + (media || '—') + '</span>'
        + '<span style="font-size:12px;color:rgba(255,255,255,0.5);">(' + total + ' avaliação' + (total !== 1 ? 'ões' : '') + ')</span>'
        + '</div></div>'
        + '<div style="padding:24px 28px;">'
        + formHtml
        + '<h3 style="font-family:\'Playfair Display\',serif;font-size:15px;font-weight:800;color:#111;margin-bottom:14px;">💬 Comentários (' + total + ')</h3>'
        + avaliacoesHtml
        + '</div></div>';

    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) fecharModalAval(); });
}

function fecharModalAval() {
    var m = document.getElementById('modalAvaliacoes');
    if (m) m.remove();
    estrelaSel = 0;
}

function renderEstrelasFixas(nota) {
    return [1,2,3,4,5].map(function(n) {
        return '<span style="color:' + (n <= nota ? '#F0B429' : '#ddd') + ';">★</span>';
    }).join('');
}

function selEstrela(n) {
    estrelaSel = n;
    for (var i = 1; i <= 5; i++) {
        var el = document.getElementById('estrela' + i);
        if (el) el.style.color = i <= n ? '#F0B429' : '#ddd';
    }
}

async function enviarAvaliacao(destinoId, destinoNome) {
    var token      = localStorage.getItem('angomovel_token');
    var comentario = document.getElementById('comentarioInput');
    var texto      = comentario ? comentario.value.trim() : '';

    if (!estrelaSel) { alert('⚠️ Selecciona uma nota de 1 a 5 estrelas!'); return; }
    if (!token)      { alert('⚠️ Precisas de fazer login!'); return; }

    try {
        var res = await fetch('http://localhost:3000/api/v1/avaliacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ destino_id: String(destinoId), destino_nome: destinoNome, nota: estrelaSel, comentario: texto }),
        });

        if (res.ok) {
            fecharModalAval();
            mostrarStatus('⭐ Avaliação publicada!', 'ok');
            setTimeout(function() { abrirAvaliacoes(destinoId, destinoNome); }, 400);
        } else {
            var err = await res.json();
            alert('❌ ' + (err.message || 'Erro ao publicar'));
        }
    } catch(e) {
        alert('❌ Erro de ligação ao servidor');
    }
}

async function marcarUtil(id, btn) {
    try {
        await fetch('http://localhost:3000/api/v1/avaliacoes/' + id + '/util', { method: 'PATCH' });
        if (btn) {
            var num = parseInt(btn.textContent.match(/\d+/) || [0]) + 1;
            btn.textContent = '👍 Útil (' + num + ')';
        }
    } catch(e) {}
}