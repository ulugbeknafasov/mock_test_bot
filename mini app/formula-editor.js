(function () {
  "use strict";

  // =========================================
  // 1. BOT BILAN ULANISH
  // =========================================

  let activeTarget = null;
  let activeSubject = "matematika";
  let modal = null;
  let editor = null;
  let mathEditor = null;
  let unicodeEditor = null;
  let mathLivePromise = null;

  const IS_MATH = () =>
    activeSubject === "matematika" ||
    activeSubject === "fizika";

  // =========================================
  // 2. RAQAMLAR
  // =========================================

  const NUMBERS = [..."0123456789"].map(x => ({
    label: x,
    value: x
  }));

  // =========================================
  // 3. MATEMATIKA
  // =========================================

  const LATIN_LETTERS = [
    ..."abcdefghijklmnopqrstuvwxyz",
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  ].map(x => ({
    label: x,
    value: x
  }));

  const BASIC_MATH = [
    ["+", "+"], ["−", "-"], ["×", "\\times "],
    ["÷", "\\div "], ["=", "="], ["≠", "\\ne "],
    ["≈", "\\approx "], ["±", "\\pm "], ["∓", "\\mp "],
    ["(", "("], [")", ")"], ["[", "["], ["]", "]"],
    ["{", "\\{"], ["}", "\\}"], ["<", "<"], [">", ">"],
    ["≤", "\\le "], ["≥", "\\ge "], ["%", "\\%"],
    [",", ","], [".", "."], ["|", "|"],
    ["∞", "\\infty "], ["π", "\\pi "], ["e", "e"],
    ["°", "^{\\circ}"], ["√", "\\sqrt{#?}"]
  ].map(([label, value]) => ({
    label,
    value
  }));

  const STRUCTURES = [
    ["Kasr", "\\frac{#?}{#?}"],
    ["Ildiz", "\\sqrt{#?}"],
    ["Kub ildiz", "\\sqrt[3]{#?}"],
    ["n-darajali ildiz", "\\sqrt[#?]{#?}"],
    ["Daraja", "^{#?}"],
    ["Indeks", "_{#?}"],
    ["Daraja va indeks", "_{#?}^{#?}"],
    ["Yig'indi", "\\sum_{#?}^{#?}"],
    ["Ko'paytma", "\\prod_{#?}^{#?}"],
    ["Integral", "\\int_{#?}^{#?}"],
    ["Ikki karrali integral", "\\iint"],
    ["Hosila", "\\frac{d}{dx}"],
    ["Limit", "\\lim_{#?}"],
    ["Matritsa", "\\begin{pmatrix}#?& #?\\\\#?& #?\\end{pmatrix}"],
    ["Modul", "\\left|#?\\right|"],
    ["Qavs", "\\left(#?\\right)"],
    ["Vektor", "\\vec{#?}"],
    ["Ustki chiziq", "\\overline{#?}"],
    ["Burchak", "\\angle "],
    ["Nisbat", "\\frac{#?}{#?}"]
  ].map(([label, value]) => ({
    label,
    value
  }));

  const TRIG_FUNCTIONS = [
    ["sin", "\\sin("],
    ["cos", "\\cos("],
    ["tg", "\\tan("],
    ["ctg", "\\cot("],
    ["tan", "\\tan("],
    ["cot", "\\cot("],
    ["sec", "\\sec("],
    ["csc", "\\csc("],
    ["sin⁻¹", "\\arcsin("],
    ["cos⁻¹", "\\arccos("],
    ["tg⁻¹", "\\arctan("],
    ["log", "\\log("],
    ["ln", "\\ln("],
    ["lg", "\\log_{10}("],
    ["lim", "\\lim_{#?}"],
    ["max", "\\max("],
    ["min", "\\min("],
    ["f(x)", "f(x)"],
    ["d/dx", "\\frac{d}{dx}"],
    ["eˣ", "e^{x}"],
    ["log₂", "\\log_{2}("],
    ["logₙ", "\\log_{n}("],
    ["Δ", "\\Delta "],
    ["θ", "\\theta "],
    ["α", "\\alpha "],
    ["β", "\\beta "]
  ].map(([label, value]) => ({
    label,
    value
  }));

  const GREEK = [
    ..."αβγδεζηθικλμνξοπρστυφχψω",
    ..."ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ"
  ].map(x => ({
    label: x,
    value: "\\" + ({
      "α": "alpha", "β": "beta", "γ": "gamma",
      "δ": "delta", "ε": "epsilon", "ζ": "zeta",
      "η": "eta", "θ": "theta", "ι": "iota",
      "κ": "kappa", "λ": "lambda", "μ": "mu",
      "ν": "nu", "ξ": "xi", "ο": "omicron",
      "π": "pi", "ρ": "rho", "σ": "sigma",
      "τ": "tau", "υ": "upsilon", "φ": "phi",
      "χ": "chi", "ψ": "psi", "ω": "omega",
      "Α": "Alpha", "Β": "Beta", "Γ": "Gamma",
      "Δ": "Delta", "Ε": "Epsilon", "Ζ": "Zeta",
      "Η": "Eta", "Θ": "Theta", "Ι": "Iota",
      "Κ": "Kappa", "Λ": "Lambda", "Μ": "Mu",
      "Ν": "Nu", "Ξ": "Xi", "Ο": "Omicron",
      "Π": "Pi", "Ρ": "Rho", "Σ": "Sigma",
      "Τ": "Tau", "Υ": "Upsilon", "Φ": "Phi",
      "Χ": "Chi", "Ψ": "Psi", "Ω": "Omega"
    })[x] + " "
  }));

  const MATH_SYMBOLS = [
    ..."∑∫∬∮∂∇∈∉⊂⊆∪∩∅∀∃⇒⇔⊥∥∠∝∴∵",
    ..."∞∼≅≡∝∅ℝℕℤℚℂ"
  ].map(x => ({
    label: x,
    value: x
  }));

  // =========================================
  // 4. FIZIKA BELGILARI
  // =========================================

  const PHYSICS_SYMBOLS = [
    ..."FmasvtgPAEWNpρμλωTQ IURqCB",
    ..."ΩΦηφℏνΔθλ",
    "°C", "°F", "m/s", "km/h", "m/s²",
    "N", "J", "W", "Pa", "Hz", "V",
    "A", "Ω", "C", "T", "kg", "mol",
    "K", "s", "m", "cm", "mm"
  ].filter(x => x !== " ").map(x => ({
    label: x,
    value: x
  }));

  // =========================================
  // 5. KIMYO VA BIOLOGIYA
  // =========================================

  const INDEX_TOOLS = [
    ..."⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻",
    ..."₀₁₂₃₄₅₆₇₈₉"
  ].map(x => ({
    label: x,
    value: x
  }));

  const CHEMISTRY_SYMBOLS = [
    ["→", " → "], ["⇌", " ⇌ "], ["↔", " ↔ "],
    ["↑", "↑"], ["↓", "↓"], ["Δ", "Δ"],
    ["°", "°"], ["·", "·"], ["±", "±"],
    ["=", " = "], ["+", " + "], ["−", " − "],
    ["(s)", "(s)"], ["(l)", "(l)"],
    ["(g)", "(g)"], ["(aq)", "(aq)"],
    ["e⁻", "e⁻"], ["hν", "hν"], ["t°", "t°"]
  ].map(([label, value]) => ({
    label,
    value
  }));

  const CHEMISTRY_IONS = [
    "H⁺", "OH⁻", "Na⁺", "K⁺", "Ag⁺",
    "Ca²⁺", "Mg²⁺", "Ba²⁺", "Zn²⁺",
    "Cu²⁺", "Fe²⁺", "Fe³⁺", "Al³⁺",
    "Cl⁻", "Br⁻", "I⁻", "NO₃⁻",
    "SO₄²⁻", "SO₃²⁻", "CO₃²⁻",
    "HCO₃⁻", "PO₄³⁻", "NH₄⁺",
    "MnO₄⁻", "Cr₂O₇²⁻"
  ].map(x => ({
    label: x,
    value: x
  }));

  const BIOLOGY_SYMBOLS = [
    "♀", "♂", "×", "F₁", "F₂", "P",
    "DNA", "RNA", "mRNA", "tRNA",
    "ATP", "ADP", "NAD", "NADH",
    "O₂", "CO₂", "H₂O", "α", "β", "γ",
    "Δ", "→", "↔", "↑", "↓",
    "Aa", "AA", "aa", "Xᴬ", "Xᵃ",
    "Y", "XX", "XY", "n", "2n",
    "G₁", "G₂", "S", "M"
  ].map(x => ({
    label: x,
    value: x
  }));

  const ELEMENTS = (
    "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca " +
    "Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr " +
    "Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe " +
    "Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu " +
    "Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn " +
    "Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr " +
    "Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og"
  ).split(" ").map(x => ({
    label: x,
    value: x
  }));

  // =========================================
  // 6. BANKLAR
  // =========================================

  const BANKS = {
    matematika: {
      "1. Raqamlar": NUMBERS,
      "2. Lotin harflari": LATIN_LETTERS,
      "3. Asosiy belgilar": BASIC_MATH,
      "4. Kasr, ildiz, daraja va indeks": STRUCTURES,
      "5. Trigonometriya va funksiyalar": TRIG_FUNCTIONS,
      "6. Yunon harflari": GREEK,
      "7. Qo'shimcha matematik belgilar": MATH_SYMBOLS
    },

    fizika: {
      "1. Raqamlar": NUMBERS,
      "2. Lotin harflari": LATIN_LETTERS,
      "3. Asosiy belgilar": BASIC_MATH,
      "4. Kasr, ildiz, daraja va indeks": STRUCTURES,
      "5. Matematik funksiyalar": TRIG_FUNCTIONS,
      "6. Fizik belgilar": PHYSICS_SYMBOLS,
      "7. Yunon harflari": GREEK
    },

    kimyo: {
      "1. Raqamlar": NUMBERS,
      "2. Elementlar": ELEMENTS,
      "3. Yuqori va pastki indekslar": INDEX_TOOLS,
      "4. Ionlar": CHEMISTRY_IONS,
      "5. Reaksiya va amallar": CHEMISTRY_SYMBOLS
    },

    biologiya: {
      "1. Raqamlar": NUMBERS,
      "2. Biologik belgilar": BIOLOGY_SYMBOLS,
      "3. Yuqori va pastki indekslar": INDEX_TOOLS,
      "4. Elementlar": ELEMENTS
    }
  };

  // =========================================
  // 7. MATHLIVE YUKLASH
  // =========================================

  function loadMathLive() {
    if (customElements.get("math-field")) {
      return Promise.resolve();
    }

    if (mathLivePromise) {
      return mathLivePromise;
    }

    mathLivePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = "https://cdn.jsdelivr.net/npm/mathlive@0.111.0";

      script.onload = () => resolve();

      script.onerror = () => {
        mathLivePromise = null;
        reject(new Error("MathLive yuklanmadi"));
      };

      document.head.appendChild(script);
    });

    return mathLivePromise;
  }

  // =========================================
  // 8. CSS
  // =========================================

  function addStyles() {
    if (document.getElementById("formula-editor-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "formula-editor-styles";

    style.textContent = `
      .fm-backdrop {
        position:fixed;
        inset:0;
        z-index:2147483000;
        background:rgba(8,13,25,.75);
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
        width:min(520px,100%);
        max-height:96dvh;
        overflow-y:auto;
        background:#0756b8;
        color:white;
        border-radius:14px;
        padding:10px;
        box-sizing:border-box;
        box-shadow:0 10px 40px #0008;
      }

      .fm-head {
        display:flex;
        justify-content:space-between;
        align-items:center;
        font-weight:bold;
        font-size:15px;
        margin-bottom:8px;
      }

      .fm-close {
        width:30px;
        height:30px;
        border:0;
        border-radius:50%;
        background:#ffffff22;
        color:white;
        font-size:22px;
        cursor:pointer;
      }

      .fm-field {
        width:100%;
        min-height:65px;
        resize:vertical;
        background:white;
        color:#111827;
        border-radius:8px;
        padding:10px;
        font-size:22px;
        margin-bottom:8px;
        box-sizing:border-box;
        border:none;
        outline:none;
      }

      .fm-math-field {
        display:block;
        width:100%;
        min-height:80px;
        background:white;
        color:#111827;
        border-radius:8px;
        padding:12px;
        font-size:25px;
        margin-bottom:8px;
        box-sizing:border-box;
        border:none;
        outline:none;
      }

      .fm-math-field[hidden],
      .fm-field[hidden] {
        display:none!important;
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

      .fm-keys-flex {
        display:flex;
        flex-wrap:wrap;
        gap:4px;
      }

      .fm-number-grid {
        display:grid;
        grid-template-columns:repeat(5,minmax(0,1fr));
        gap:5px;
      }

      .fm-elements-grid {
        display:grid;
        grid-template-columns:repeat(8,minmax(0,1fr));
        gap:4px;
      }

      .fm-key {
        min-height:39px;
        min-width:38px;
        border:0;
        border-radius:5px;
        background:white;
        color:#0756b8;
        font-size:14px;
        font-weight:bold;
        padding:5px;
        cursor:pointer;
        display:flex;
        align-items:center;
        justify-content:center;
        touch-action:manipulation;
        user-select:none;
      }

      .fm-key:active {
        background:#bfdbfe;
        transform:scale(.96);
      }

      .fm-number-grid .fm-key {
        min-height:44px;
        font-size:19px;
      }

      .fm-fixed-tools {
        display:grid;
        grid-template-columns:repeat(6,minmax(0,1fr));
        gap:4px;
        margin-top:8px;
      }

      .fm-fixed-tools button {
        min-width:0;
        min-height:37px;
        border:0;
        border-radius:6px;
        font-size:14px;
        font-weight:bold;
        background:#1e3a8a;
        color:white;
        cursor:pointer;
        touch-action:manipulation;
      }

      .fm-actions {
        display:flex;
        gap:6px;
        margin-top:6px;
      }

      .fm-actions button {
        flex:1;
        min-height:40px;
        border:0;
        border-radius:6px;
        font-size:14px;
        font-weight:bold;
        cursor:pointer;
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

      /* 4-bo'lim matematik ko'rinishlari */

      .fm-structure-key {
        min-width:55px;
        min-height:48px;
        padding:5px 9px;
      }

      .fm-preview {
        display:inline-flex;
        align-items:center;
        justify-content:center;
        color:#0756b8;
        font-family:serif;
        font-size:20px;
        line-height:1;
        min-width:27px;
        min-height:28px;
      }

      .fm-preview-frac {
        display:inline-flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        line-height:1.05;
        min-width:30px;
      }

      .fm-preview-frac .top {
        border-bottom:1.5px solid #0756b8;
        padding:0 5px 2px;
        min-width:22px;
        text-align:center;
      }

      .fm-preview-frac .bottom {
        padding-top:2px;
        min-width:22px;
        text-align:center;
      }

      .fm-preview-root {
        display:inline-flex;
        align-items:center;
        font-size:27px;
      }

      .fm-preview-root .root-line {
        display:inline-block;
        border-top:2px solid #0756b8;
        min-width:19px;
        padding:3px 3px 0;
        font-size:15px;
        margin-left:-2px;
      }

      .fm-preview-power {
        font-family:serif;
        font-size:22px;
      }

      .fm-preview-power sup,
      .fm-preview-power sub {
        font-size:12px;
      }

      .fm-preview-op {
        font-size:28px;
      }

      .fm-preview-matrix {
        display:inline-grid;
        grid-template-columns:auto auto;
        gap:2px 8px;
        border-left:2px solid #0756b8;
        border-right:2px solid #0756b8;
        padding:3px 6px;
        font-size:15px;
      }

      @media(max-width:380px) {
        .fm-elements-grid {
          grid-template-columns:repeat(7,minmax(0,1fr));
        }

        .fm-key {
          min-height:35px;
          font-size:12px;
        }

        .fm-structure-key {
          min-width:47px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // =========================================
  // 9. MATEMATIK TUGMALAR KO'RINISHI
  // =========================================

  function createStructurePreview(label) {
    const previews = {
      "Kasr": `
        <span class="fm-preview fm-preview-frac">
          <span class="top">a</span>
          <span class="bottom">b</span>
        </span>
      `,

      "Ildiz": `
        <span class="fm-preview fm-preview-root">
          √<span class="root-line">x</span>
        </span>
      `,

      "Kub ildiz": `
        <span class="fm-preview fm-preview-root">
          <sup style="font-size:11px">3</sup>√
          <span class="root-line">x</span>
        </span>
      `,

      "n-darajali ildiz": `
        <span class="fm-preview fm-preview-root">
          <sup style="font-size:11px">n</sup>√
          <span class="root-line">x</span>
        </span>
      `,

      "Daraja": `
        <span class="fm-preview fm-preview-power">
          x<sup>n</sup>
        </span>
      `,

      "Indeks": `
        <span class="fm-preview fm-preview-power">
          x<sub>n</sub>
        </span>
      `,

      "Daraja va indeks": `
        <span class="fm-preview fm-preview-power">
          x<sub>i</sub><sup>n</sup>
        </span>
      `,

      "Yig'indi": `
        <span class="fm-preview fm-preview-op">
          ∑<sub style="font-size:10px">i=1</sub>
          <sup style="font-size:10px">n</sup>
        </span>
      `,

      "Ko'paytma": `
        <span class="fm-preview fm-preview-op">
          ∏<sub style="font-size:10px">i=1</sub>
          <sup style="font-size:10px">n</sup>
        </span>
      `,

      "Integral": `
        <span class="fm-preview fm-preview-op">
          ∫<sub style="font-size:10px">a</sub>
          <sup style="font-size:10px">b</sup>
        </span>
      `,

      "Ikki karrali integral": `
        <span class="fm-preview fm-preview-op">∬</span>
      `,

      "Hosila": `
        <span class="fm-preview fm-preview-frac">
          <span class="top">dy</span>
          <span class="bottom">dx</span>
        </span>
      `,

      "Limit": `
        <span class="fm-preview fm-preview-power">
          lim<sub>x→a</sub>
        </span>
      `,

      "Matritsa": `
        <span class="fm-preview fm-preview-matrix">
          <span>a</span><span>b</span>
          <span>c</span><span>d</span>
        </span>
      `,

      "Modul": `
        <span class="fm-preview">|x|</span>
      `,

      "Qavs": `
        <span class="fm-preview">( x )</span>
      `,

      "Vektor": `
        <span class="fm-preview">a⃗</span>
      `,

      "Ustki chiziq": `
        <span class="fm-preview" style="text-decoration:overline">abc</span>
      `,

      "Burchak": `
        <span class="fm-preview">∠ABC</span>
      `,

      "Nisbat": `
        <span class="fm-preview fm-preview-frac">
          <span class="top">a</span>
          <span class="bottom">b</span>
        </span>
      `
    };

    return previews[label] || null;
  }

  // =========================================
  // 10. OYNA
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

        <textarea
          id="fm-field"
          class="fm-field"
          placeholder="Javobingizni kiriting..."
          spellcheck="false"
          inputmode="none"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
        ></textarea>

        <math-field
          id="fm-math-field"
          class="fm-math-field"
          hidden
        ></math-field>

        <!-- KURSOR VA AMAL TUGMALARI -->
        <div class="fm-fixed-tools">
          <button type="button" id="fm-left">←</button>
          <button type="button" id="fm-up">↑</button>
          <button type="button" id="fm-down">↓</button>
          <button type="button" id="fm-right">→</button>
          <button type="button" id="fm-backspace">⌫</button>
          <button type="button" id="fm-clear">C</button>
        </div>

        <!-- BEKOR QILISH VA SAQLASH -->
        <div class="fm-actions">
          <button type="button" class="fm-cancel" id="fm-cancel">
            Bekor qilish
          </button>

          <button type="button" class="fm-save" id="fm-save">
            Tayyor ✓
          </button>
        </div>

        <!-- FAN KLAVIATURALARI -->
        <div id="fm-sections"></div>

      </section>
    `;

    document.body.appendChild(modal);

    unicodeEditor = modal.querySelector("#fm-field");
    mathEditor = modal.querySelector("#fm-math-field");
    editor = unicodeEditor;

    // Oddiy telefon klaviaturasini cheklash
    unicodeEditor.setAttribute("inputmode", "none");
    unicodeEditor.setAttribute("autocomplete", "off");
    unicodeEditor.setAttribute("autocorrect", "off");
    unicodeEditor.setAttribute("autocapitalize", "off");
    unicodeEditor.setAttribute("spellcheck", "false");

    modal.querySelector("#fm-close")
      .addEventListener("click", close);

    modal.querySelector("#fm-cancel")
      .addEventListener("click", close);

    modal.querySelector("#fm-save")
      .addEventListener("click", save);

    // Kursor boshqaruvi
    const cursorCommands = {
      "fm-left": "moveToPreviousChar",
      "fm-right": "moveToNextChar",
      "fm-up": "moveUp",
      "fm-down": "moveDown"
    };

    Object.entries(cursorCommands).forEach(([id, command]) => {
      const button = modal.querySelector("#" + id);

      button.addEventListener("pointerdown", ev => {
        ev.preventDefault();
      });

      button.addEventListener("click", () => {
        if (IS_MATH() && !mathEditor.hidden) {
          mathEditor.executeCommand(command);
        } else {
          moveUnicodeCursor(id.replace("fm-", ""));
        }
      });
    });

    // O'chirish
    const backspaceButton = modal.querySelector("#fm-backspace");

    backspaceButton.addEventListener("pointerdown", ev => {
      ev.preventDefault();
    });

    backspaceButton.addEventListener("click", () => {
      if (IS_MATH() && !mathEditor.hidden) {
        mathEditor.executeCommand("deleteBackward");
      } else {
        const start = unicodeEditor.selectionStart;
        const end = unicodeEditor.selectionEnd;

        if (start !== end) {
          unicodeEditor.setRangeText("", start, end, "end");
        } else if (start > 0) {
          unicodeEditor.setRangeText(
            "",
            start - 1,
            start,
            "end"
          );
        }

        unicodeEditor.focus();
      }
    });

    // Tozalash
    const clearButton = modal.querySelector("#fm-clear");

    clearButton.addEventListener("pointerdown", ev => {
      ev.preventDefault();
    });

    clearButton.addEventListener("click", () => {
      if (IS_MATH() && !mathEditor.hidden) {
        mathEditor.value = "";
      } else {
        unicodeEditor.value = "";
        unicodeEditor.focus();
      }
    });

    modal.addEventListener("click", ev => {
      if (ev.target === modal) close();
    });

    modal.addEventListener("keydown", ev => {
      if (ev.key === "Escape") close();
    });
  }

  // =========================================
  // 11. UNICODE KURSORINI SURISH
  // =========================================

  function moveUnicodeCursor(direction) {
    if (!unicodeEditor) return;

    const text = unicodeEditor.value;
    let start = unicodeEditor.selectionStart;
    let end = unicodeEditor.selectionEnd;

    if (direction === "left") {
      if (start !== end) {
        end = start;
      } else {
        start = Math.max(0, start - 1);
        end = start;
      }
    }

    else if (direction === "right") {
      if (start !== end) {
        start = end;
      } else {
        start = Math.min(text.length, end + 1);
      }

      end = start;
    }

    else if (direction === "up" || direction === "down") {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const column = start - lineStart;

      if (direction === "up") {
        if (lineStart === 0) return;

        const previousEnd = lineStart - 1;
        const previousStart =
          text.lastIndexOf("\n", previousEnd - 1) + 1;

        start = Math.min(
          previousStart + column,
          previousEnd
        );
      } else {
        const nextStart = text.indexOf("\n", start);

        if (nextStart === -1) return;

        const nextEnd = text.indexOf("\n", nextStart + 1);

        const actualEnd =
          nextEnd === -1 ? text.length : nextEnd;

        start = Math.min(
          nextStart + 1 + column,
          actualEnd
        );
      }

      end = start;
    }

    unicodeEditor.focus();
    unicodeEditor.setSelectionRange(start, end);
  }

  // =========================================
  // 12. FORMULA KIRITISH
  // =========================================

  function insertValue(value) {
    if (!modal) return;

    if (IS_MATH() && !mathEditor.hidden) {
      mathEditor.executeCommand([
        "insert",
        value,
        {
          selectionMode: "placeholder"
        }
      ]);

      return;
    }

    const start = unicodeEditor.selectionStart;
    const end = unicodeEditor.selectionEnd;

    unicodeEditor.setRangeText(
      value,
      start,
      end,
      "end"
    );

    unicodeEditor.focus();
  }

  // =========================================
  // 13. KLAVIATURANI CHIZISH
  // =========================================

  function renderBank() {
    const container = modal.querySelector("#fm-sections");
    container.replaceChildren();

    const bank = BANKS[activeSubject];

    Object.entries(bank).forEach(([title, items], index) => {
      const section = document.createElement("section");
      section.className = "fm-section";

      const heading = document.createElement("div");
      heading.className = "fm-section-title";
      heading.textContent = title;

      section.appendChild(heading);

      const grid = document.createElement("div");

      if (index === 0) {
        grid.className = "fm-number-grid";
      } else if (title.includes("Elementlar")) {
        grid.className = "fm-elements-grid";
      } else {
        grid.className = "fm-keys-flex";
      }

      items.forEach(item => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "fm-key";

        const preview =
          IS_MATH() &&
          title.includes("Kasr, ildiz")
            ? createStructurePreview(item.label)
            : null;

        if (preview) {
          button.classList.add("fm-structure-key");
          button.innerHTML = preview;
        } else {
          button.textContent = item.label;
        }

        button.title = item.label;
        button.setAttribute("aria-label", item.label);

        // Tugma bosilganda muharrir fokusini yo'qotmasin
        button.addEventListener("pointerdown", ev => {
          ev.preventDefault();
        });

        button.addEventListener("click", ev => {
          ev.preventDefault();
          ev.stopPropagation();

          insertValue(item.value);
        });

        grid.appendChild(button);
      });

      section.appendChild(grid);
      container.appendChild(section);
    });
  }

  // =========================================
  // 14. OCHISH
  // =========================================

  async function open(target, subject) {
    if (!target) return;

    activeTarget = target;

    const currentTarget = target;

    const key = String(subject || "matematika")
      .toLowerCase()
      .trim();

    activeSubject = BANKS[key] ? key : "matematika";

    ensureModal();

    const titles = {
      matematika: "Matematika — Formula muharriri",
      fizika: "Fizika — Formula muharriri",
      kimyo: "Kimyo — maxsus klaviatura",
      biologiya: "Biologiya — maxsus klaviatura"
    };

    modal.querySelector("#fm-title").textContent =
      titles[activeSubject];

    modal.hidden = false;

    if (IS_MATH()) {
  try {
    await loadMathLive();

    if (!activeTarget || activeTarget !== currentTarget) {
      return;
    }

    unicodeEditor.hidden = true;
    mathEditor.hidden = false;

    // SHU QATORLARNI ANIQLAB QO'SHING / TEKSHIRING:
    mathEditor.mathVirtualKeyboardPolicy = "manual";
    mathEditor.setAttribute("virtual-keyboard-mode", "manual");
    mathEditor.setAttribute("inputmode", "none");

    let visualField = activeTarget.parentNode.querySelector(".fm-replaced-math-view");
    mathEditor.value = visualField ? visualField.value : (target.value || "");

    if (!mathEditor.dataset.keyboardConfigured) {
      mathEditor.addEventListener("focus", () => {
        if (window.mathVirtualKeyboard) {
          window.mathVirtualKeyboard.layouts = [
            "numeric",
            "alphabetic",
            "symbols",
            "greek"
          ];
          window.mathVirtualKeyboard.hide(); // Standart MathLive klaviaturasini yashirish
        }
      });
      mathEditor.dataset.keyboardConfigured = "1";
    }

    renderBank();
    mathEditor.blur();
    setTimeout(() => mathEditor.focus(), 50);

  } catch (error) {
    console.error("MathLive xatosi:", error);
  }
}

    } else {
      mathEditor.hidden = true;
      unicodeEditor.hidden = false;

      // Kimyo va biologiyada telefon klaviaturasini cheklash
      unicodeEditor.setAttribute("inputmode", "none");
      unicodeEditor.setAttribute("autocomplete", "off");
      unicodeEditor.setAttribute("autocorrect", "off");
      unicodeEditor.setAttribute("autocapitalize", "off");
      unicodeEditor.setAttribute("spellcheck", "false");

      unicodeEditor.value = target.value || "";

      renderBank();
      unicodeEditor.focus();
    }
  }

  // =========================================
  // 15. SAQLASH (FAQAT VIZUAL KO'RINISH QOLADIGAN QILIB YANGILANDI)
  // =========================================

  function save() {
    if (!activeTarget) {
      close();
      return;
    }

    if (IS_MATH()) {
      const val = mathEditor.value; // Masalan: \sqrt[2]{3}
      
      // 1. Asl inputga qiymatni yozib qo'yamiz (bazaga ketishi uchun)
      activeTarget.value = val;

      // 2. Asl inputning o'rnida faqat chiroyli matematik ko'rinishni chiqaramiz
      let visualField = activeTarget.parentNode.querySelector(".fm-replaced-math-view");
      if (!visualField) {
        visualField = document.createElement("math-field");
        visualField.className = "fm-replaced-math-view";
        visualField.setAttribute("read-only", "");
        visualField.style.cssText = `
          display: inline-flex;
          align-items: center;
          width: 100%;
          min-height: 44px;
          background: #fff;
          color: #111827;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 20px;
          cursor: pointer;
          box-sizing: border-box;
          margin-bottom: 8px;
        `;

        // Vizual element bosilganda tahrirlash oynasi qayta ochiladi
        visualField.addEventListener("click", () => {
          open(activeTarget, activeSubject);
        });

        // Asl inputni yashirib, o'rniga vizual elementni qo'shamiz
        activeTarget.style.display = "none";
        activeTarget.insertAdjacentElement("afterend", visualField);
      }

      visualField.value = val;
      visualField.style.display = "block";

    } else {
      activeTarget.value = unicodeEditor.value;
    }

    activeTarget.dispatchEvent(
      new Event("input", {
        bubbles: true
      })
    );

    activeTarget.dispatchEvent(
      new Event("change", {
        bubbles: true
      })
    );

    close();
  }

  // =========================================
  // 16. YOPISH
  // =========================================

  function close() {
    if (modal) {
      modal.hidden = true;
    }

    if (window.mathVirtualKeyboard) {
      window.mathVirtualKeyboard.hide();
    }

    activeTarget = null;
  }

  // =========================================
  // 17. BOTGA ULASH
  // =========================================

  function attach(target, subject) {
    if (
      !target ||
      target.dataset.formulaButtonAttached === "1"
    ) {
      return;
    }

    target.dataset.formulaButtonAttached = "1";

    const selectedSubject =
      String(subject || "matematika").toLowerCase();

    function openForTarget(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      open(target, selectedSubject);
    }

    target.addEventListener("click", openForTarget);

    const button = document.createElement("button");

    button.type = "button";
    button.className = "fm-open";
    button.textContent = "∑";
    button.title = "Maxsus klaviaturani ochish";

    button.addEventListener("click", openForTarget);

    target.insertAdjacentElement(
      "afterend",
      button
    );
  }

  // =========================================
  // 18. BOT UCHUN API
  // =========================================

  window.FormulaEditor = {
    open,
    attach,
    close,
    banks: BANKS
  };

})();
