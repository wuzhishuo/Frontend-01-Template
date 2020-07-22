export class Timeline {
  constructor() {
    this.animations = [];
    this.requestId = null;
    this.state = 'inited';
  }
  tick() {
    let t = Date.now() - this.startTime;
    let animations = this.animations.filter(item => !item.finished);
    for (const animation of animations) {
      let {
        object,
        property,
        start,
        end,
        timingFunction,
        delay,
        template,
        duration,
        addTime
      } = animation;

      let progress = timingFunction((t - delay - addTime) / duration);
      if (t > animation.duration + animation.delay) {
        progress = 1;
        animation.finished = true;
      }

      object[property] = template(animation.valueFromProgress(progress));
    }

    if (animations.length) {
      this.requestId = requestAnimationFrame(() => this.tick());
    }
  }

  start() {
    if (this.state != 'inited') {
      return;
    }

    this.state = 'playing';
    this.startTime = Date.now();
    this.tick();
  }

  restart() {
    if (this.state == 'playing') {
      this.pause();
    }

    this.requestId = null;
    this.state = 'playing';
    this.startTime = Date.now();
    this.pauseTime = null;
    this.tick();
  }

  pause() {
    if (this.state != 'playing') {
      return;
    }

    this.state = 'paused';
    this.pauseTime = Date.now();
    cancelAnimationFrame(this.requestId);
  }

  resume() {
    if (this.state != 'paused') {
      return;
    }
    this.state = 'playing';
    this.startTime += Date.now() - this.pauseTime;
    this.tick();
  }

  add(animation, addTime) {
    this.animations.push(animation);
    animation.finished = false;

    if (this.state === 'playing') {
      animation.addTime =
        addTime != void 0 ? addTime : Date.now() - this.startTime;
    } else {
      animation.addTime = addTime != void 0 ? addTime : 0;
    }
  }
}

export class Animation {
  constructor(
    object,
    property,
    start,
    end,
    duration,
    delay,
    timingFunction,
    template
  ) {
    this.object = object;
    this.property = property;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.delay = delay || 0;
    this.template = template;
    this.timingFunction = timingFunction;
  }

  valueFromProgress(progress) {
    return this.start + progress * (this.end - this.start);
  }
}

export class ColorAnimation {
  constructor(
    object,
    property,
    start,
    end,
    duration,
    delay,
    timingFunction,
    template
  ) {
    this.object = object;
    this.property = property;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.delay = delay || 0;
    this.template = template || (v => `rgba(${v.r},${v.g},${v.b},${v.a})`);
    this.timingFunction = timingFunction;
  }

  valueFromProgress(progress) {
    return {
      r: this.start.r + progress * (this.end.r - this.start.r),
      g: this.start.g + progress * (this.end.g - this.start.g),
      b: this.start.b + progress * (this.end.b - this.start.b),
      a: this.start.a + progress * (this.end.a - this.start.a)
    };
  }
}
