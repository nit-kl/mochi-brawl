export type TouchButtonId = 'jump' | 'attack' | 'special' | 'guard';

type Vec2 = { x: number; y: number };

const BUTTON_LABELS: Record<TouchButtonId, string> = {
  jump: 'ジャンプ',
  attack: '攻撃',
  special: '必殺',
  guard: '防御'
};

/** ゲームキャンバスの外側に置くスマホ専用の操作パネル。 */
export class TouchControlsView {
  private readonly root: HTMLDivElement;
  private readonly stick: HTMLDivElement;
  private readonly knob: HTMLDivElement;
  private readonly buttons: Record<TouchButtonId, HTMLButtonElement>;

  constructor() {
    this.root = document.createElement('div');
    this.root.className = 'touch-controls';
    this.root.hidden = true;

    const left = document.createElement('div');
    left.className = 'touch-controls__rail touch-controls__rail--left';
    this.stick = document.createElement('div');
    this.stick.className = 'touch-controls__stick';
    this.stick.setAttribute('aria-label', '移動スティック');
    this.knob = document.createElement('div');
    this.knob.className = 'touch-controls__knob';
    this.stick.append(this.knob);
    left.append(this.stick);

    const right = document.createElement('div');
    right.className = 'touch-controls__rail touch-controls__rail--right';
    this.buttons = {
      jump: this.createButton('jump'),
      attack: this.createButton('attack'),
      special: this.createButton('special'),
      guard: this.createButton('guard')
    };
    right.append(this.buttons.jump, this.buttons.attack, this.buttons.special, this.buttons.guard);
    this.root.append(left, right);
    document.body.append(this.root);
  }

  setVisible(visible: boolean): void {
    this.root.hidden = !visible;
    if (!visible) this.setKnob(0, 0, false);
  }

  stickElement(): HTMLDivElement {
    return this.stick;
  }

  buttonElement(id: TouchButtonId): HTMLButtonElement {
    return this.buttons[id];
  }

  stickCenter(): Vec2 {
    const rect = this.stick.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  stickRadius(): number {
    return this.stick.getBoundingClientRect().width * 0.36;
  }

  setKnob(offsetX: number, offsetY: number, active: boolean): void {
    this.knob.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    this.stick.classList.toggle('is-active', active);
  }

  setPressed(id: TouchButtonId, pressed: boolean): void {
    this.buttons[id].classList.toggle('is-pressed', pressed);
  }

  resetPressed(): void {
    for (const id of ['jump', 'attack', 'special', 'guard'] as const) this.setPressed(id, false);
    this.setKnob(0, 0, false);
  }

  destroy(): void {
    this.root.remove();
  }

  private createButton(id: TouchButtonId): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `touch-controls__button touch-controls__button--${id}`;
    button.textContent = BUTTON_LABELS[id];
    button.setAttribute('aria-label', BUTTON_LABELS[id]);
    return button;
  }
}
