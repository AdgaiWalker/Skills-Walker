/**
 * deck_stage.js — 幻灯片演示外壳 Web 组件
 * 用法：<deck-stage> 元素包裹 <section> 子元素，每个 section 为一张幻灯片
 */
class DeckStage extends HTMLElement {
  constructor() {
    super();
    this.currentSlide = 0;
    this.slides = [];
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.slides = Array.from(this.querySelectorAll(':scope > section'));

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; width: 100vw; height: 100vh; background: #000; position: relative; overflow: hidden; }
        .container { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .slide { display: none; width: 1920px; height: 1080px; transform-origin: top left; }
        .slide.active { display: block; }
        .nav { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 100;
               display: flex; gap: 12px; align-items: center; color: #888; font: 14px sans-serif; }
        .nav button { background: rgba(255,255,255,.15); border: none; color: #fff; padding: 8px 16px;
                      border-radius: 6px; cursor: pointer; font-size: 16px; }
        .nav button:hover { background: rgba(255,255,255,.3); }
        .counter { min-width: 60px; text-align: center; }
      </style>
      <div class="container" id="container"></div>
      <div class="nav">
        <button id="prev">&larr;</button>
        <span class="counter" id="counter"></span>
        <button id="next">&rarr;</button>
      </div>
    `;

    this.container = this.shadowRoot.getElementById('container');
    this.counterEl = this.shadowRoot.getElementById('counter');

    this.slides.forEach(s => this.container.appendChild(s));

    this.shadowRoot.getElementById('prev').addEventListener('click', () => this.go(this.currentSlide - 1));
    this.shadowRoot.getElementById('next').addEventListener('click', () => this.go(this.currentSlide + 1));

    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ') this.go(this.currentSlide + 1);
      if (e.key === 'ArrowLeft') this.go(this.currentSlide - 1);
    });

    const saved = localStorage.getItem('deck-position');
    this.go(saved ? parseInt(saved) : 0);
    this.scale();
    window.addEventListener('resize', () => this.scale());
  }

  scale() {
    const sx = window.innerWidth / 1920;
    const sy = window.innerHeight / 1080;
    const s = Math.min(sx, sy);
    this.container.style.transform = `translate(-50%, -50%) scale(${s})`;
  }

  go(index) {
    if (index < 0 || index >= this.slides.length) return;
    this.slides.forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
    this.slides[index].classList.add('active');
    this.slides[index].style.display = 'block';
    this.currentSlide = index;
    this.counterEl.textContent = `${index + 1}/${this.slides.length}`;
    this.slides[index].setAttribute('data-screen-label', String(index + 1).padStart(2, '0'));
    localStorage.setItem('deck-position', index);
    window.postMessage({ slideIndexChanged: index }, '*');
  }
}
customElements.define('deck-stage', DeckStage);
