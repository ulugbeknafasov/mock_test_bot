
(function () {
  "use strict";

  let activeTarget = null;
  let activeSubject = "matematika";
  let modal = null;
  let editor = null;
  let mathLivePromise = null;

  // =========================================
  // 1. RAQAMLAR
  // =========================================

  const NUMBERS = "0123456789".split("").map(x => ({
    label: x,
    value: x
  }));

  // =========================================
  // 2. MATEMATIK HARFLAR
  // =========================================

  const LETTERS = (
    "abcdefghijklmnopqrstuvwxyz" +
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  ).split("").map(x => ({
    label: x,
    value: x
  }));

  const GREEK = (
    "α β γ δ ε ζ η θ ι κ λ μ ν ξ π ρ σ τ υ φ χ ψ ω " +
    "Γ Δ Θ Λ Ξ Π Σ Φ Ψ Ω"
  ).split(" ").map(x => ({
    label: x,
    value: x
  }));

  // =========================================
  // 3. ASOSIY MATEMATIK BELGILAR
  // =========================================

  const BASIC = [
    ["+", "+"], ["−", "-"], ["×", "\\times"],
    ["÷", "\\div"], ["=", "="], ["≠", "\\ne"],
    ["≈", "\\approx"], ["±", "\\pm"], ["∓", "\\mp"],
    ["<", "<"], [">", ">"], ["≤", "\\le"],
    ["≥", "\\ge"], ["∞", "\\infty"], ["π", "\\pi"],
    ["%", "\\%"], ["°", "^\\circ"],
    ["(", "("], [")", ")"], ["[", "["], ["]", "]"],
    ["{", "\\{"], ["}", "\\}"], [",", ","],
    [".", "."], [":", ":"], [";", ";"],
    ["|", "|"], ["!", "!"]
  ];

  // =========================================
  // 4. MATEMATIK FUNKSIYALAR
  // =========================================

  const FUNCTIONS = [
    ["sin", "\\sin"],
    ["cos", "\\cos"],
    ["tg", "\\tan"],
    ["ctg", "\\cot"],
    ["tan", "\\tan"],
    ["cot", "\\cot"],
    ["sec", "\\sec"],
    ["csc", "\\csc"],
    ["arcsin", "\\arcsin"],
    ["arccos", "\\arccos"],
    ["arctg", "\\arctan"],
    ["log", "\\log"],
    ["ln", "\\ln"],
    ["lg", "\\log"],
    ["lim", "\\lim"],
    ["max", "\\max"],
    ["min", "\\min"],
    ["sup", "\\sup"],
    ["inf", "\\inf"],
    ["det", "\\det"]
  ];

  // =========================================
  // 5. MATEMATIK STRUKTURALAR
  // =========================================

  const STRUCTURE_ROWS = [
    [
      {
        label: "Kasr",
        latex: "\\frac{#@}{#?}",
        tooltip: "Surat va maxrajli kasr"
      },
      {
        label: "Ildiz",
        latex: "\\sqrt{#0}",
        tooltip: "Kvadrat ildiz"
      },
      {
        label: "n-ildiz",
        latex: "\\sqrt[#?]{#0}",
        tooltip: "Darajali ildiz"
      },
      {
        label: "Daraja",
        latex: "{#@}^{#?}",
        tooltip: "Yuqori daraja"
      },
      {
        label: "Indeks",
        latex: "{#@}_{#?}",
        tooltip: "Pastki indeks"
      }
    ],
    [
      "\\sum_{#?}^{#?}",
      "\\prod_{#?}^{#?}",
      "\\int_{#?}^{#?}",
      "\\iint",
      "\\oint"
    ],
    [
      "\\lim_{x\\to #?}",
      "\\frac{d}{dx}",
      "\\partial",
      "\\nabla",
      "\\infty"
    ],
    [
      "\\left(#0\\right)",
      "\\left|#0\\right|",
      "\\left\\{#0\\right\\}",
      "\\left[#0\\right]",
      "\\sqrt[3]{#0}"
    ],
    [
      "\\binom{#?}{#?}",
      "\\overline{#0}",
      "\\vec{#0}",
      "\\hat{#0}",
      "\\dot{#0}"
    ],
    [
      "\\begin{matrix}#@&#?\\\\#?&#?\\end{matrix}",
      "\\begin{cases}#@\\\\#?\\end{cases}",
      "\\begin{pmatrix}#@&#?\\\\#?&#?\\end{pmatrix}"
    ]
  ];

  // =========================================
  // 6. QO'SHIMCHA BELGILAR
  // =========================================

  const ADVANCED_SYMBOLS = [
    "\\sum", "\\prod", "\\int", "\\iint",
    "\\iiint", "\\oint", "\\partial", "\\nabla",
    "\\in", "\\notin", "\\subset", "\\subseteq",
    "\\supset", "\\supseteq", "\\cup", "\\cap",
    "\\emptyset", "\\forall", "\\exists",
    "\\Rightarrow", "\\Leftrightarrow",
    "\\perp", "\\parallel", "\\angle",
    "\\therefore", "\\because", "\\propto",
    "\\equiv", "\\cong", "\\sim",
    "\\oplus", "\\otimes", "\\circ",
    "\\vdots", "\\cdots", "\\ldots"
  ];

  // =========================================
  // 7. FIZIKA BELGILARI
  // =========================================

  const PHYSICS_SYMBOLS = [
    "F", "m", "a", "s", "v", "t", "g",
    "P", "A", "E", "W", "N", "p", "ρ",
    "μ", "λ", "T", "Q", "I", "R", "q",
    "C", "B", "U", "J", "k", "h", "c",
    "V", "f", "ω", "α", "β", "Δ",
    "η", "φ", "ε", "σ", "τ", "γ"
  ];

  // =========================================
  // 8. KIMYO VA BIOLOGIYA
  // AVVALGI UNICODE KLAVIATURALARI
  // =========================================

  const INDEX = [
    ..."⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻"
  ].map(x => ({ label:x, value:x }))
  .concat(
    [..."₀₁₂₃₄₅₆₇₈₉"].map(x => ({
      label:x,
      value:x
    }))
  );

  const ELEMENTS = (
    "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca " +
    "Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr " +
    "Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe " +
    "Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu " +
    "Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn " +
    "Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr " +
    "Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og"
  ).split(" ").map(x => ({
    label:x,
    value:x
  }));

  const IONS = [
    "H⁺", "OH⁻", "Na⁺", "K⁺", "Ag⁺",
    "Ca²⁺", "Mg²⁺", "Ba²⁺", "Zn²⁺",
    "Cu²⁺", "Fe²⁺", "Fe³⁺", "Al³⁺",
    "Cl⁻", "Br⁻", "I⁻", "NO₃⁻",
    "SO₄²⁻", "SO₃²⁻", "CO₃²⁻",
    "HCO₃⁻", "PO₄³⁻", "NH₄⁺",
    "MnO₄⁻", "Cr₂O₇²⁻"
  ].map(x => ({
    label:x,
    value:x
  }));

  const CHEMICAL = [
    "→", "⇌", "↔", "↑", "↓", "Δ", "°", "·",
    "+", "−", "=", "(s)", "(l)", "(g)",
    "(aq)", "e⁻", "hν", "t°"
  ].map(x => ({
    label:x,
    value:x
  }));

  const BIOLOGY = [
    "♀", "♂", "×", "F₁", "F₂", "P",
    "DNA", "RNA", "mRNA", "tRNA",
    "ATP", "ADP", "NAD", "NADH",
    "O₂", "CO₂", "H₂O", "α", "β", "γ",
    "Δ", "→", "↔", "↑", "↓",
    "Aa", "AA", "aa", "Xᴬ", "Xᵃ",
    "Y", "XX", "XY", "n", "2n",
    "G₁", "G₂"
  ].map(x => ({
    label:x,
    value:x
  }));

  // =========================================
  // 9. KLAVIATURA BO'LIMLARI
  // =========================================

  const BANKS = {
    matematika: {
      "1. Raqamlar": NUMBERS,
      "2. Harflar": LETTERS,
      "3. Asosiy amallar": BASIC,
      "4. Kasr, ildiz, daraja va indeks": STRUCTURE_ROWS,
      "5. Trigonometriya va funksiyalar": FUNCTIONS,
      "6. Matematik belgilar": ADVANCED_SYMBOLS,
      "7. Yunon harflari": GREEK
    },

    fizika: {
      "1. Raqamlar": NUMBERS,
      "2. Harflar": LETTERS,
      "3. Asosiy amallar": BASIC,
      "4. Kasr, ildiz, daraja va indeks": STRUCTURE_ROWS,
      "5. Matematik funksiyalar": FUNCTIONS,
      "6. Fizik belgilar": PHYSICS_SYMBOLS,
      "7. Yunon harflari": GREEK
    },

    kimyo: {
      "1. Raqamlar": NUMBERS,
      "2. Elementlar": ELEMENTS,
      "3. Yuqori va pastki indekslar": INDEX,
      "4. Ionlar": IONS,
      "5. Reaksiya va amallar": CHEMICAL
    },

    biologiya: {
      "1. Raqamlar": NUMBERS,
      "2. Biologik belgilar": BIOLOGY,
      "3. Yuqori va pastki indekslar": INDEX,
      "4. Elementlar": ELEMENTS
    }
  };

  // =========================================
  // 10. MATHLIVE YUKLASH
  // =========================================

  function loadMathLive() {
    if (customElements.get("math-field")) {
      return Promise.resolve();
    }

    if (mathLivePromise) return mathLivePromise;

    mathLivePromise = new Promise((resolve,reject) => {
      const script = document.createElement("script");

      script.src = "https://cdn.jsdelivr.net/npm/mathlive";
      script.onload = () => resolve();
      script.onerror = () => {
        mathLivePromise = null;
        reject(new Error("MathLive yuklanmadi."));
      };

      document.head.appendChild(script);
    });

    return mathLivePromise;
  }

  // =========================================
  // 11. MATHLIVE VIRTUAL KEYBOARD
  // =========================================

  function createMathLayouts(subject) {
    const structures = {
      label: "Kasr va formulalar",
      tooltip: "Kasr, ildiz, daraja va boshqa formulalar",
      rows: STRUCTURE_ROWS
    };

    const functionLayout = {
      label: "Funksiyalar",
      tooltip: "Matematik funksiyalar",
      rows: [
        ["\\sin", "\\cos", "\\tan", "\\cot", "\\sec", "\\csc"],
        ["\\arcsin", "\\arccos", "\\arctan", "\\log", "\\ln", "\\exp"],
        ["\\lim", "\\max", "\\min", "\\sup", "\\inf", "\\det"],
        ["\\sinh", "\\cosh", "\\tanh", "\\gcd", "\\mod", "\\arg"]
      ]
    };

    const layouts = [
      "numeric",
      "symbols",
      functionLayout,
      "alphabetic",
      "greek",
      structures
    ];

    if (subject === "fizika") {
      layouts.push({
        label: "Fizika",
        tooltip: "Fizik kattaliklar va belgilar",
        rows: [
          ["F", "m", "a", "s", "v", "t", "g"],
          ["P", "A", "E", "W", "N", "p", "ρ"],
          ["μ", "λ", "T", "Q", "I", "R", "q"],
          ["C", "B", "U", "J", "k", "h", "c"],
          ["V", "f", "ω", "α", "β", "Δ", "η"],
          ["φ", "ε", "σ", "τ", "γ", "\\Omega"]
        ]
      });
    }

    return layouts;
  }

  function configureMathKeyboard(subject) {
    const vk = window.mathVirtualKeyboard;

    if (!vk) {
      throw new Error("MathLive virtual keyboard topilmadi.");
    }

    vk.layouts = createMathLayouts(subject);
    vk.editToolbar = "default";
    vk.container = document.body;
    vk.alphabeticLayout = "qwerty";
  }

  // =========================================
  // 12. DIZAYN
  // =========================================

  function addStyles() {
    if (document.getElementById("formula-editor-styles")) return;

    const style = document.createElement("style");
    style.id = "formula-editor-styles";

    style.textContent = `
      .fm-backdrop {
        position:fixed;
        inset:0;
        z-index:2147483000;
        background:rgba(8,13,25,.76);
        display:flex;
        align-items:flex-end;
        justify-content:center;
        padding:4px;
        box-sizing:border-box;
      }

      .fm-backdrop[hidden] {
        display:none!important;
      }

      .fm-panel {
        width:min(600px,100%);
        max-height:94dvh;
        overflow-y:auto;
        background:#0756b8;
        color:white;
        border-radius:14px;
        padding:10px;
        box-sizing:border-box;
      }

      .fm-head {
        display:flex;
        justify-content:space-between;
        align-items:center;
        font-weight:bold;
        margin-bottom:9px;
      }

      .fm-close {
        width:34px;
        height:34px;
        border:0;
        border-radius:50%;
        background:#ffffff22;
        color:white;
        font-size:22px;
      }

      .fm-field {
        display:block;
        width:100%;
        min-height:100px;
        background:white;
        color:#111827;
        border-radius:8px;
        padding:10px;
        font-size:24px;
        margin-bottom:9px;
        box-sizing:border-box;
        border:none;
      }

      math-field.fm-field {
        --hue: 210;
        --primary: #0756b8;
        --selection-background-color: #bfdbfe;
        --contains-highlight-background-color: #dbeafe;
      }

      .fm-section {
        margin:9px 0;
      }

      .fm-section-title {
        font-size:13px;
        font-weight:bold;
        padding:6px 2px;
        border-bottom:1px solid #ffffff44;
        margin-bottom:6px;
      }

      .fm-grid {
        display:flex;
        flex-wrap:wrap;
        gap:4px;
      }

      .fm-number-grid {
        display:grid;
        grid-template-columns:repeat(5,minmax(0,1fr));
        gap:5px;
      }

      .fm-element-grid {
        display:grid;
        grid-template-columns:repeat(8,minmax(0,1fr));
        gap:4px;
      }

      .fm-key {
        min-height:40px;
        min-width:38px;
        border:0;
        border-radius:5px;
        background:white;
        color:#0756b8;
        font-size:15px;
        font-weight:bold;
        padding:5px;
        cursor:pointer;
        touch-action:manipulation;
      }

      .fm-number-grid .fm-key {
        min-height:45px;
        font-size:20px;
      }

      .fm-key:active {
        background:#bfdbfe;
        transform:scale(.96);
      }

      .fm-fixed-tools,.fm-actions {
        display:flex;
        gap:6px;
        margin-top:7px;
      }

      .fm-fixed-tools button,.fm-actions button {
        flex:1;
        min-height:40px;
        border:0;
        border-radius:6px;
        font-weight:bold;
        cursor:pointer;
      }

      .fm-fixed-tools button {
        background:#1e3a8a;
        color:white;
      }

      .fm-cancel {
        background:#334155;
        color:white;
      }

      .fm-save {
        background:#0f9f82;
        color:white;
      }

      .fm-open {
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-width:36px;
        height:36px;
        margin-left:4px;
        border:0;
        border-radius:6px;
        background:#e0f2fe;
        color:#075985;
        font-weight:bold;
        cursor:pointer;
      }

      math-virtual-keyboard {
        z-index:2147483001!important;
      }
    `;

    document.head.appendChild(style);
  }

  // =========================================
  // 13. MODAL YARATISH
  // =========================================

  function ensureModal() {
    if (modal) return;

    addStyles();

    modal = document.createElement("div");
    modal.className = "fm-backdrop";
    modal.hidden = true;

    modal.innerHTML = `
      <section class="fm-panel" role="dialog" aria-modal="true">

        <div class="fm-head">
          <span id="fm-title">Formula muharriri</span>
          <button type="button" class="fm-close" id="fm-close">×</button>
        </div>

        <div id="fm-editor"></div>

        <div id="fm-sections"></div>

        <div class="fm-fixed-tools">
          <button type="button" id="fm-backspace">⌫ O'chirish</button>
          <button type="button" id="fm-clear">C Tozalash</button>
        </div>

        <div class="fm-actions">
          <button type="button" class="fm-cancel" id="fm-cancel">
            Bekor qilish
          </button>
          <button type="button" class="fm-save" id="fm-save">
            Tayyor ✓
          </button>
        </div>

      </section>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#fm-close")
      .addEventListener("click",close);

    modal.querySelector("#fm-cancel")
      .addEventListener("click",close);

    modal.querySelector("#fm-save")
      .addEventListener("click",save);

    modal.querySelector("#fm-clear")
      .addEventListener("click",() => {
        if (
          activeSubject === "matematika" ||
          activeSubject === "fizika"
        ) {
          editor.setValue("");
          editor.focus();
        } else {
          editor.value = "";
          editor.focus();
        }
      });

    modal.querySelector("#fm-backspace")
      .addEventListener("click",() => {
        if (
          activeSubject === "matematika" ||
          activeSubject === "fizika"
        ) {
          editor.executeCommand("deleteBackward");
          editor.focus();
        } else {
          const start = editor.selectionStart;
          const end = editor.selectionEnd;

          if (start !== end) {
            editor.setRangeText("",start,end,"end");
          } else if (start > 0) {
            editor.setRangeText("",start-1,start,"end");
          }

          editor.focus();
        }
      });

    modal.addEventListener("click",ev => {
      if (ev.target === modal) close();
    });
  }

  // =========================================
  // 14. MATEMATIK MUHARRIR
  // =========================================

  async function setupMathEditor() {
    await loadMathLive();

    const host = modal.querySelector("#fm-editor");
    host.replaceChildren();

    editor = document.createElement("math-field");
    editor.className = "fm-field";

    editor.setAttribute(
      "math-virtual-keyboard-policy",
      "manual"
    );

    editor.mathVirtualKeyboardPolicy = "manual";

    host.appendChild(editor);

    configureMathKeyboard(activeSubject);

    editor.addEventListener("focusin",() => {
      configureMathKeyboard(activeSubject);
      window.mathVirtualKeyboard.show();
    });

    editor.addEventListener("click",() => {
      window.mathVirtualKeyboard.show();
    });

    editor.focus();
    window.mathVirtualKeyboard.show();
  }

  // =========================================
  // 15. KIMYO VA BIOLOGIYA MUHARRIRI
  // =========================================

  function setupUnicodeEditor() {
    const host = modal.querySelector("#fm-editor");
    host.replaceChildren();

    editor = document.createElement("textarea");
    editor.className = "fm-field";
    editor.placeholder = "Javobingizni kiriting...";
    editor.spellcheck = false;

    host.appendChild(editor);
  }

  // =========================================
  // 16. UNICODE BELGILARINI KIRITISH
  // =========================================

  function insertUnicode(value) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    editor.setRangeText(value,start,end,"end");
    editor.focus();
  }

  // =========================================
  // 17. KLAVIATURA BO'LIMLARINI CHIZISH
  // =========================================

  function renderBank() {
    const container = modal.querySelector("#fm-sections");
    container.replaceChildren();

    Object.entries(BANKS[activeSubject]).forEach(
      ([title,items],index) => {

        const section = document.createElement("section");
        section.className = "fm-section";

        const heading = document.createElement("div");
        heading.className = "fm-section-title";
        heading.textContent = title;

        section.appendChild(heading);

        const grid = document.createElement("div");

        grid.className =
          index === 0 ? "fm-number-grid" :
          title.includes("Elementlar") ? "fm-element-grid" :
          "fm-grid";

        items.forEach(item => {
          // Matematika va fizikada MathLive virtual
          // klaviaturasi ishlatiladi.
          // Kimyo va biologiya Unicode tugmalari ishlaydi.

          const label =
            typeof item === "string" ? item :
            item.label;

          const value =
            typeof item === "string" ? item :
            item.value;

          const button = document.createElement("button");
          button.type = "button";
          button.className = "fm-key";
          button.textContent = label;

          button.addEventListener("click",ev => {
            ev.preventDefault();

            if (
              activeSubject === "matematika" ||
              activeSubject === "fizika"
            ) {
              editor.focus();

              if (typeof value === "string") {
                editor.insert(value);
              }
            } else {
              insertUnicode(value);
            }
          });

          grid.appendChild(button);
        });

        section.appendChild(grid);
        container.appendChild(section);
      }
    );
  }

  // =========================================
  // 18. MUHARRIRNI OCHISH
  // =========================================

  async function open(target,subject) {
    if (!target) return;

    activeTarget = target;

    const aliases = {
      math:"matematika",
      mathematics:"matematika",
      physics:"fizika",
      chemistry:"kimyo",
      biology:"biologiya"
    };

    let key = String(subject || "matematika")
      .toLowerCase()
      .trim();

    key = aliases[key] || key;

    activeSubject = BANKS[key] ? key : "matematika";

    ensureModal();

    const titles = {
      matematika:"Matematika — Formula muharriri",
      fizika:"Fizika — Formula muharriri",
      kimyo:"Kimyo — Unicode klaviatura",
      biologiya:"Biologiya — Unicode klaviatura"
    };

    modal.querySelector("#fm-title").textContent =
      titles[activeSubject];

    modal.hidden = false;

    try {
      if (
        activeSubject === "matematika" ||
        activeSubject === "fizika"
      ) {
        await setupMathEditor();

        const oldValue = target.value || "";

        if (oldValue.startsWith("MATHJSON:")) {
          const data = JSON.parse(oldValue.slice(9));

          editor.setValue(data,"math-json");
        } else if (oldValue.trim()) {
          editor.value = oldValue;
        }

      } else {
        setupUnicodeEditor();
        editor.value = target.value || "";
      }

      renderBank();

      editor.focus();

    } catch(error) {
      console.error(error);
      alert(
        "Formula muharririni ochishda xatolik: " +
        (error.message || error)
      );

      close();
    }
  }

  // =========================================
  // 19. JAVOBNI SAQLASH
  // =========================================

  function save() {
    if (!activeTarget || !editor) {
      close();
      return;
    }

    if (
      activeSubject === "matematika" ||
      activeSubject === "fizika"
    ) {
      // LaTeX emas: MathJSON formatida saqlanadi.
      const mathJSON = editor.getValue("math-json");

      activeTarget.value =
        "MATHJSON:" + JSON.stringify(mathJSON);

    } else {
      // Kimyo va biologiya o'z holicha qoladi.
      activeTarget.value = editor.value;
    }

    activeTarget.dispatchEvent(
      new Event("input",{bubbles:true})
    );

    activeTarget.dispatchEvent(
      new Event("change",{bubbles:true})
    );

    close();
  }

  // =========================================
  // 20. YOPISH
  // =========================================

  function close() {
    if (
      window.mathVirtualKeyboard &&
      window.mathVirtualKeyboard.visible
    ) {
      window.mathVirtualKeyboard.hide();
    }

    if (modal) modal.hidden = true;

    activeTarget = null;
    editor = null;
  }

  // =========================================
  // 21. BOTGA ULASH
  // =========================================

  function attach(target,subject) {
    if (!target) return;

    if (target.dataset.formulaButtonAttached === "1") {
      return;
    }

    target.dataset.formulaButtonAttached = "1";

    const selectedSubject =
      String(subject || "matematika").toLowerCase();

    const button = document.createElement("button");

    button.type = "button";
    button.className = "fm-open";
    button.textContent = "∑";
    button.title = "Formula klaviaturasini ochish";

    button.addEventListener("click",ev => {
      ev.preventDefault();
      ev.stopPropagation();

      target.blur();
      open(target,selectedSubject);
    });

    target.insertAdjacentElement("afterend",button);
  }

  // =========================================
  // 22. ESKI INTEGRATSIYA API
  // =========================================

  window.FormulaEditor = {
    open,
    attach,
    close,
    banks: BANKS
  };

})();
