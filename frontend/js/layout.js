/* =====================================================
   layout.js — Setup común del dashboard
   ===================================================== */

/* Etiquetas e iconos personalizados por rol */
const NAV_CONFIG = {
    Admin: {
        dashboard: { label: 'Inicio',              icon: 'ri-home-4-line' },
        inventory: { label: 'Inventario',          icon: 'ri-archive-2-line' },
        orders:    { label: 'Pedidos',              icon: 'ri-file-list-3-line' },
        menu:      { label: 'Menú',                 icon: 'ri-bill-line' },
        users:     { label: 'Usuarios',             icon: 'ri-team-line' },
        settings:  { label: 'Configuración',        icon: 'ri-settings-3-line' },
    },
    Mesero: {
        orders:   { label: 'Mis Pedidos',   icon: 'ri-receipt-line' },
        menu:     { label: 'Tomar Pedido',  icon: 'ri-shopping-cart-2-line' },
        settings: { label: 'Configuración', icon: 'ri-settings-3-line' },
    },
    Chef: {
        orders:   { label: 'Pedidos Activos', icon: 'ri-fire-line' },
        settings: { label: 'Configuración',   icon: 'ri-settings-3-line' },
    },
};

export function setupLayout() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // ── Sidebar: datos del usuario ──
    const nameEl   = document.getElementById('user-name');
    const roleEl   = document.getElementById('user-role');
    const avatarEl = document.getElementById('user-avatar');

    if (nameEl)   nameEl.textContent   = user.nombre || 'Usuario';
    if (roleEl)   roleEl.textContent   = user.rol    || '';
    if (avatarEl) avatarEl.textContent = (user.nombre || 'U')[0].toUpperCase();

    // ── Filtrar y personalizar nav según rol ──
    applyNavByRole(user.rol);

    // ── Top nav: fecha ──
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    }

    // ── Logout con confirmación ──
    document.getElementById('btnLogout')?.addEventListener('click', () => {
        showLogoutConfirm();
    });

    // ── Mobile sidebar toggle ──
    const sidebar   = document.getElementById('sidebar');
    const overlay   = document.getElementById('sidebar-overlay');
    const toggleBtn = document.getElementById('sidebar-toggle');

    function openSidebar()  {
        sidebar?.classList.add('is-open');
        overlay?.classList.add('is-visible');
        document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
        sidebar?.classList.remove('is-open');
        overlay?.classList.remove('is-visible');
        document.body.style.overflow = '';
    }

    toggleBtn?.addEventListener('click', () => {
        sidebar?.classList.contains('is-open') ? closeSidebar() : openSidebar();
    });
    overlay?.addEventListener('click', closeSidebar);

    document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth < 769) closeSidebar();
        });
    });

    // ── Low stock badge (solo Admin) ──
    if (user.rol === 'Admin') checkLowStock();

    return user;
}

/* ── Personalizar sidebar según rol ── */
function applyNavByRole(rol) {
    const config = NAV_CONFIG[rol] || {};

    document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
        const view        = btn.dataset.view;
        const allowedRols = (btn.dataset.roles || '').split(',').map(r => r.trim());
        const allowed     = allowedRols.includes(rol);

        btn.style.display = allowed ? '' : 'none';

        if (allowed && config[view]) {
            // Actualizar icono
            const iconEl = btn.querySelector('i');
            if (iconEl) iconEl.className = config[view].icon;
            // Actualizar etiqueta
            const labelEl = btn.querySelector('.nav-label');
            if (labelEl) labelEl.textContent = config[view].label;
        }
    });

    // Ocultar títulos de sección si no tienen items visibles debajo
    hideSectionTitleIfEmpty('section-principal', ['dashboard', 'inventory', 'orders', 'menu']);
    hideSectionTitleIfEmpty('section-sistema',   ['users', 'settings']);
}

function hideSectionTitleIfEmpty(sectionId, views) {
    const titleEl = document.getElementById(sectionId);
    if (!titleEl) return;
    const anyVisible = views.some(v => {
        const btn = document.querySelector(`.nav-item[data-view="${v}"]`);
        return btn && btn.style.display !== 'none';
    });
    titleEl.style.display = anyVisible ? '' : 'none';
}

/* ── Confirmación de logout ── */
function showLogoutConfirm() {
    const existing = document.getElementById('logout-confirm-dialog');
    if (existing) return;

    const dialog = document.createElement('div');
    dialog.id        = 'logout-confirm-dialog';
    dialog.className = 'confirm-dialog-overlay';
    dialog.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-dialog-icon"><i class="ri-logout-box-r-line"></i></div>
      <h3 class="confirm-dialog-title">¿Cerrar sesión?</h3>
      <p class="confirm-dialog-msg">Serás redirigido a la pantalla de inicio de sesión.</p>
      <div class="confirm-dialog-actions">
        <button class="btn-secondary" id="confirm-cancel">Cancelar</button>
        <button class="btn-danger" id="confirm-logout">Cerrar sesión</button>
      </div>
    </div>`;

    document.body.appendChild(dialog);
    requestAnimationFrame(() => dialog.classList.add('visible'));

    dialog.querySelector('#confirm-cancel').addEventListener('click', () => {
        dialog.classList.remove('visible');
        dialog.addEventListener('transitionend', () => dialog.remove(), { once: true });
    });

    dialog.querySelector('#confirm-logout').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.classList.remove('visible');
            dialog.addEventListener('transitionend', () => dialog.remove(), { once: true });
        }
    });
}

/* ── Low stock badge ── */
async function checkLowStock() {
    const badge = document.getElementById('nav-badge-inventory');
    if (!badge) return;
    try {
        const res = await fetch('/api/inventory', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) return;
        const items    = await res.json();
        const lowCount = items.filter(i => i.stock <= i.minStock).length;
        if (lowCount > 0) {
            badge.textContent   = lowCount;
            badge.style.display = 'inline-flex';
        }
    } catch { /* silencioso */ }
}

/* ── Helpers exportados ── */
export function setActiveNav(viewId, title) {
    document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewId);
    });
    const titleEl = document.getElementById('view-title');
    if (titleEl && title) titleEl.textContent = title;
}

export function showComingSoon(container, label = 'Esta sección') {
    if (!container) return;
    container.innerHTML = `
    <div class="view-empty">
      <i class="ri-tools-line"></i>
      <p>${label} — Próximamente</p>
    </div>`;
}

export function showNoAccess(container) {
    if (!container) return;
    container.innerHTML = `
    <div class="view-empty">
      <i class="ri-lock-line" style="color:var(--danger);"></i>
      <p>No tienes acceso a esta sección</p>
    </div>`;
}
