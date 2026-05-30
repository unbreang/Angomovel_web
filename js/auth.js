/* ============================================================
   AUTH.JS — Sistema de autenticação global AngoMovel
   Usado em todas as páginas para gerir sessão do utilizador
   ============================================================ */

const API = 'http://localhost:3000/api/v1';

// ── Verificar se está logado ──
function estaLogado() {
    return !!localStorage.getItem('angomovel_token');
}

// ── Obter utilizador actual ──
function obterUtilizador() {
    const user = localStorage.getItem('angomovel_user');
    return user ? JSON.parse(user) : null;
}

// ── Obter token ──
function obterToken() {
    return localStorage.getItem('angomovel_token');
}

// ── Sair ──
function sair() {
    localStorage.removeItem('angomovel_token');
    localStorage.removeItem('angomovel_user');
    localStorage.removeItem('angomovel_foto');
    window.location.href = '/angomovel.html';
}

// ── Fetch autenticado ──
async function fetchAuth(url, opcoes = {}) {
    const token = obterToken();
    return fetch(url, {
        ...opcoes,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...opcoes.headers,
        }
    });
}

// ════════════════════════════════════════════════
// HEADER DINÂMICO
// Chama esta função em todas as páginas
// ════════════════════════════════════════════════
function iniciarHeader() {
    const btnEntrar = document.querySelector('.btn-entrar');
    const aEntrar   = document.querySelector('a[href*="cadastroAngo"]');

    if (!btnEntrar && !aEntrar) return;

    if (estaLogado()) {
        const user = obterUtilizador();
        const foto = localStorage.getItem('angomovel_foto');

        // Esconder botão Entrar
        if (aEntrar) aEntrar.style.display = 'none';
        if (btnEntrar) btnEntrar.style.display = 'none';

        // Criar menu do utilizador
        const menuUser = document.createElement('div');
        menuUser.className = 'user-menu-header';
        menuUser.innerHTML = `
            <div class="user-avatar-btn" onclick="toggleMenuUser()">
                ${foto
                    ? `<img src="${foto}" alt="${user.nome}" class="user-avatar-img">`
                    : `<div class="user-avatar-inicial">${(user.nome || 'U')[0].toUpperCase()}</div>`
                }
                <span class="user-nome-header">${(user.nome || '').split(' ')[0]}</span>
                <i class="ph ph-caret-down" id="caretIcon"></i>
            </div>

            <div class="user-dropdown" id="userDropdown">
                <div class="user-dropdown-header">
                    ${foto
                        ? `<img src="${foto}" alt="${user.nome}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;">`
                        : `<div style="width:48px;height:48px;border-radius:50%;background:var(--vermelho-vivo,#E8192C);display:flex;align-items:center;justify-content:center;font-family:serif;font-size:22px;font-weight:900;color:#fff;">${(user.nome || 'U')[0].toUpperCase()}</div>`
                    }
                    <div>
                        <strong>${user.nome || 'Utilizador'}</strong>
                        <span>${user.email || ''}</span>
                    </div>
                </div>
                <div class="user-dropdown-items">
                    <a href="/perfil.html" class="dropdown-item">
                        <i class="ph ph-user-circle"></i> O meu perfil
                    </a>
                    <a href="/perfil.html#favoritos" class="dropdown-item">
                        <i class="ph ph-heart"></i> Favoritos
                    </a>
                    <a href="/abas/destino.html" class="dropdown-item">
                        <i class="ph ph-map-pin"></i> Destinos
                    </a>
                    <div class="dropdown-sep"></div>
                    <button class="dropdown-item dropdown-sair" onclick="sair()">
                        <i class="ph ph-sign-out"></i> Terminar sessão
                    </button>
                </div>
            </div>
        `;

        // Inserir no header
        const headerInner = document.querySelector('.header-inner') || document.querySelector('.header');
        if (headerInner) headerInner.appendChild(menuUser);

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!menuUser.contains(e.target)) {
                document.getElementById('userDropdown')?.classList.remove('aberto');
                document.getElementById('caretIcon')?.classList.remove('rotacionado');
            }
        });

    }
}

function toggleMenuUser() {
    const dropdown = document.getElementById('userDropdown');
    const caret    = document.getElementById('caretIcon');
    dropdown?.classList.toggle('aberto');
    caret?.classList.toggle('rotacionado');
}

