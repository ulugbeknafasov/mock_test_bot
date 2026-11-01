(function () {
  "use strict";

  const ELEMENTS = [
    ["H","Vodorod"],["He","Geliy"],["Li","Litiy"],["Be","Berilliy"],
    ["B","Bor"],["C","Uglerod"],["N","Azot"],["O","Kislorod"],
    ["F","Ftor"],["Ne","Neon"],["Na","Natriy"],["Mg","Magniy"],
    ["Al","Alyuminiy"],["Si","Kremniy"],["P","Fosfor"],["S","Oltingugurt"],
    ["Cl","Xlor"],["Ar","Argon"],["K","Kaliy"],["Ca","Kalsiy"],
    ["Sc","Skandiy"],["Ti","Titan"],["V","Vanadiy"],["Cr","Xrom"],
    ["Mn","Marganes"],["Fe","Temir"],["Co","Kobalt"],["Ni","Nikel"],
    ["Cu","Mis"],["Zn","Rux"],["Ga","Galliy"],["Ge","Germaniy"],
    ["As","Mishyak"],["Se","Selen"],["Br","Brom"],["Kr","Kripton"],
    ["Rb","Rubidiy"],["Sr","Stronsiy"],["Y","Itriy"],["Zr","Sirkoniy"],
    ["Nb","Niobiy"],["Mo","Molibden"],["Tc","Texnetsiy"],["Ru","Ruteniy"],
    ["Rh","Rodiy"],["Pd","Palladiy"],["Ag","Kumush"],["Cd","Kadmiy"],
    ["In","Indiy"],["Sn","Qalay"],["Sb","Surma"],["Te","Tellur"],
    ["I","Yod"],["Xe","Ksenon"],["Cs","Seziy"],["Ba","Bariy"],
    ["La","Lantan"],["Ce","Seriy"],["Pr","Prazeodim"],["Nd","Neodim"],
    ["Pm","Prometiy"],["Sm","Samariy"],["Eu","Yevropiy"],["Gd","Gadoliniy"],
    ["Tb","Terbiy"],["Dy","Disprosiy"],["Ho","Golmiy"],["Er","Erbiy"],
    ["Tm","Tuliy"],["Yb","Itterbiy"],["Lu","Lyutetsiy"],["Hf","Gafniy"],
    ["Ta","Tantal"],["W","Volfram"],["Re","Reniy"],["Os","Osmiy"],
    ["Ir","Iridiy"],["Pt","Platina"],["Au","Oltin"],["Hg","Simob"],
    ["Tl","Talliy"],["Pb","Qo‘rg‘oshin"],["Bi","Vismut"],["Po","Poloniy"],
    ["At","Astat"],["Rn","Radon"],["Fr","Fransiy"],["Ra","Radiy"],
    ["Ac","Aktiniy"],["Th","Toriy"],["Pa","Protaktiniy"],["U","Uran"],
    ["Np","Neptuniy"],["Pu","Plutoniy"],["Am","Ameritsiy"],["Cm","Kyuriy"],
    ["Bk","Berkliy"],["Cf","Kaliforniy"],["Es","Eynshteyniy"],["Fm","Fermiy"],
    ["Md","Mendeleviy"],["No","Nobeliy"],["Lr","Lourensiy"],["Rf","Rezerfordiy"],
    ["Db","Dubniy"],["Sg","Seaborgiy"],["Bh","Boriy"],["Hs","Hassiy"],
    ["Mt","Meytneriy"],["Ds","Darmshtadtiy"],["Rg","Rentgeniy"],["Cn","Kopernitsiy"],
    ["Nh","Nihoniy"],["Fl","Fleroviy"],["Mc","Moskoviy"],["Lv","Livermoriy"],
    ["Ts","Tennessin"],["Og","Oganesson"]
  ];

  const SUPER = ["⁰","¹","²","³","⁴","⁵","⁶","⁷","⁸","⁹","⁺","⁻"];
  const SUB = ["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉"];

  const ELEMENT_KEYS = ELEMENTS.map(([symbol, name]) => ({
    label: symbol,
    value: symbol,
    hint: name
  }));

  const CHEM_TABS = {
    kimyo: [
      {
        title: "Daraja / zaryad",
        items: [
          ...SUPER.map(v => ({label:v,value:v})),
          {label:"e⁻",value:"e⁻"},
          {label:"·",value:"·"}
        ]
      },
      {
        title: "Pastki indeks",
        items: [
          ...SUB.map(v => ({label:v,value:v})),
          {label:"( )",value:"()"}
        ]
      },
      {
        title: "Reaksiya / holat",
        items: [
          "→","⇌","↑","↓","Δ","°"," + "," = ","(s)","(l)","(g)","(aq)"
        ].map(v => ({label:v,value:v}))
      },
      {
        title: "Elementlar",
        items: ELEMENT_KEYS
      },
      {
        title: "Ionlar",
        items: [
          "H⁺","OH⁻","Na⁺","K⁺","Ca²⁺","Mg²⁺",
          "Al³⁺","Fe²⁺","Fe³⁺","Cu²⁺","Cl⁻",
          "SO₄²⁻","NO₃⁻","CO₃²⁻","PO₄³⁻","NH₄⁺"
        ].map(v => ({label:v,value:v}))
      }
    ],

    biologiya: [
      {
        title: "Genetika",
        items: [
          "♀","♂","P","F₁","F₂","F₃","G","×","→",
          "⇌","Aa","AA","aa","Xᴬ","Xᵃ","Y"
        ].map(v => ({label:v,value:v}))
      },
      {
        title: "Biologik belgilar",
        items: [
          "DNA","RNA","mRNA","tRNA","ATP","ADP",
          "NAD","NADP","CO₂","O₂","H₂O",
          "C₆H₁₂O₆","pH","%"
        ].map(v => ({label:v,value:v}))
      },
      {
        title: "Daraja / indeks",
        items: [...SUPER,...SUB].map(v => ({label:v,value:v}))
      },
      {
        title: "Elementlar",
        items: ELEMENT_KEYS
      }
    ]
  };

  let activeTarget = null;
  let activeSubject = "matematika";
  let activeTab = 0;
  let modal = null;
  let mathfield = null;
  let textEditor = null;
  let loadPromise = null;
  let openToken = 0;

  const isMath = () =>
    activeSubject === "matematika" || activeSubject === "fizika";

  function loadMathLive() {
    if (customElements.get("math-field")) {
      return Promise.resolve();
    }

    if (loadPromise) return loadPromise;

    loadPromise = new Promise((resolve, reject) => {
      let script = document.querySelector('script[src*="mathlive"]');

      const ready = () =>
        customElements.whenDefined("math-field").then(resolve,reject);

      if (script) {
        script.addEventListener("load",ready,{once:true});

        script.addEventListener("error",() => {
          reject(new Error("MathLive yuklanmadi."));
        },{once:true});

        const timer = setInterval(() => {
          if (customElements.get("math-field")) {
            clearInterval(timer);
            resolve();
          }
        },100);

        setTimeout(() => {
          clearInterval(timer);

          if (!customElements.get("math-field")) {
            reject(new Error("MathLive yuklanmadi. Internetni tekshiring."));
          }
        },12000);

      } else {
        script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/mathlive";

        script.onload = ready;

        script.onerror = () => {
          reject(new Error("MathLive kutubxonasi yuklanmadi."));
        };

        document.head.appendChild(script);
      }
    }).catch(err => {
      loadPromise = null;
      throw err;
    });

    return loadPromise;
  }

  function addStyles() {
    if (document.getElementById("formula-editor-styles")) return;

    const style = document.createElement("style");
    style.id = "formula-editor-styles";

    style.textContent = `
      .fm-backdrop {
        position:fixed;
        inset:0;
        z-index:2147483000;
        background:#07111dcc;
        display:flex;
        align-items:flex-end;
        justify-content:center;
        padding:5px;
        box-sizing:border-box
      }

      .fm-backdrop[hidden] {
        display:none!important
      }

      .fm-panel {
        width:min(680px,100%);
        max-height:96dvh;
        overflow:auto;
        background:#101b2e;
        color:#f8fafc;
        border:1px solid #334155;
        border-radius:18px;
        padding:13px;
        box-sizing:border-box;
        font-family:Arial,sans-serif;
        box-shadow:0 18px 55px #0009
      }

      .fm-head {
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin-bottom:10px;
        font-size:16px;
        font-weight:700
      }

      .fm-close {
        width:34px;
        height:34px;
        border:0;
        border-radius:9px;
        background:#334155;
        color:white;
        font-size:22px
      }

      .fm-field,.fm-textarea {
        display:block;
        width:100%;
        min-height:62px;
        box-sizing:border-box;
        border:1px solid #475569;
        border-radius:11px;
        background:white;
        color:#111827;
        padding:10px;
        font-size:23px;
        margin-bottom:10px
      }

      .fm-textarea {
        min-height:70px;
        resize:vertical;
        font-family:Arial,sans-serif;
        font-size:22px;
        line-height:1.5
      }

      .fm-hint {
        font-size:11px;
        color:#94a3b8;
        margin:-3px 0 9px
      }

      .fm-tabs {
        display:flex;
        gap:6px;
        overflow-x:auto;
        padding:2px 0 9px;
        border-bottom:1px solid #334155;
        margin-bottom:8px
      }

      .fm-tab {
        white-space:nowrap;
        flex:0 0 auto;
        border:0;
        border-radius:8px;
        padding:8px 11px;
        background:#243249;
        color:#cbd5e1;
        font-size:12px;
        font-weight:700
      }

      .fm-tab.active {
        background:#0284c7;
        color:white
      }

      .fm-keys {
        display:grid;
        grid-template-columns:repeat(8,minmax(0,1fr));
        gap:5px
      }

      .fm-key {
        min-width:0;
        min-height:39px;
        border:1px solid #3b4b63;
        border-radius:8px;
        background:#243249;
        color:#f8fafc;
        font-size:15px;
        font-weight:700;
        padding:4px;
        touch-action:manipulation;
        overflow:hidden
      }

      .fm-key small {
        display:block;
        font-size:9px;
        color:#94a3b8;
        font-weight:400
      }

      .fm-tools,.fm-actions {
        display:flex;
        gap:7px;
        margin-top:10px
      }

      .fm-tools button,.fm-actions button {
        flex:1;
        min-height:40px;
        border:0;
        border-radius:9px;
        font-weight:700;
        font-size:13px
      }

      .fm-tools button {
        background:#334155;
        color:white
      }

      .fm-cancel {
        background:#475569;
        color:white
      }

      .fm-save {
        background:#059669;
        color:white
      }

      .fm-open {
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-width:38px;
        height:38px;
        margin-left:5px;
        border:0;
        border-radius:9px;
        background:#e0f2fe;
        color:#0369a1;
        font-weight:800;
        cursor:pointer
      }

      @media(max-width:430px) {
        .fm-keys {
          grid-template-columns:repeat(6,minmax(0,1fr))
        }

        .fm-panel {
          padding:10px
        }

        .fm-key {
          min-height:42px
        }
      }
    `;

    document.head.appendChild(style);
  }

  function ensureModal() {
    if (modal) return;

    addStyles();

    modal = document.createElement("div");
    modal.className = "fm-backdrop";
    modal.hidden = true;

    modal.innerHTML = `
      <section class="fm-panel" role="dialog" aria-modal="true" aria-label="Formula muharriri">

        <div class="fm-head">
          <span id="fm-title">Formula muharriri</span>
          <button type="button" class="fm-close" id="fm-close">×</button>
        </div>

        <math-field
          id="fm-math"
          class="fm-field"
          virtual-keyboard-mode="onfocus"
          smart-fence="true"
          smart-superscript="true">
        </math-field>

        <textarea
          id="fm-text"
          class="fm-textarea"
          spellcheck="false"
          hidden>
        </textarea>

        <div class="fm-hint" id="fm-hint"></div>

        <div class="fm-tabs" id="fm-tabs"></div>
        <div id="fm-keys"></div>

        <div class="fm-tools">
          <button type="button" id="fm-back">⌫ O‘chirish</button>
          <button type="button" id="fm-clear">Tozalash</button>
        </div>

        <div class="fm-actions">
          <button type="button" class="fm-cancel" id="fm-cancel">Bekor qilish</button>
          <button type="button" class="fm-save" id="fm-save">Tayyor ✓</button>
        </div>

      </section>
    `;

    document.body.appendChild(modal);

    mathfield = modal.querySelector("#fm-math");
    textEditor = modal.querySelector("#fm-text");

    modal.querySelector("#fm-close").addEventListener("click",close);
    modal.querySelector("#fm-cancel").addEventListener("click",close);
    modal.querySelector("#fm-save").addEventListener("click",save);
    modal.querySelector("#fm-back").addEventListener("click",backspace);

    modal.querySelector("#fm-clear").addEventListener("click",() => {
      if (isMath()) {
        mathfield.value = "";
        mathfield.focus();
      } else {
        textEditor.value = "";
        textEditor.focus();
      }
    });

    modal.addEventListener("click",e => {
      if (e.target === modal) close();
    });
  }

  function insertText(value) {
    const start = textEditor.selectionStart ?? textEditor.value.length;
    const end = textEditor.selectionEnd ?? start;

    textEditor.setRangeText(value,start,end,"end");
    textEditor.focus();
  }

  function backspace() {
    if (isMath()) {
      try {
        mathfield.executeCommand("deleteBackward");
      } catch (_) {}

      mathfield.focus();

    } else {
      const start = textEditor.selectionStart;
      const end = textEditor.selectionEnd;

      if (start !== end) {
        textEditor.setRangeText("",start,end,"end");
      } else if (start > 0) {
        textEditor.setRangeText("",start-1,start,"end");
      }

      textEditor.focus();
    }
  }

  function renderChemKeyboard() {
    const tabs = CHEM_TABS[activeSubject] || CHEM_TABS.kimyo;

    const tabBox = modal.querySelector("#fm-tabs");
    const keysBox = modal.querySelector("#fm-keys");

    tabBox.replaceChildren();
    keysBox.replaceChildren();

    tabs.forEach((tab,index) => {
      const b = document.createElement("button");

      b.type = "button";
      b.className = "fm-tab" + (index === activeTab ? " active" : "");
      b.textContent = tab.title;

      b.addEventListener("click",() => {
        activeTab = index;
        renderChemKeyboard();
      });

      tabBox.appendChild(b);
    });

    const grid = document.createElement("div");
    grid.className = "fm-keys";

    (tabs[activeTab]?.items || []).forEach(item => {
      const b = document.createElement("button");

      b.type = "button";
      b.className = "fm-key";
      b.textContent = item.label;

      b.setAttribute(
        "aria-label",
        item.hint ? item.label + " " + item.hint : item.label
      );

      if (item.hint) {
        const small = document.createElement("small");
        small.textContent = item.hint;
        b.appendChild(small);
      }

      b.addEventListener("click",() => insertText(item.value));

      grid.appendChild(b);
    });

    keysBox.appendChild(grid);
  }

  async function open(target,subject) {
    if (!target) return;

    const token = ++openToken;
    activeTarget = target;

    const key = String(subject || "matematika").toLowerCase();

    activeSubject =
      key === "kimyo_biologiya"
        ? "kimyo"
        : (
            CHEM_TABS[key] ||
            key === "fizika" ||
            key === "matematika"
              ? key
              : "matematika"
          );

    activeTab = 0;

    ensureModal();
    modal.hidden = false;

    const mathMode = isMath();

    mathfield.hidden = !mathMode;
    textEditor.hidden = mathMode;

    modal.querySelector("#fm-title").textContent = mathMode
      ? (
          activeSubject === "fizika"
            ? "Fizika — MathLive klaviaturasi"
            : "Matematika — MathLive klaviaturasi"
        )
      : (
          activeSubject === "biologiya"
            ? "Biologiya — maxsus klaviatura"
            : "Kimyo — ChemKey uslubidagi klaviatura"
        );

    modal.querySelector("#fm-hint").textContent = mathMode
      ? "MathLive klaviaturasidan raqamlar, belgilar, harflar va yunon harflarini tanlang."
      : "Unicode belgilar kiritiladi. Masalan: H₂SO₄, Fe³⁺, F₁.";

    modal.querySelector("#fm-tabs").hidden = mathMode;
    modal.querySelector("#fm-keys").hidden = mathMode;

    if (!mathMode) {
      textEditor.value = target.value || "";
      renderChemKeyboard();
      textEditor.focus();
      return;
    }

    try {
      await loadMathLive();

      if (token !== openToken || !activeTarget || !modal) return;

      mathfield.value = target.value || "";

      if (window.mathVirtualKeyboard) {
        window.mathVirtualKeyboard.layouts = [
          "numeric",
          "symbols",
          "alphabetic",
          "greek"
        ];
      }

      mathfield.focus();

      if (window.mathVirtualKeyboard?.show) {
        window.mathVirtualKeyboard.show();
      }

    } catch (error) {
      alert(error.message || "MathLive yuklanmadi.");
      close();
    }
  }

  function save() {
    if (!activeTarget) return close();

    const value = isMath()
      ? (
          typeof mathfield.getValue === "function"
            ? mathfield.getValue("latex")
            : mathfield.value
        )
      : textEditor.value;

    activeTarget.value = value || "";

    activeTarget.dispatchEvent(
      new Event("input",{bubbles:true})
    );

    activeTarget.dispatchEvent(
      new Event("change",{bubbles:true})
    );

    close();
  }

  function close() {
    ++openToken;

    try {
      if (window.mathVirtualKeyboard?.hide) {
        window.mathVirtualKeyboard.hide();
      }
    } catch (_) {}

    if (modal) modal.hidden = true;

    activeTarget = null;
  }

  // JAVOB MAYDONI BOSILGANDA KLAVIATURANI OCHISH
  function attach(target,subject) {
    if (!target || target.dataset.formulaButtonAttached === "1") {
      return;
    }

    target.dataset.formulaButtonAttached = "1";

    const selected = String(subject || "matematika").toLowerCase();

    // Eski funksiyani qaytardik:
    // javob yozish qatori bosilganda muharrir ochiladi.
    function openForTarget(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      open(target,selected);
    }

    // Javob maydonini bosganda ochiladi.
    target.addEventListener("click",openForTarget);

    // Qo‘shimcha ∑ tugmasi.
    const button = document.createElement("button");

    button.type = "button";
    button.className = "fm-open";
    button.textContent = "∑";
    button.title = "Formula klaviaturasini ochish";

    button.addEventListener("click",openForTarget);

    target.insertAdjacentElement("afterend",button);
  }

  window.FormulaEditor = {
    open,
    attach,
    banks: CHEM_TABS,
    close
  };

})();
