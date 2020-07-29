import createElement from './create-element';
import { Timeline, Animation } from './animation';
import { ease, linear } from './cubic-bezier';

export default class Carousel {
  constructor() {
    this.children = [];
    this.attributes = new Map();
    this.properties = new Map();
  }

  setAttribute(name, value) {
    this[name] = value;
  }

  render() {
    let nextPicStopHandler = null;
    let children = this.data.map((item, currentPosition) => {
      let offset = 0;
      const onStart = () => {
        timeline.pause();
        clearTimeout(nextPicStopHandler);
        let currentElement = children[currentPosition];
        let currentTransformerValue = Number(
          currentElement.style.transform.match(/translateX\(([\s\S]+)px\)/)[1]
        );
        offset = currentTransformerValue + 500 * currentPosition;
      };

      const onPan = event => {
        let lastPosition =
          (currentPosition - 1 + this.data.length) % this.data.length;
        let nextPosition = (currentPosition + 1) % this.data.length;

        let currentElement = children[currentPosition];
        let nextElement = children[nextPosition];
        let lastElement = children[lastPosition];

        let currentTransformerValue = -500 * currentPosition + offset;
        let nextTransformerValue = -500 - 500 * lastPosition + offset;
        let lastTransformerValue = 500 - 500 * nextPosition + offset;

        let dx = event.clientX - event.startX;

        currentElement.style.transform = `translateX(${currentTransformerValue +
          dx}px)`;
        nextElement.style.transform = `translateX(${nextTransformerValue +
          dx}px)`;
        lastElement.style.transform = `translateX(${lastTransformerValue +
          dx}px)`;
      };

      const onPanEnd = event => {
        let direction = 0;
        let dx = event.clientX - event.startX;
        if (dx + offset > 250) {
          direction = 1;
        } else if (dx + offset < 250) {
          direction = -1;
        }

        timeline.reset();
        timeline.restart();

        let currentElement = children[currentPosition];
        let nextElement = children[nextPosition];
        let lastElement = children[lastPosition];

        let currentAnimation = new Animation(
          currentElement.style,
          'transform',
          -100 * currentPosition,
          -100 - 100 * currentPosition,
          500,
          0,
          ease,
          v => `translateX(${5 * v}px)`
        );
        let nextAnimation = new Animation(
          nextElement.style,
          'transform',
          100 - 100 * nextPosition,
          -100 * nextPosition,
          500,
          0,
          ease,
          v => `translateX(${5 * v}px)`
        );

        let lastAnimation = new Animation(
          lastElement.style,
          'transform',
          100 - 100 * nextPosition,
          -100 * nextPosition,
          500,
          0,
          ease,
          v => `translateX(${5 * v}px)`
        );
      };

      let element = (
        <img src={item} onStart={onStart} onPan={onPan} enableGesture={true} />
      );
      element.style.transform = 'translateX(0px)';
      element.addEventListener('dragstart', e => e.preventDefault());
      return element;
    });

    let carousel = <div class="carousel">{children}</div>;

    let position = 0;
    let timeline = new Timeline();
    timeline.start();

    let nextPic = () => {
      let nextPosition = (position + 1) % this.data.length;

      let current = children[position];
      let next = children[nextPosition];

      let currentAnimation = new Animation(
        current.style,
        'transform',
        -100 * position,
        -100 - 100 * position,
        500,
        0,
        ease,
        v => `translateX(${5 * v}px)`
      );
      let nextAnimation = new Animation(
        next.style,
        'transform',
        100 - 100 * nextPosition,
        -100 * nextPosition,
        500,
        0,
        ease,
        v => `translateX(${5 * v}px)`
      );

      timeline.add(currentAnimation);
      timeline.add(nextAnimation);
      position = nextPosition;
      nextPicStopHandler = setTimeout(nextPic, 3000);
    };
    nextPicStopHandler = setTimeout(nextPic, 3000);
    return carousel;
  }

  mountTo(parent) {
    this.render().mountTo(parent);
  }
}