// ════════════════════════════════════════════════
// FAVORITOS
// ════════════════════════════════════════════════
function obterFavoritos() {
    return JSON.parse(localStorage.getItem('angomovel_favoritos') || '[]');
}

function toggleFavorito(destino) {
    const favs = obterFavoritos();
    const idx  = favs.findIndex(f => f.id === destino.id || f.nome === destino.nome);

    if (idx >= 0) {
        favs.splice(idx, 1);
        mostrarToastGlobal(`❌ ${destino.nome} removido dos favoritos`);
    } else {
        favs.push({ ...destino, guardado_em: new Date().toISOString() });
        mostrarToastGlobal(`❤️ ${destino.nome} adicionado aos favoritos!`);
    }

    localStorage.setItem('angomovel_favoritos', JSON.stringify(favs));
    return idx < 0; // true = adicionado, false = removido
}

function eFavorito(nome) {
    return obterFavoritos().some(f => f.nome === nome);
}

// ── Toast global ──
function mostrarToastGlobal(msg) {
    const existing = document.querySelector('.toast-fav');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-fav';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
}

// ════════════════════════════════════════════════
// CSS DO HEADER DINÂMICO — injectado automaticamente
// ════════════════════════════════════════════════
const styleAuth = document.createElement('style');
styleAuth.textContent = `
    .user-menu-header {
        position: relative;
    }

    .user-avatar-btn {
        display: flex; align-items: center; gap: 8px;
        cursor: pointer;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        transition: 0.25s;
        color: #fff;
        font-size: 13px; font-weight: 600;
    }

    .user-avatar-btn:hover {
        background: rgba(255,255,255,0.14);
    }

    .user-avatar-img {
        width: 30px; height: 30px;
        border-radius: 50%; object-fit: cover;
        border: 2px solid #F0B429;
    }

    .user-avatar-inicial {
        width: 30px; height: 30px;
        border-radius: 50%;
        background: linear-gradient(135deg, #E8192C, #A00000);
        display: flex; align-items: center; justify-content: center;
        font-family: 'Playfair Display', serif;
        font-size: 14px; font-weight: 900; color: #fff;
        border: 2px solid #F0B429;
    }

    .user-nome-header {
        max-width: 100px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }

    #caretIcon { font-size: 14px; transition: 0.25s; }
    #caretIcon.rotacionado { transform: rotate(180deg); }

    .user-dropdown {
        position: absolute; top: calc(100% + 10px); right: 0;
        background: #161616;
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 16px;
        min-width: 240px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        opacity: 0; pointer-events: none;
        transform: translateY(-8px);
        transition: 0.25s cubic-bezier(0.4,0,0.2,1);
        overflow: hidden; z-index: 999;
    }

    .user-dropdown.aberto {
        opacity: 1; pointer-events: all;
        transform: translateY(0);
    }

    .user-dropdown-header {
        padding: 16px 18px;
        display: flex; align-items: center; gap: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        background: rgba(255,255,255,0.03);
    }

    .user-dropdown-header strong {
        display: block; font-size: 14px; font-weight: 700; color: #fff;
    }

    .user-dropdown-header span {
        font-size: 12px; color: rgba(255,255,255,0.45);
    }

    .user-dropdown-items { padding: 8px; }

    .dropdown-item {
        display: flex; align-items: center; gap: 10px;
        padding: 10px 12px; border-radius: 10px;
        font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.7);
        text-decoration: none; transition: 0.2s;
        width: 100%; background: none; border: none;
        cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
        text-align: left;
    }

    .dropdown-item i { font-size: 17px; }
    .dropdown-item:hover { background: rgba(255,255,255,0.06); color: #fff; }

    .dropdown-sair { color: #E8192C !important; }
    .dropdown-sair:hover { background: rgba(232,25,44,0.1) !important; }

    .dropdown-sep {
        height: 1px; background: rgba(255,255,255,0.07);
        margin: 6px 0;
    }
`;
document.head.appendChild(styleAuth);

// ── Iniciar automaticamente quando DOM estiver pronto ──
document.addEventListener('DOMContentLoaded', iniciarHeader);