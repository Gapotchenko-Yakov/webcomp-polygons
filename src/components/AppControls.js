class AppControls extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
      <style>
        button { margin-right: 8px; }
      </style>
      <button id="create">Создать</button>
      <button id="save">Сохранить</button>
      <button id="reset">Сбросить</button>
    `;

        this.shadowRoot.getElementById('create').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('create-polygons', { bubbles: true, composed: true }));
        });
        this.shadowRoot.getElementById('save').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('save-polygons', { bubbles: true, composed: true }));
        });
        this.shadowRoot.getElementById('reset').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('reset-polygons', { bubbles: true, composed: true }));
        });
    }
}

customElements.define('app-controls', AppControls);
