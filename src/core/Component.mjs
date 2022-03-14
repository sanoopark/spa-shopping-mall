export default class Component {
  constructor(target, props) {
    this.target = target;
    this.state = props;
    this.render();
    this.setEvent();
    this.mounted();
  }

  render() {}

  setEvent() {}

  mounted() {}

  addEvent({ eventType, selector, callback }) {
    const element = this.target.querySelector(selector);
    const isTarget = (target) => target.closest(selector);

    element.addEventListener(eventType, (event) => {
      if (!isTarget(event.target)) return;
      callback?.bind(this)(event);
    });
  }

  setState(addedState) {
    this.state = {
      ...this.state,
      ...addedState
    };
    this.render();
    this.setEvent();
  }
}
