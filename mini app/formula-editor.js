
(function () {
  "use strict";

  // =========================================
  // 1. BOT BILAN ULANISH
  // =========================================

  let activeTarget = null;
  let activeSubject = "matematika";
  let modal = null;
  let editor = null;

  // =========================================
  // 2. RAQAMLAR — BARCHASIDA 1-BO'LIM
  // =========================================

  const NUMBERS = [
    ..."0123456789".split("").map(x => ({
      label: x, value: x
    }))
  ];

  // =========================================
  // 3. MATEMATIKA VA FIZIKA
  // =========================================

  const BASIC_MATH = [
    ["+", "+"], ["−", "−"], ["×", "×"], ["÷", "÷"],
    ["=", "="], ["≠", "≠"], ["≈", "≈"], ["±", "±"],
    ["∓", "∓"], ["(", "("], [")", ")"],
    ["[", "["], ["]", "]"], ["{", "{"], ["}", "}"],
    ["<", "<"], [">", ">"], ["≤", "≤"], ["≥", "≥"],
    ["%", "%"], [",", ","], [".", "."],
    ["|", "|"], ["x", "x"], ["y", "y"], ["z", "z"]
  ].map(([label, value]) => ({label, value}));

  const FRACTIONS_POWERS = [
    ["½", "½"], ["⅓", "⅓"], ["⅔", "⅔"],
    ["¼", "¼"], ["¾", "¾"], ["⅕", "⅕"],
    ["⅖", "⅖"], ["⅗", "⅗"], ["⅘", "⅘"],
    ["⅙", "⅙"], ["⅚", "⅚"], ["⅛", "⅛"],
    ["⅜", "⅜"], ["⅝", "⅝"], ["⅞", "⅞"],
    ["⁄", "⁄"], ["√", "√"], ["∛", "∛"],
    ["∜", "∜"], ["x²", "²"], ["x³", "³"],
    ["xⁿ", "ⁿ"], ["x⁴", "⁴"], ["x⁵", "⁵"],
    ["₁", "₁"], ["₂", "₂"], ["₃", "₃"],
    ["⁺", "⁺"], ["⁻", "⁻"], ["∞", "∞"],
    ["π", "π"], ["°", "°"]
  ].map(([label, value]) => ({label, value}));

  const TRIG_FUNCTIONS = [
    ["sin", "sin("], ["cos", "cos("],
    ["tg", "tg("], ["ctg", "ctg("],
    ["tan", "tan("], ["cot", "cot("],
    ["sec", "sec("], ["csc", "csc("],
    ["sin⁻¹", "sin⁻¹("], ["cos⁻¹", "cos⁻¹("],
    ["tg⁻¹", "tg⁻¹("], ["log", "log("],
    ["ln", "ln("], ["lg", "lg("],
    ["lim", "lim"], ["f(x)", "f(x)"],
    ["d/dx", "d/dx"], ["eˣ", "eˣ"],
    ["log₂", "log₂("], ["logₙ", "logₙ("],
    ["Δ", "Δ"], ["θ", "θ"],
    ["α", "α"], ["β", "β"]
  ].map(([label, value]) => ({label, value}));

  const MATH_SYMBOLS = [
    ..."∑∫∬∮∂∇∈∉⊂⊆∪∩∅∀∃⇒⇔⊥∥∠∝∴∵"
      .split("").map(x => ({label:x,value:x})),
    ..."αβγδεζηθικλμνξπρστυφχψω"
      .split("").map(x => ({label:x,value:x})),
    ..."ΑΒΓΔΘΛΠΣΩ"
      .split("").map(x => ({label:x,value:x}))
  ];

  const PHYSICS_SYMBOLS = [
    ..."FmasvtgP A EWNpρμλωTQ IURqCB"
      .replace(/ /g, "").split("")
      .map(x => ({label:x,value:x})),
    ["Ω", "Ω"], ["Φ", "Φ"], ["η", "η"],
    ["φ", "φ"], ["ℏ", "ℏ"], ["ν", "ν"],
    ["Δ", "Δ"], ["°C", "°C"], ["°F", "°F"],
    ["m/s", "m/s"], ["km/h", "km/h"],
    ["m/s²", "m/s²"], ["N", "N"],
    ["J", "J"], ["W", "W"], ["Pa", "Pa"],
    ["Hz", "Hz"], ["V", "V"], ["A", "A"],
    ["Ω", "Ω"], ["C", "C"], ["T", "T"]
  ].map(x => Array.isArray(x)
    ? ({label:x[0],value:x[1]})
    : x);

  // =========================================
  // 4. KIMYO VA BIOLOGIYA
  // =========================================

  const INDEX_TOOLS = [
    ..."⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻"
      .split("").map(x => ({label:x,value:x})),
    ..."₀₁₂₃₄₅₆₇₈₉"
      .split("").map(x => ({label:x,value:x})),
    ...["²⁺","²⁻","³⁺","³⁻","⁴⁺","⁴⁻"]
      .map(x => ({label:x,value:x}))
  ];

  const CHEMISTRY_SYMBOLS = [
    ["→", " → "], ["⇌", " ⇌ "], ["↔", " ↔ "],
    ["↑", "↑"], ["↓", "↓"], ["Δ", "Δ"],
    ["°", "°"], ["·", "·"], ["±", "±"],
    ["=", " = "], ["+", " + "], ["−", " − "],
    ["(s)", "(s)"], ["(l)", "(l)"],
    ["(g)", "(g)"], ["(aq)", "(aq)"],
    ["e⁻", "e⁻"], ["hν", "hν"], ["t°", "t°"]
  ].map(([label,value]) => ({label,value}));

  const CHEMISTRY_IONS = [
    "H⁺","OH⁻","Na⁺","K⁺","Ag⁺",
    "Ca²⁺","Mg²⁺","Ba²⁺","Zn²⁺",
    "Cu²⁺","Fe²⁺","Fe³⁺","Al³⁺",
    "Cl⁻","Br⁻","I⁻","NO₃⁻",
    "SO₄²⁻","SO₃²⁻","CO₃²⁻",
    "HCO₃⁻","PO₄³⁻","NH₄⁺",
    "MnO₄⁻","Cr₂O₇²⁻"
  ].map(x => ({label:x,value:x}));

  const BIOLOGY_SYMBOLS = [
    "♀","♂","×","F₁","F₂","P",
    "DNA","RNA","mRNA","tRNA",
    "ATP","ADP","NAD","NADH",
    "O₂","CO₂","H₂O","α","β","γ",
    "Δ","→","↔","↑","↓",
    "Aa","AA","aa","Xᴬ","Xᵃ",
    "Y","XX","XY","n","2n",
    "G₁","G₂","S","M"
  ].map(x => ({label:x,value:x}));

  // =========================================
  // 5. ELEMENTLAR — 118 TA
  // =========================================

  const ELEMENTS = (
    "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca " +
    "Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr " +
    "Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe " +
    "Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu " +
    "Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn " +
    "Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr " +
    "Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og"
  ).split(" ").map(x => ({label:x,value:x}));

  // =========================================
  // 6. KLAVIATURALAR TARTIBI
  // =========================================

  const BANKS = {

    matematika: {
      "1. Raqamlar": NUMBERS,
      "2. Asosiy belgilar": BASIC_MATH,
      "3. Kasrlar, ildizlar va darajalar": FRACTIONS_POWERS,
      "4. Trigonometriya va funksiyalar": TRIG_FUNCTIONS,
      "5. Qo'shimcha matematik belgilar": MATH_SYMBOLS
    },

    fizika: {
      "1. Raqamlar": NUMBERS,
      "2. Asosiy belgilar": BASIC_MATH,
      "3. Kasrlar, ildizlar va darajalar": FRACTIONS_POWERS,
      "4. Matematik funksiyalar": TRIG_FUNCTIONS,
      "5. Fizik belgilar": PHYSICS_SYMBOLS
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
  // 7. CSS
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

      .fm-keys-grid {
        display:grid;
        grid-template-columns:repeat(5,minmax(0,1fr));
        gap:4px;
      }

      .fm-number-grid {
        display:grid;
        grid-template-columns:repeat(5,minmax(0,1fr));
        gap:5px;
      }

      .fm-keys-flex {
        display:flex;
        flex-wrap:wrap;
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
        -webkit-user-select:none;
      }

      .fm-key:active {
        background:#bfdbfe;
        transform:scale(.96);
      }

      .fm-number-grid .fm-key {
        min-height:44px;
        font-size:19px;
      }

      .fm-elements-grid {
        display:grid;
        grid-template-columns:repeat(8,minmax(0,1fr));
        gap:4px;
      }

      .fm-fixed-tools {
        display:flex;
        gap:4px;
        margin-top:8px;
      }

      .fm-fixed-tools button {
        flex:1;
        min-height:36px;
        border:0;
        border-radius:6px;
        font-size:14px;
        font-weight:bold;
        background:#1e3a8a;
        color:white;
        cursor:pointer;
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

      @media(max-width:380px) {
        .fm-elements-grid {
          grid-template-columns:repeat(7,minmax(0,1fr));
        }
        .fm-key {
          min-height:35px;
          font-size:12px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // =========================================
  // 8. OYNA
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
        ></textarea>

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

    editor = modal.querySelector("#fm-field");

    modal.querySelector("#fm-close").addEventListener("click",close);
    modal.querySelector("#fm-cancel").addEventListener("click",close);
    modal.querySelector("#fm-save").addEventListener("click",save);

    modal.querySelector("#fm-backspace").addEventListener("click",() => {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;

      if (start !== end) {
        editor.setRangeText("",start,end,"end");
      } else if (start > 0) {
        editor.setRangeText("",start-1,start,"end");
      }

      editor.focus();
    });

    modal.querySelector("#fm-clear").addEventListener("click",() => {
      editor.value = "";
      editor.focus();
    });

    modal.addEventListener("click",ev => {
      if (ev.target === modal) close();
    });

    modal.addEventListener("keydown",ev => {
      if (ev.key === "Escape") close();
    });
  }

  // =========================================
  // 9. UNICODE BELGI KIRITISH
  // =========================================

  function insertValue(value) {
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    editor.setRangeText(
      value,
      start,
      end,
      "end"
    );

    editor.focus();
  }

  // =========================================
  // 10. KLAVIATURANI CHIZISH
  // =========================================

  function renderBank() {
    const container = modal.querySelector("#fm-sections");
    container.replaceChildren();

    const bank = BANKS[activeSubject];

    Object.entries(bank).forEach(([title,items],index) => {

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

        button.textContent = item.label;
        button.title = item.label;
        button.setAttribute("aria-label",item.label);

        button.addEventListener("click",ev => {
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
  // 11. OCHISH
  // =========================================

  function open(target,subject) {
    if (!target) return;

    activeTarget = target;

    const key = String(subject || "matematika")
      .toLowerCase()
      .trim();

    activeSubject = BANKS[key] ? key : "matematika";

    ensureModal();

    const titles = {
      matematika:"Matematika — Unicode klaviatura",
      fizika:"Fizika — Unicode klaviatura",
      kimyo:"Kimyo — ChemKey uslubi",
      biologiya:"Biologiya — maxsus klaviatura"
    };

    modal.querySelector("#fm-title").textContent =
      titles[activeSubject];

    editor.value = target.value || "";

    renderBank();

    modal.hidden = false;
    editor.focus();
  }

  // =========================================
  // 12. SAQLASH
  // =========================================

  function save() {
    if (!activeTarget || !editor) {
      close();
      return;
    }

    activeTarget.value = editor.value;

    activeTarget.dispatchEvent(
      new Event("input",{bubbles:true})
    );

    activeTarget.dispatchEvent(
      new Event("change",{bubbles:true})
    );

    close();
  }

  // =========================================
  // 13. YOPISH
  // =========================================

  function close() {
    if (modal) modal.hidden = true;
    activeTarget = null;
  }

  // =========================================
  // 14. BOTGA ULASH
  // =========================================

  function attach(target,subject) {
    if (!target || target.dataset.formulaButtonAttached === "1") {
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

      target.blur();
      open(target,selectedSubject);
    }

    target.addEventListener("click",openForTarget);

    const button = document.createElement("button");

    button.type = "button";
    button.className = "fm-open";
    button.textContent = "∑";
    button.title = "Maxsus klaviaturani ochish";

    button.addEventListener("click",openForTarget);

    target.insertAdjacentElement("afterend",button);
  }

  // =========================================
  // 15. BOT UCHUN API
  // =========================================

  window.FormulaEditor = {
    open,
    attach,
    close,
    banks: BANKS
  };

})();
