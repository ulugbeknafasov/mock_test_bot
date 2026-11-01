(function () {
  "use strict";

  const BANKS = {
    matematika: {
      tabs: {
        "Asosiy": [
          "+", "−", "×", "÷", "=", "≠", "<", ">", "≤", "≥",
          "±", "∞", "π", "%", "√", "∛", "∑", "∏", "∫",
          "∂", "Δ", "θ", "α", "β", "°"
        ],
        "Trigonometriya": [
          "\\sin", "\\cos", "\\tan", "\\cot",
          "\\arcsin", "\\arccos", "\\arctan",
          "\\pi", "\\theta", "\\alpha", "\\beta"
        ],
        "Algebra": [
          "x^2", "x^n", "\\frac{#?}{#?}", "\\sqrt{#?}",
          "\\left( #? \\right)", "|#?|", "\\log_{#?}(#?)",
          "\\ln", "\\lim_{x\\to #?}"
        ],
        "Calculus": [
          "\\int_{#?}^{#?} #? \\,dx",
          "\\sum_{#?}^{#?} #?",
          "\\prod_{#?}^{#?} #?",
          "\\frac{d}{dx}", "\\partial", "\\nabla",
          "\\infty", "\\begin{cases}#?\\end{cases}"
        ]
      }
    },

    fizika: {
      tabs: {
        "Birliklar": [
          "m", "s", "kg", "A", "K", "mol", "cd",
          "N", "Pa", "J", "W", "C", "V", "Ω",
          "Hz", "T", "F", "H", "°C", "°F"
        ],
        "Mexanika": [
          "v", "a", "F", "m", "p", "E_k", "E_p",
          "W", "P", "g", "h", "\\Delta t",
          "\\Delta s", "F=ma", "v=s/t"
        ],
        "Elektr": [
          "I=U/R", "U=IR", "P=UI", "R=U/I",
          "q=It", "\\Omega", "\\mu", "\\varepsilon",
          "\\lambda", "\\nu"
        ],
        "Issiqlik va optika": [
          "Q=cm\\Delta T", "\\eta", "\\lambda",
          "n=c/v", "\\alpha", "\\beta",
          "\\theta", "\\varphi", "\\Delta"
        ]
      }
    },

    kimyo: {
      tabs: {
        "Elementlar": [
          "H", "He", "Li", "Be", "B", "C", "N", "O",
          "F", "Ne", "Na", "Mg", "Al", "Si", "P",
          "S", "Cl", "Ar", "K", "Ca", "Fe", "Cu",
          "Zn", "Ag", "Au"
        ],
        "Formulalar": [
          "H_2", "O_2", "N_2", "H_2O", "CO_2",
          "CO", "NH_3", "CH_4", "HCl", "H_2SO_4",
          "NaOH", "CaCO_3", "C_6H_{12}O_6"
        ],
        "Reaksiyalar": [
          "\\rightarrow", "\\rightleftharpoons",
          "\\uparrow", "\\downarrow", "+", "\\Delta",
          "\\xrightarrow{#?}", "(aq)", "(s)", "(l)", "(g)"
        ],
        "Ionlar": [
          "Na^+", "Cl^-", "SO_4^{2-}", "NO_3^-",
          "CO_3^{2-}", "NH_4^+", "Ca^{2+}",
          "Fe^{3+}", "pH", "pOH", "e^-", "H^+", "OH^-"
        ]
      }
    },

    biologiya: {
      tabs: {
        "Genetika": [
          "DNA", "RNA", "mRNA", "tRNA", "ATP", "ADP",
          "A", "T", "G", "C", "X", "Y",
          "\\alpha", "\\beta", "\\gamma"
        ],
        "Hujayra": [
          "\\text{hujayra}", "\\text{mitoz}",
          "\\text{meyoz}", "\\text{yadro}",
          "\\text{membrana}", "\\text{sitoplazma}",
          "\\text{ribosoma}", "\\text{mitoxondriya}"
        ],
        "Biologik belgilar": [
          "♀", "♂", "\\rightarrow", "\\uparrow",
          "\\downarrow", "\\times", "\\approx",
          "°C", "\\mu m", "\\%"
        ],
        "Atamalar": [
          "\\text{oqsil}", "\\text{ferment}",
          "\\text{gen}", "\\text{allel}",
          "\\text{fenotip}", "\\text{genotip}",
          "\\text{populyatsiya}", "\\text{ekotizim}"
        ]
      }
    }
  };

  let activeTarget = null;
  let activeSubject = "matematika";
  let modal = null;
  let mathfield = null;
  let scriptPromise = null;

  function ensureMathLive() {
    if (customElements.get("math-field")) {
      return Promise.resolve();
    }

    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = "https://cdn.jsdelivr.net/npm/mathlive";
      script.onload = resolve;
      script.onerror = () => reject(
        new Error(
          "Formula muharriri yuklanmadi. Internet aloqasini tekshiring."
        )
      );

      document.head.appendChild(script);
    });

    return scriptPromise;
  }

  function ensureModal() {
    if (modal) return;

    const style = document.createElement("style");

    style.textContent = `
      .fm-backdrop {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(8,13,25,.72);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 10px;
      }

      .fm-panel {
        width: min(760px,100%);
        max-height: 92vh;
        overflow: auto;
        background: #111827;
        color: #f8fafc;
        border: 1px solid #334155;
        border-radius: 20px;
        padding: 14px;
        box-shadow: 0 20px 70px #0008;
        font-family: Arial,sans-serif;
      }

      .fm-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-weight: 700;
      }

      .fm-close {
        background: #334155;
        color: white;
        border: 0;
        border-radius: 10px;
        padding: 8px 12px;
        font-size: 18px;
      }

      .fm-field {
        display: block;
        width: 100%;
        min-height: 64px;
        background: #fff;
        color: #111827;
        border: 1px solid #64748b;
        border-radius: 12px;
        padding: 10px;
        font-size: 24px;
        margin-bottom: 12px;
      }

      .fm-tabs {
        display: flex;
        gap: 6px;
        overflow: auto;
        padding-bottom: 8px;
        margin-bottom: 8px;
      }

      .fm-tab {
        white-space: nowrap;
        background: #263449;
        color: #e2e8f0;
        border: 0;
        border-radius: 9px;
        padding: 9px 12px;
      }

      .fm-tab.active {
        background: #0f766e;
        color: white;
      }

      .fm-keys {
        display: grid;
        grid-template-columns: repeat(8,minmax(0,1fr));
        gap: 7px;
      }

      .fm-panel.fm-science .fm-keys {
        grid-template-columns:repeat(10,minmax(0,1fr));
      }

      .fm-panel.fm-math {
        background:#0756b8;
        border-color:#3b82f6;
      }

      .fm-panel.fm-math .fm-tab {
        background:#174b91;
        color:#fff;
      }

      .fm-panel.fm-math .fm-tab.active {
        background:#fff;
        color:#0756b8;
      }

      .fm-panel.fm-math .fm-key {
        min-height:44px;
        background:#fff;
        color:#12345a;
        border:0;
        border-radius:10px;
        font-weight:700;
      }

      .fm-panel.fm-science .fm-key {
        min-height:40px;
        background:#f8fafc;
        color:#172033;
        border-color:#cbd5e1;
        border-radius:8px;
        font-size:15px;
      }

      .fm-panel.fm-science .fm-tab.active {
        background:#2563eb;
      }

      .fm-key {
        min-height: 42px;
        border: 1px solid #334155;
        border-radius: 9px;
        background: #1e293b;
        color: #f8fafc;
        font-size: 16px;
        padding: 6px;
        overflow-wrap: anywhere;
      }

      .fm-key:active {
        background: #0f766e;
      }

      .fm-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .fm-actions button {
        flex: 1;
        min-height: 44px;
        border: 0;
        border-radius: 10px;
        font-weight: 700;
      }

      .fm-cancel {
        background: #334155;
        color: #fff;
      }

      .fm-save {
        background: #0f9f82;
        color: white;
      }

      .fm-open {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 40px;
        height: 40px;
        margin-left: 5px;
        border: 0;
        border-radius: 9px;
        background: #e0f2fe;
        color: #075985;
        font-weight: 700;
        vertical-align: middle;
        cursor: pointer;
      }

      @media(max-width:420px) {
        .fm-keys {
          grid-template-columns: repeat(4,minmax(0,1fr));
        }

        .fm-panel {
          padding: 11px;
        }

        .fm-field {
          font-size: 20px;
        }
      }
    `;

    document.head.appendChild(style);

    modal = document.createElement("div");
    modal.className = "fm-backdrop";
    modal.hidden = true;

    modal.innerHTML = `
      <div class="fm-panel"
           role="dialog"
           aria-modal="true"
           aria-label="Formula muharriri">

        <div class="fm-head">
          <span id="fm-title">Formula muharriri</span>
          <button type="button"
                  class="fm-close"
                  id="fm-close">✕</button>
        </div>

        <math-field
          id="fm-field"
          class="fm-field"
          virtual-keyboard-mode="manual">
        </math-field>

        <div class="fm-tabs" id="fm-tabs"></div>
        <div class="fm-keys" id="fm-keys"></div>

        <div class="fm-actions">
          <button type="button"
                  class="fm-cancel"
                  id="fm-cancel">Bekor qilish</button>

          <button type="button"
                  class="fm-save"
                  id="fm-save">Kiritish ✓</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    mathfield = modal.querySelector("#fm-field");

    modal.querySelector("#fm-close").onclick = close;
    modal.querySelector("#fm-cancel").onclick = close;
    modal.querySelector("#fm-save").onclick = save;

    modal.addEventListener("click", event => {
      if (event.target === modal) close();
    });
  }

  function insertLatex(value) {
    if (!mathfield) return;

    try {
      if (typeof mathfield.insert === "function") {
        mathfield.insert(value);
      } else {
        mathfield.executeCommand(["insert", value]);
      }

      mathfield.focus();
    } catch (error) {
      mathfield.value = (mathfield.value || "") + value;
    }
  }

  function renderBank() {
    const panel = modal.querySelector(".fm-panel");

    panel.classList.toggle(
      "fm-math",
      activeSubject === "matematika" || activeSubject === "fizika"
    );

    panel.classList.toggle(
      "fm-science",
      activeSubject === "kimyo" || activeSubject === "biologiya"
    );

    if (
      activeSubject === "matematika" ||
      activeSubject === "fizika"
    ) {
      const bank = BANKS.matematika;
      const tabs = Object.keys(bank.tabs);
      const tabsBox = modal.querySelector("#fm-tabs");

      tabsBox.innerHTML = "";

      tabs.forEach((tab, index) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className =
          "fm-tab" + (index === 0 ? " active" : "");

        button.textContent = tab;

        button.onclick = () => {
          tabsBox.querySelectorAll("button").forEach(item =>
            item.classList.remove("active")
          );

          button.classList.add("active");
          renderKeys(bank.tabs[tab]);
        };

        tabsBox.appendChild(button);
      });

      renderKeys(bank.tabs[tabs[0]] || []);
      return;
    }

    const tabsBox = modal.querySelector("#fm-tabs");

    tabsBox.innerHTML = "";

    const groups = {
      "Harf va raqam": [
        "1","2","3","4","5","6","7","8","9","0",
        "q","w","e","r","t","y","u","i","o","p",
        "a","s","d","f","g","h","j","k","l",
        "z","x","c","v","b","n","m",
        "+","−","=","(",")"
      ],

      "Indekslar": [
        "x^2","x^n","x_2","x_n",
        "^{+}","^{-}","^{2+}","^{3+}",
        "^{2-}","^{3-}",
        "→","⇌","↑","↓","°","μ",
        "α","β","γ","Δ","⌫","Tozalash"
      ],

      "Tayyor formulalar": activeSubject === "kimyo"
        ? [
            "H_2O","CO_2","O_2","N_2","NH_3",
            "CH_4","H_2SO_4","NaOH","CaCO_3",
            "C_6H_{12}O_6","Fe^{3+}","SO_4^{2-}"
          ]
        : [
            "DNA","RNA","mRNA","tRNA","ATP","ADP",
            "♀","♂","μm","°C","α","β"
          ]
    };

    Object.keys(groups).forEach((tab, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className =
        "fm-tab" + (index === 0 ? " active" : "");

      button.textContent = tab;

      button.onclick = () => {
        tabsBox.querySelectorAll("button").forEach(item =>
          item.classList.remove("active")
        );

        button.classList.add("active");
        renderKeys(groups[tab]);
      };

      tabsBox.appendChild(button);
    });

    renderKeys(groups["Harf va raqam"]);
  }

  function renderKeys(keys) {
    const box = modal.querySelector("#fm-keys");

    box.innerHTML = "";

    keys.forEach(key => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "fm-key";

      button.textContent = key.replace(
        /\\text\{([^}]+)\}/g,
        "$1"
      );

      button.onclick = () => {
        if (key === "⌫") {
          try {
            mathfield.executeCommand("deleteBackward");
          } catch (_) {
            mathfield.value =
              (mathfield.value || "").slice(0, -1);
          }

          mathfield.focus();

        } else if (key === "Tozalash") {
          mathfield.value = "";
          mathfield.focus();

        } else {
          insertLatex(key);
        }
      };

      box.appendChild(button);
    });
  }

  async function open(target, subject) {
    activeTarget = target;

    activeSubject = BANKS[subject]
      ? subject
      : "matematika";

    ensureModal();

    modal.hidden = false;

    modal.querySelector("#fm-title").textContent =
      "Formula muharriri — " +
      activeSubject[0].toUpperCase() +
      activeSubject.slice(1);

    try {
      await ensureMathLive();

      mathfield.value = target && target.value
        ? target.value
        : "";

      renderBank();
      mathfield.focus();

    } catch (error) {
      alert(
        error.message ||
        "Formula muharriri yuklanmadi."
      );

      close();
    }
  }

  function save() {
    if (!activeTarget || !mathfield) {
      return close();
    }

    const latex =
      typeof mathfield.getValue === "function"
        ? mathfield.getValue("latex")
        : mathfield.value;

    activeTarget.value = latex || "";

    activeTarget.dispatchEvent(
      new Event("input", { bubbles: true })
    );

    activeTarget.dispatchEvent(
      new Event("change", { bubbles: true })
    );

    close();
  }

  function close() {
    if (modal) modal.hidden = true;

    activeTarget = null;
  }

  function attach(target, subject) {
    if (
      !target ||
      target.dataset.formulaButtonAttached === "1"
    ) {
      return;
    }

    target.dataset.formulaButtonAttached = "1";

    const button = document.createElement("button");

    button.type = "button";
    button.className = "fm-open";
    button.textContent = "∑";
    button.title = "Formula muharririni ochish";

    button.setAttribute(
      "aria-label",
      "Formula muharririni ochish"
    );

    const launchEditor = () => {
      open(
        target,
        subject ||
        document.body.dataset.subject ||
        "matematika"
      );
    };

    button.addEventListener("click", launchEditor);

    // Inputga kirilganda test fani bo‘yicha mos klaviatura avtomatik ochiladi.
    target.addEventListener("focus", launchEditor);

    target.insertAdjacentElement("afterend", button);
  }

  window.FormulaEditor = {
    open,
    attach,
    banks: BANKS
  };
})();
