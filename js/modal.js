function syncScrollLock() {
  const open = document.querySelector('.modal-shell.is-open,.side-drawer.is-open,.filter-panel.is-open');
  document.body.classList.toggle('no-scroll', Boolean(open));
}

export function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('is-open');
  const overlay = document.querySelector(`[data-overlay-for="${id}"]`);
  overlay?.classList.add('is-open');
  syncScrollLock();
  setTimeout(() => modal.querySelector('input,button,a,select,textarea')?.focus(), 30);
}

export function closeModal(id) {
  document.getElementById(id)?.classList.remove('is-open');
  document.querySelector(`[data-overlay-for="${id}"]`)?.classList.remove('is-open');
  syncScrollLock();
}

export function openDrawer(id) {
  document.getElementById(id)?.classList.add('is-open');
  document.querySelector(`[data-overlay-for="${id}"]`)?.classList.add('is-open');
  syncScrollLock();
}

export function closeDrawer(id) {
  document.getElementById(id)?.classList.remove('is-open');
  document.querySelector(`[data-overlay-for="${id}"]`)?.classList.remove('is-open');
  syncScrollLock();
}

export function closeAll() {
  document.querySelectorAll('.modal-shell.is-open,.side-drawer.is-open,.filter-panel.is-open').forEach((element) => element.classList.remove('is-open'));
  document.querySelectorAll('.modal-overlay.is-open,.drawer-overlay.is-open').forEach((element) => element.classList.remove('is-open'));
  syncScrollLock();
}

export function initModalControls() {
  document.addEventListener('click', (event) => {
    const closer = event.target.closest('[data-close-modal]');
    if (closer) closeModal(closer.dataset.closeModal);
    const drawerCloser = event.target.closest('[data-close-drawer]');
    if (drawerCloser) closeDrawer(drawerCloser.dataset.closeDrawer);
    const overlay = event.target.closest('[data-overlay-for]');
    if (overlay === event.target) {
      const target = overlay.dataset.overlayFor;
      closeModal(target);
      closeDrawer(target);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });
}
