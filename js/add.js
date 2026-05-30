// ============================================================
// ADD.JS — Sessão do utilizador + Favoritos
// AngoMovel
// ============================================================

const API = 'http://localhost:3000/api/v1';

// ══════════════════════════════════════════
// VERIFICAR SESSÃO
// ══════════════════════════════════════════
function verificarSessao() {
    const token = localStorage.getItem('angomovel_token');
    const user  = JSON.parse(localStorage.getItem('angomovel_user') || 'null');
    const btnEntrarWrapper = document.querySelector('.btn-entrar')?.parentElement;
    const headerInner      = document.querySelector('.header-inner');

    if (!token || !user) return;

    // Esconde botão Entrar
    if (btnEntrarWrapper) btnEntrarWrapper.style.display = 'none';

    // Cria menu do perfil
    const perfilMenu = document.createElement('div');
    perfilMenu.className = 'perfil-menu';
    perfilMenu.innerHTML = `
        <div class="perfil-trigger" onclick="toggleMenuPerfil()">
            <div class="perfil-avatar">
                ${user.foto
                    ? `<img src="${user.foto}" alt="${user.nome}">`
                    : `<span>${(user.nome || 'U')[0].toUpperCase()}</span>`
                }
            </div>
            <span class="perfil-nome">${user.nome?.split(' ')[0] || 'Perfil'}</span>
            <i class="ph ph-caret-down" id="caretIcon"></i>
        </div>
        <div class="perfil-dropdown" id="perfilDropdown">
            <div class="dropdown-header">
                <div class="dropdown-avatar">
                    ${user.foto
                        ? `<img src="${user.foto}" alt="${user.nome}">`
                        : `<span>${(user.nome || 'U')[0].toUpperCase()}</span>`
                    }
                </div>
                <div>
                    <p class="dropdown-nome">${user.nome || 'Utilizador'}</p>
                    <p class="dropdown-email">${user.email || ''}</p>
                </div>
            </div>
            <div class="dropdown-sep"></div>
            <a href="abas/perfil.html" class="dropdown-item">
                <i class="ph ph-user-circle"></i> O meu perfil
            </a>
            <a href="abas/perfil.html#favoritos" class="dropdown-item">
                <i class="ph ph-heart"></i> Os meus favoritos
            </a>
            <a href="abas/destino.html" class="dropdown-item">
                <i class="ph ph-map-pin"></i> Destinos
            </a>
            <div class="dropdown-sep"></div>
            <button class="dropdown-item dropdown-sair" onclick="sair()">
                <i class="ph ph-sign-out"></i> Terminar sessão
            </button>
        </div>
    `;

    if (headerInner) headerInner.appendChild(perfilMenu);

    // Fechar ao clicar fora
    document.addEventListener('click', e => {
        if (!perfilMenu.contains(e.target)) fecharMenuPerfil();
    });
}

function toggleMenuPerfil() {
    const dropdown = document.getElementById('perfilDropdown');
    const caret    = document.getElementById('caretIcon');
    const aberto   = dropdown?.classList.contains('aberto');
    if (aberto) fecharMenuPerfil();
    else {
        dropdown?.classList.add('aberto');
        if (caret) caret.style.transform = 'rotate(180deg)';
    }
}

function fecharMenuPerfil() {
    document.getElementById('perfilDropdown')?.classList.remove('aberto');
    const caret = document.getElementById('caretIcon');
    if (caret) caret.style.transform = 'rotate(0deg)';
}

// ══════════════════════════════════════════
// SAIR
// ══════════════════════════════════════════
function sair() {
    localStorage.removeItem('angomovel_token');
    localStorage.removeItem('angomovel_user');
    window.location.reload();
}

// ══════════════════════════════════════════
// FAVORITOS
// ══════════════════════════════════════════
function getFavoritos() {
    return JSON.parse(localStorage.getItem('angomovel_favoritos') || '[]');
}

function salvarFavoritos(favs) {
    localStorage.setItem('angomovel_favoritos', JSON.stringify(favs));
}

function toggleFavorito(id, nome, imagem, local) {
    const token = localStorage.getItem('angomovel_token');

    if (!token) {
        mostrarToast('👤 Faz login para guardar favoritos!');
        setTimeout(() => { window.location.href = 'abas/cadastroAngo.html'; }, 1500);
        return;
    }

    let favs = getFavoritos();
    const idx = favs.findIndex(f => f.id === id);

    if (idx >= 0) {
        favs.splice(idx, 1);
        mostrarToast('💔 Removido dos favoritos');
    } else {
        favs.push({ id, nome, imagem, local, data: new Date().toISOString() });
        mostrarToast('❤️ Adicionado aos favoritos!');
    }

    salvarFavoritos(favs);

    const btn = document.querySelector(`[data-fav="${id}"]`);
    if (btn) btn.classList.toggle('ativo', idx < 0);
}

function isFavorito(id) {
    return getFavoritos().some(f => f.id === id);
}

// ══════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════
function mostrarToast(msg) {
    document.querySelector('.toast-fav')?.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-fav';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
}

// ══════════════════════════════════════════
// ESTILOS DO PERFIL MENU
// ══════════════════════════════════════════
const estilosPerfil = document.createElement('style');
estilosPerfil.textContent = `
.perfil-menu { position: relative; display: flex; align-items: center; }

.perfil-trigger {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 14px 6px 6px; border-radius: 999px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    cursor: pointer; transition: 0.25s;
}

.perfil-trigger:hover {
    background: rgba(255,255,255,0.14);
    border-color: rgba(240,180,41,0.3);
}

.perfil-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, #CC0000, #E8192C);
    overflow: hidden; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
}

.perfil-avatar img { width: 100%; height: 100%; object-fit: cover; }
.perfil-avatar span { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 900; color: #fff; }
.perfil-nome { font-size: 13px; font-weight: 600; color: #fff; }
.perfil-trigger i { font-size: 14px; color: rgba(255,255,255,0.5); transition: transform 0.25s; }

.perfil-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    width: 240px; background: #161616;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    overflow: hidden; opacity: 0; pointer-events: none;
    transform: translateY(-10px) scale(0.97);
    transition: 0.25s cubic-bezier(0.4,0,0.2,1);
    z-index: 1000;
}

.perfil-dropdown.aberto { opacity: 1; pointer-events: all; transform: translateY(0) scale(1); }

.dropdown-header { display: flex; align-items: center; gap: 12px; padding: 16px; }

.dropdown-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg, #CC0000, #E8192C);
    overflow: hidden; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
}

.dropdown-avatar img { width: 100%; height: 100%; object-fit: cover; }
.dropdown-avatar span { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 900; color: #fff; }
.dropdown-nome  { font-size: 14px; font-weight: 700; color: #fff; }
.dropdown-email { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
.dropdown-sep   { height: 1px; background: rgba(255,255,255,0.07); }

.dropdown-item {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.7); text-decoration: none;
    background: none; border: none; width: 100%;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    transition: 0.2s; text-align: left;
}

.dropdown-item i { font-size: 17px; color: rgba(255,255,255,0.4); }
.dropdown-item:hover { background: rgba(255,255,255,0.05); color: #fff; padding-left: 20px; }
.dropdown-item:hover i { color: #E8192C; }
.dropdown-sair { color: #E8192C !important; }
.dropdown-sair i { color: #E8192C !important; }
.dropdown-sair:hover { background: rgba(232,25,44,0.08) !important; }
`;

document.head.appendChild(estilosPerfil);

// ══════════════════════════════════════════
// INICIAR
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', verificarSessao);