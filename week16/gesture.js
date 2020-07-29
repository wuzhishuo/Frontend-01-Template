let contexts = Object.create(null);
let MOUSE_SYMBOL = Symbol('mouse');

export default function enableGesture(element) {
  if (document.ontouchstart !== null) {
    element.addEventListener('mousedown', event => {
      contexts[MOUSE_SYMBOL] = Object.create(null);
      start(event, contexts[MOUSE_SYMBOL]);
      let mousemove = event => {
        move(event, contexts[MOUSE_SYMBOL]);
      };

      let mouseend = event => {
        end(event, contexts[MOUSE_SYMBOL]);
        document.removeEventListener('mouseup', mouseend);
        document.removeEventListener('mousemove', mousemove);
      };

      document.addEventListener('mousemove', mousemove);
      document.addEventListener('mouseup', mouseend);
    });
  }

  element.addEventListener('touchstart', event => {
    for (const touch of event.changedTouches) {
      contexts[touch.identifier] = Object.create(null);
      start(touch, contexts[touch.identifier]);
    }
  });

  element.addEventListener('touchmove', event => {
    for (const touch of event.changedTouches) {
      move(touch, contexts[touch.identifier]);
    }
  });

  element.addEventListener('touchend', event => {
    for (const touch of event.changedTouches) {
      end(touch, contexts[touch.identifier]);
    }
  });

  element.addEventListener('touchcancel', event => {
    for (const touch of event.changedTouches) {
      cancel(touch, contexts[touch.identifier]);
    }
  });

  let start = (point, context) => {
    let event = new CustomEvent('start');
    element.dispatchEvent(
      Object.assign(event, {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY
      })
    );
    context.startX = point.clientX;
    context.startY = point.clientY;
    context.moves = [];
    context.isTap = true;
    context.isPan = false;
    context.isPress = false;

    context.timeoutHandler = setTimeout(() => {
      if (context.isPan) {
        return;
      }
      context.isTap = false;
      context.isPan = false;
      context.isPress = true;
      element.dispatchEvent(new CustomEvent('pressstart', {}));
    }, 500);
  };

  let move = (point, context) => {
    let dx = point.clientX - context.startX;
    let dy = point.clientY - context.startY;

    if (dx ** 2 + dy ** 2 > 100 && !context.isPan) {
      if (context.isPress) {
        element.dispatchEvent(new CustomEvent('presscancel', {}));
      }
      context.isTap = false;
      context.isPan = true;
      context.isPress = false;
      let event = new CustomEvent('panstart');
      element.dispatchEvent(
        Object.assign(event, {
          startX: context.clientX,
          startY: context.startY,
          clientX: point.clientX,
          clientY: point.clientY
        })
      );
    }

    if (context.isPan) {
      context.moves.push({ dx, dy, t: Date.now() });
      context.moves = context.moves.filter(
        record => Date.now() - record.t < 300
      );
      let event = new CustomEvent('pan');
      element.dispatchEvent(
        Object.assign(event, {
          startX: context.startX,
          startY: context.startY,
          clientX: point.clientX,
          clientY: point.clientY
        })
      );
    }
  };

  let end = (point, context) => {
    if (context.isPan) {
      let dx = point.clientX - context.startX;
      let dy = point.clientY - context.startY;
      let record = context.moves[0];
      let speed = Math.sqrt(
        ((record.dx - dx) ** 2 + (record.dy - dy) ** 2) /
          (Date.now() - record.t)
      );

      let isFlick = speed > 2.5;
      if (isFlick > 2.5) {
        element.dispatchEvent(
          new CustomEvent('flick', {
            startX: context.startX,
            startY: context.startY,
            clientX: point.clientX,
            clientY: point.clientY,
            speed
          })
        );
      }
      element.dispatchEvent(
        new CustomEvent('panend', {
          startX: context.startX,
          startY: context.startY,
          clientX: point.clientX,
          clientY: point.clientY,
          speed,
          isFlick
        })
      );
    }
    if (context.isTap) {
      element.dispatchEvent(new CustomEvent('tap', {}));
    }

    if (context.isPress) {
      element.dispatchEvent(new CustomEvent('pressend', {}));
    }

    clearTimeout(context.timeoutHandler);
  };

  let cancel = (point, context) => {
    element.dispatchEvent(new CustomEvent('cancel', {}));
    clearTimeout(context.timeoutHandler);
  };
}
