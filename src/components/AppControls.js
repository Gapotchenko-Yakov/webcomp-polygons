// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-FileCopyrightText: Gapotchenko Yakov <yakov.gapotchenko@gmail.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

class AppControls extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
    <style>
    :host {
        display: block;
        margin-bottom: 10px;
    }

    button {
        margin-right: 8px;
        background: #222;
        color: var(--text-color);
        border: 1px solid #444;
        padding: 5px 10px;
        cursor: pointer;
    }

    button:hover {
        background: #333;
    }
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
