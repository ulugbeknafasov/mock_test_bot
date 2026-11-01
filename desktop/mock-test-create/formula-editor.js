(function () {
  "use strict";

  const BANKS = {
    matematika: {
      tabs: {
        "Raqamlar": ["0","1","2","3","4","5","6","7","8","9",".",","],
        "Harflar": ["x","y","z","a","b","c","n","m","f","g","π","θ","α","β","μ","Δ"],
        "Asosiy": ["+","-","×","÷","=","≠","<",">","≤","≥","±","∞","%","√","∛","∑","∏","∫","∂","∇","°"],
        "Trigonometriya": ["\\sin","\\cos","\\tan","\\cot","\\arcsin","\\arccos","\\arctan","\\pi","\\theta","\\alpha","\\beta"],
        "Algebra": ["x^2","x^n","\\frac{a}{b}","\\sqrt{x}","\\left( x \\right)","|x|","\\log_{a}(x)","\\ln(x)","\\lim_{x\\to\\infty}"],
        "Calculus": ["\\int_{a}^{b} f(x)\\,dx","\\sum_{i=1}^{n} a_i","\\prod_{i=1}^{n} a_i","\\frac{d}{dx}","\\partial","\\nabla","\\infty"]
      }
    },

    fizika: {
      tabs: {
        "Raqamlar": ["0","1","2","3","4","5","6","7","8","9",".",","],
        "Harflar": ["a","b","c","d","E","F","g","h","I","m","n","p","q","R","s","t","U","v","W","x","λ","μ","ρ","ω","Δ"],
        "Belgilar": ["+","−","×","÷","=","≠","≈","±","∞","√","°","°C","Ω","π","θ","α","β","Δ","→"],
        "Mexanika": ["v=\\frac{s}{t}","a=\\frac{v}{t}","F=ma","p=mv","E_k=\\frac{mv^2}{2}","E_p=mgh","A=Fs","P=\\frac{A}{t}","g","\\Delta t","\\Delta s"],
        "Elektr": ["I=\\frac{U}{R}","U=IR","P=UI","R=\\frac{U}{I}","q=It","Ω","ε","λ","ν"],
        "Issiqlik va optika": ["Q=cm\\Delta T","\\eta","n=\\frac{c}{v}","\\lambda","\\nu","\\alpha","\\beta","\\theta","\\varphi"]
      }
    },

    kimyo: {
      tabs: {
        "Raqamlar": ["0","1","2","3","4","5","6","7","8","9",".",","],
        "Harflar": ["A","B","C","D","E","F","G","H","I","K","L","M","N","O","P","S","T","U","V","X","Y","Z"],
        "Elementlar": ["H","He","Li","Be","B","C","N","O","F","Ne","Na","Mg","Al","Si","P","S","Cl","Ar","K","Ca","Fe","Cu","Zn","Ag","Au"],
        "Formulalar": ["H_2","O_2","N_2","H_2O","CO_2","CO","NH_3","CH_4","HCl","H_2SO_4","NaOH","CaCO_3","C_6H_{12}O_6"],
        "Reaksiyalar": ["\\rightarrow","\\rightleftharpoons","\\uparrow","\\downarrow","+","\\Delta","(aq)","(s)","(l)","(g)"],
        "Ionlar": ["Na^+","Cl^-","SO_4^{2-}","NO_3^-","CO_3^{2-}","NH_4^+","Ca^{2+}","Fe^{3+}","e^-","H^+","OH^-"]
      }
    },

    biologiya: {
      tabs: {
        "Raqamlar": ["0","1","2","3","4","5","6","7","8","9",".",","],
        "Harflar": ["A","T","G","C","U","X","Y","a","b","c","n","m","p","q","r","x","y","z"],
        "Genetika": ["DNA","RNA","mRNA","tRNA","ATP","ADP","A","T","G","C","X","Y","α","β","γ"],
        "Hujayra": ["hujayra","mitoz","meyoz","yadro","membrana","sitoplazma","ribosoma","mitoxondriya"],
        "Belgilar": ["♀","♂","→","↑","↓","×","≈","°C","μm","%","α","β","γ"],
        "Atamalar": ["oqsil","ferment","gen","allel","fenotip","genotip","populyatsiya","ekotizim"]
      }
    }
  };

  let activeTarget = null;
  let activeSubject = "matematika";
  let modal = null;
  let mathfield = null;
  let scriptPromise = null;

  // MathLive kutubxonasini yuklash
  function loadMathLive() {
    if (customElements.get("math-field")) {
      return Promise.resolve();
    }

    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="mathlive"]');
      const script = existing || document.createElement("script");

      const onLoad = () => {
        if (customElements.get("math-field")) {
          resolve();
        } else {
          reject(new Error("MathLive yuklandi, lekin math-field elementi topilmadi."));
        }
      };

      const onError = () => {
        reject(new Error("Formula kutubxonasi yuklanmadi. Internet aloqasini tekshiring."));
      };

      if (customElements.get("math-field")) {
        resolve();
        return;
      }

      script.addEventListener("load", onLoad, { once: true });
      script.addEventListener("error", onError, { once: true });

      if (!existing) {
        script.src = "https://cdn.jsdelivr.net/npm/mathlive";
        document.head.appendChild(script);
      }
    }).catch(error => {
      scriptPromise = null;
      throw error;
    });

    return scriptPromise;
  }

  // Dizayn
  function addStyles() {
    if (document.getElementById("formula-editor-styles")) return;

    const style = document.createElement("style");
    style.id = "formula-editor-styles";

    style.textContent = `
      .fm-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        background: rgba(8,13,25,.68);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 10px;
        box-sizing: border-box;
      }

      .fm-backdrop[hidden] {
        display: none !important;
      }

      .fm-panel {
        width: min(760px,100%);
        max-height: 92dvh;
        overflow: auto;
        overscroll-behavior: contain;
        background: #0756b8;
        color: #fff;
        border: 1px solid #3b82f6;
        border-radius: 20px;
        padding: 14px;
        box-shadow: 0 20px 70px #0008;
        font-family: Arial,sans-serif;
        box-sizing: border-box;
        touch-action: pan-y;
      }

      .fm-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-weight: 700;
        font-size: 18px;
      }

      .fm-close {
        background: #334155;
        color: white;
        border: 0;
        border-radius: 10px;
        width: 46px;
        height: 46px;
        font-size: 26px;
        cursor: pointer;
        touch-action: manipulation;
      }

      .fm-field {
        display: block;
        width: 100%;
        min-height: 76px;
        background: #fff;
        color: #111827;
        border: 1px solid #cbd5e1;
        border-radius: 14px;
        padding: 10px;
        font-size: 25px;
        margin-bottom: 12px;
        box-sizing: border-box;
      }

      .fm-tabs {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding: 4px 0 10px;
        margin-bottom: 8px;
        -webkit-overflow-scrolling: touch;
      }

      .fm-tab {
        white-space: nowrap;
        background: #174b91;
        color: #fff;
        border: 0;
        border-radius: 10px;
        padding: 10px 13px;
        font-size: 14px;
        cursor: pointer;
        touch-action: manipulation;
      }

      .fm-tab.active {
        background: #fff;
        color: #0756b8;
        font-weight: 700;
      }

      .fm-keys {
        display: grid;
        grid-template-columns: repeat(4,minmax(0,1fr));
        gap: 7px;
      }

      .fm-key {
        min-height: 54px;
        border: 0;
        border-radius: 11px;
        background: #fff;
        color: #12345a;
        font-size: 17px;
        font-weight: 600;
        padding: 6px;
        overflow: hidden;
        cursor: pointer;
        touch-action: manipulation;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .fm-key:active {
        background: #dbeafe;
        transform: scale(.98);
      }

      .fm-key math-field {
        pointer-events: none;
        border: 0;
        background: transparent;
        min-width: 0;
        font-size: 19px;
      }

      .fm-key.fm-wide {
        background: #dbeafe;
      }

      .fm-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        position: sticky;
        bottom: 0;
        padding-top: 5px;
        background: #0756b8;
      }

      .fm-actions button {
        flex: 1;
        min-height: 48px;
        border: 0;
        border-radius: 11px;
        font-weight: 700;
        font-size: 15px;
        cursor: pointer;
        touch-action: manipulation;
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
        touch-action: manipulation;
      }

      @media(max-width:420px) {
        .fm-panel {
          padding: 11px;
        }

        .fm-field {
          font-size: 21px;
        }

        .fm-key {
          min-height: 49px;
          font-size: 15px;
        }

        .fm-keys {
          grid-template-columns: repeat(4,minmax(0,1fr));
        }
      }
    `;

    document.head.appendChild(style);
  }

  // Formula oynasini yaratish
  function ensureModal() {
    if (modal) return;

    addStyles();

    modal = document.createElement("div");
    modal.className = "fm-backdrop";
    modal.hidden = true;

    modal.innerHTML = `
      <section class="fm-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Formula muharriri">

        <div class="fm-head">
          <span id="fm-title">Formula muharriri</span>
          <button type="button"
            class="fm-close"
            id="fm-close"
            aria-label="Yopish">×</button>
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
      </section>
    `;

    document.body.appendChild(modal);

    mathfield = modal.querySelector("#fm-field");

    modal.querySelector("#fm-close").addEventListener("click", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      close();
    });

    modal.querySelector("#fm-cancel").addEventListener("click", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      close();
    });

    modal.querySelector("#fm-save").addEventListener("click", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      save();
    });

    modal.addEventListener("click", ev => {
      if (ev.target === modal) close();
    });

    modal.addEventListener("keydown", ev => {
      if (ev.key === "Escape") close();
    });
  }

  // Formula kiritish
  function insertValue(value) {
    if (!mathfield) return;

    try {
      mathfield.focus();

      if (typeof mathfield.insert === "function") {
        mathfield.insert(value);
      } else {
        mathfield.executeCommand(["insert", value]);
      }
    } catch (err) {
      mathfield.value = (mathfield.value || "") + value;
    }
  }

  // Tugmada formulani chiroyli ko'rsatish
  function renderKeyLabel(button, latex) {
    const mf = document.createElement("math-field");

    mf.setAttribute("read-only", "");
    mf.setAttribute("virtual-keyboard-mode", "off");
    mf.value = latex;

    button.appendChild(mf);
  }

  // Klaviatura tugmalarini chiqarish
  function renderKeys(keys) {
    const box = modal.querySelector("#fm-keys");
    box.replaceChildren();

    keys.forEach(item => {
      const entry = typeof item === "string"
        ? { label: item, value: item }
        : item;

      const button = document.createElement("button");

      button.type = "button";
      button.className = "fm-key" + (entry.wide ? " fm-wide" : "");
      button.setAttribute("aria-label", entry.label);

      if (entry.action) {
        button.textContent = entry.label;

        button.addEventListener("click", ev => {
          ev.preventDefault();
          ev.stopPropagation();

          if (entry.action === "backspace") {
            try {
              mathfield.executeCommand("deleteBackward");
            } catch (_) {
              mathfield.value = (mathfield.value || "").slice(0, -1);
            }

            mathfield.focus();

          } else if (entry.action === "clear") {
            mathfield.value = "";
            mathfield.focus();
          }
        });

      } else if (entry.render !== false && /[\\^_{}]/.test(entry.value)) {
        renderKeyLabel(button, entry.value);

        button.addEventListener("click", ev => {
          ev.preventDefault();
          ev.stopPropagation();
          insertValue(entry.value);
        });

      } else {
        button.textContent = entry.label;

        button.addEventListener("click", ev => {
          ev.preventDefault();
          ev.stopPropagation();
          insertValue(entry.value);
        });
      }

      box.appendChild(button);
    });
  }

  // Fanlar bo'yicha klaviatura
  function renderBank() {
    const bank = BANKS[activeSubject] || BANKS.matematika;
    const tabsBox = modal.querySelector("#fm-tabs");

    tabsBox.replaceChildren();

    Object.entries(bank.tabs).forEach(([tab, keys], index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "fm-tab" + (index === 0 ? " active" : "");
      button.textContent = tab;

      button.addEventListener("click", ev => {
        ev.preventDefault();
        ev.stopPropagation();

        tabsBox.querySelectorAll(".fm-tab").forEach(el => {
          el.classList.remove("active");
        });

        button.classList.add("active");
        renderKeys(keys);
      });

      tabsBox.appendChild(button);
    });

    const first = Object.values(bank.tabs)[0] || [];

    const utility = [
      {
        label: "⌫",
        value: "",
        action: "backspace"
      },
      {
        label: "Tozalash",
        value: "",
        action: "clear",
        wide: true
      }
    ];

    renderKeys(first.concat(utility));
  }

  // Formula muharririni ochish
  async function open(target, subject) {
    if (!target) return;

    activeTarget = target;

    const selectedSubject = String(subject || "").toLowerCase();

    activeSubject = BANKS[selectedSubject]
      ? selectedSubject
      : "matematika";

    ensureModal();

    modal.hidden = false;

    modal.querySelector("#fm-title").textContent =
      "Formula muharriri — " +
      activeSubject[0].toUpperCase() +
      activeSubject.slice(1);

    try {
      await loadMathLive();

      if (!modal || !activeTarget) return;

      mathfield.value = target.value || "";

      renderBank();

      mathfield.focus();

    } catch (error) {
      alert(error.message || "Formula muharriri yuklanmadi.");
      close();
    }
  }

  // Formulani javob maydoniga saqlash
  function save() {
    if (!activeTarget || !mathfield) {
      close();
      return;
    }

    const latex = typeof mathfield.getValue === "function"
      ? mathfield.getValue("latex")
      : mathfield.value;

    const target = activeTarget;

    target.value = latex || "";

    target.dispatchEvent(
      new Event("input", { bubbles: true })
    );

    target.dispatchEvent(
      new Event("change", { bubbles: true })
    );

    close();
  }

  // Oynani yopish
  function close() {
    if (modal) {
      modal.hidden = true;
    }

    activeTarget = null;
  }

  // Javob maydonlariga formula tugmasini ulash
  function attach(target, subject) {
    if (!target || target.dataset.formulaButtonAttached === "1") {
      return;
    }

    target.dataset.formulaButtonAttached = "1";

    const selectedSubject = String(
      subject || document.body.dataset.subject || "matematika"
    ).toLowerCase();

    function openForTarget(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Oddiy telefon klaviaturasi ochilib ketmasin.
      if (document.activeElement === target) {
        target.blur();
      }

      open(target, selectedSubject);
    }

    // Javob maydonining o'ziga bosilganda formula muharriri ochiladi.
    target.addEventListener("click", openForTarget);

    // ∑ tugmasi ham ishlaydi.
    const button = document.createElement("button");

    button.type = "button";
    button.className = "fm-open";
    button.textContent = "∑";
    button.title = "Formula muharririni ochish";

    button.setAttribute(
      "aria-label",
      "Formula muharririni ochish"
    );

    button.addEventListener("click", openForTarget);

    target.insertAdjacentElement("afterend", button);
  }

  // Tashqi sahifalar foydalanishi uchun
  window.FormulaEditor = {
    open,
    attach,
    banks: BANKS,
    close
  };

})();
