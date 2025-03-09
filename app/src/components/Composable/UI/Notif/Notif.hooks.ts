import { createVNode, render } from 'vue';
import Notif from './Notif.vue';
import { NotifOptions } from './Notif.types';

let notificationsStack: HTMLElement[] = [];

export function useNotif(options: NotifOptions) {
  const targetSelector = options.teleportTarget || 'body';
  const targetElement = document.querySelector(targetSelector) || document.body;

  const container = document.createElement('div');
  targetElement.appendChild(container);
  console.log(notificationsStack)
  const index = notificationsStack.length;
  notificationsStack.push(container);

  const vnode = createVNode(
    Notif,
    { teleportTarget: targetSelector, type: options.type, index },
    { default: () => options.message }
  );

  render(vnode, container);

  const duration = options.duration || 3000;

  setTimeout(() => {
    render(null, container);
    const idx = notificationsStack.indexOf(container);
    if (idx !== -1) {
      notificationsStack = notificationsStack.splice(idx, 1);
      container.remove();
    }
  }, duration);
}

export function clearAllNotifs() {
  notificationsStack.forEach((container) => {
    render(null, container);
    container.remove();
  });
  notificationsStack.length = 0;
}
