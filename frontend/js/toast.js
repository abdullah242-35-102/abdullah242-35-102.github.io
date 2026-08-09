export function showToast(message, type = 'success', duration = 3600) {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.setAttribute('aria-live', 'polite');
    document.body.appendChild(stack);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'error' ? '×' : type === 'warning' ? '!' : '✓';
  toast.innerHTML = `<span class="toast-icon" aria-hidden="true">${icon}</span><p></p><button type="button" aria-label="Dismiss notification">×</button>`;
  toast.querySelector('p').textContent = message;
  const remove = () => {
    if (!toast.isConnected) return;
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 180);
  };
  toast.querySelector('button').addEventListener('click', remove);
  stack.appendChild(toast);
  setTimeout(remove, duration);
}
