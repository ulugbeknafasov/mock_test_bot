
(function () {
  "use strict";

  let activeTarget = null;
  let activeSubject = "matematika";
  let modal = null;
  let editor = null;
  let scriptPromise = null;

  // =====================================
  // RAQAMLAR
  // =====================================

  const NUMBERS = "0123456789".split("").map(x => ({
    label: x, value: x
  }));

  // =====================================
  // MATEMATIK HARFLAR
  // =====================================

  const LETTERS = [
    ..."xyzabcdef".split(""),
    ..."XYZABCDEF".split("")
  ].map(x => ({label:x,value:x}));

  // =====================================
  // MATEMATIK AMALLAR
  // =====================================

  const BASIC = [
    ["+", "+"], ["−", "−"], ["×", "×"], ["÷", "÷"],
    ["=", "="], ["≠", "≠"], ["≈", "≈"], ["±", "±"],
    ["∓", "∓"], ["<", "<"], [">", ">"],
    ["≤", "≤"], ["≥", "≥"], ["%", "%"],
    ["(", "("], [")", ")"], ["[", "["], ["]", "]"],
    [",", ","], [".", "."], ["∞", "∞"], ["π", "π"]
  ].map(([label,value]) => ({label,value}));

  // =====================================
  // FORMULA MUHARRIRI UCHUN TUGMALAR
  // =====================================

  const STRUCTURES = [
    {label:"Kasr", command:"fraction"},
    {label:"Ildiz", command:"sqrt"},
    {label:"Kub ildiz", command:"cbrt"},
    {label:"Daraja", command:"power"},
    {label:"Indeks", command:"subscript"},
    {label:"Qavs", command:"parentheses"},
    {label:"Modul", command:"absolute"},
    {label:"Matritsa", command:"matrix"}
  ];

  const FUNCTIONS = [
    "sin","cos","tg","ctg","tan","cot",
    "sec","csc","log","ln","lg","lim",
    "arcsin","arccos","arctg"
  ].map(x => ({label:x,value:x}));

  const MATH_SYMBOLS = [
    ..."∑∫∬∮∂∇∈∉⊂⊆∪∩∅∀∃⇒⇔⊥∥∠∝∴∵"
  ].split("").map(x => ({label:x,value:x}));

  const GREEK = [
    ..."αβγδεζηθικλμνξπρστυφχψω"
  ].split("").map(x => ({label:x,value:x}));

  const PHYSICS = [
    ..."FmasvtgPAEWNpρμλωTQIRqCB"
  ].split("").map(x => ({label:x,value:x}));

  // =====================================
  // KIMYO VA BIOLOGIYA
  // =====================================

  const INDEX = [
    ..."⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻"
  ].split("").map(x => ({label:x,value:x}))
  .concat(
    [..."₀₁₂₃₄₅₆₇₈₉"].map(x => ({label:x,value:x}))
  );

  const ELEMENTS = (
    "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca " +
    "Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr " +
    "Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe " +
    "Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu " +
    "Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn " +
    "Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr " +
    "Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og"
  ).split(" ").map(x => ({label:x,value:x}));

  const IONS = [
    "H⁺","OH⁻","Na⁺","K⁺","Ag⁺",
    "Ca²⁺","Mg²⁺","Ba²⁺","Zn²⁺",
    "Cu²⁺","Fe²⁺","Fe³⁺","Al³⁺",
    "Cl⁻","Br⁻","I⁻","NO₃⁻",
    "SO₄²⁻","SO₃²⁻","CO₃²⁻",
    "HCO₃⁻","PO₄³⁻","NH₄⁺",
    "MnO₄⁻","Cr₂O₇²⁻"
  ].map(x => ({label:x,value:x}));

  const CHEMICAL = [
    "→","⇌","↔","↑","↓","Δ","°","·",
    "+","−","=","(s)","(l)","(g)","(aq)","e⁻","hν","t°"
  ].map(x => ({label:x,value:x}));

  const BIOLOGY = [
    "♀","♂","×","F₁","F₂","P",
    "DNA","RNA","mRNA","tRNA",
    "ATP","ADP","NAD","NADH",
    "O₂","CO₂","H₂O","α","β","γ",
    "Δ","→","↔","↑","↓",
    "Aa","AA","aa","Xᴬ","Xᵃ",
    "Y","XX","XY","n","2n","G₁","G₂"
  ].map(x => ({label:x,value:x}));

  // =====================================
  // BO'LIMLAR
  // =====================================

  const BANKS = {
    matematika: {
      "1. Raqamlar": NUMBERS,
      "2. Harflar": LETTERS,
      "3. Asosiy amallar": BASIC,
      "4. Kasr, ildiz, daraja va indeks": STRUCTURES,
      "5. Trigonometriya va funksiyalar": FUNCTIONS,
      "6. Matematik belgilar": MATH_SYMBOLS,
      "7. Yunon harflari": GREEK
    },

    fizika: {
      "1. Raqamlar": NUMBERS,
      "2. Harflar": LETTERS,
      "3. Asosiy amallar": BASIC,
      "4. Kasr, ildiz, daraja va indeks": STRUCTURES,
      "5. Matematik funksiyalar": FUNCTIONS,
      "6. Fizik belgilar": PHYSICS,
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

  // =====================================
  // MATHLIVE YUKLASH
  // =====================================

  function loadMathLive() {
    if (customElements.get("math-field")) {
      return Promise.resolve();
    }

    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve,reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathlive";
      script.onload = resolve;
      script.onerror = () => reject(
        new Error("Matematik muharrir yuklanmadi.")
      );
      document.head.appendChild(script);
    }).catch(error => {
      scriptPromise = null;
      throw error;
    });

    return scriptPromise;
  }

  // =====================================
  // DIZAYN
  // =====================================

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

      .fm-backdrop[hidden] { display:none!important; }

      .fm-panel {
        width:min(520px,100%);
        max-height:96dvh;
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
        margin-bottom:8px;
      }

      .fm-close {
        width:32px;
        height:32px;
        border:0;
        border-radius:50%;
        background:#ffffff22;
        color:white;
        font-size:22px;
      }

      .fm-field {
        display:block;
        width:100%;
        min-height:90px;
        background:white;
        color:#111827;
        border-radius:8px;
        padding:8px;
        font-size:23px;
        margin-bottom:8px;
        box-sizing:border-box;
        border:none;
      }

      .fm-section { margin:9px 0; }

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

      .fm-tools {
        display:flex;
        flex-wrap:wrap;
        gap:5px;
        margin:8px 0;
      }

      .fm-tools button {
        flex:1 1 22%;
        min-height:38px;
        background:#dbeafe;
        color:#0756b8;
        border:0;
        border-radius:6px;
        font-weight:bold;
        cursor:pointer;
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

      .fm-cancel { background:#334155;color:white; }
      .fm-save { background:#0f9f82;color:white; }

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
    `;

    document.head.appendChild(style);
  }

  // =====================================
  // MODAL
  // =====================================

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

        <div id="fm-structure-tools"></div>

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

    modal.querySelector("#fm-close").addEventListener("click",close);
    modal.querySelector("#fm-cancel").addEventListener("click",close);
    modal.querySelector("#fm-save").addEventListener("click",save);

    modal.querySelector("#fm-backspace").addEventListener("click",() => {
      if (activeSubject === "matematika" || activeSubject === "fizika") {
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

    modal.querySelector("#fm-clear").addEventListener("click",() => {
      editor.value = "";
      editor.focus();
    });

    modal.addEventListener("click",ev => {
      if (ev.target === modal) close();
    });
  }

  // =====================================
  // MATEMATIK TUZILMALAR
  // =====================================

  function insertStructure(command) {
    if (!editor) return;

    const commands = {
      fraction: "\\frac{#@}{#?}",
      sqrt: "\\sqrt{#@}",
      cbrt: "\\sqrt[3]{#@}",
      power: "^{#@}",
      subscript: "_{#@}",
      parentheses: "(#@)",
      absolute: "|#@|",
      matrix: "\\begin{matrix}#@&\\\\#?&\\end{matrix}"
    };

    editor.focus();
    editor.insert(commands[command] || "");
  }

  // =====================================
  // KLAVIATURA CHIZISH
  // =====================================

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
          const button = document.createElement("button");
          button.type = "button";
          button.className = "fm-key";
          button.textContent = item.label;

          button.addEventListener("click",ev => {
            ev.preventDefault();

            if (item.command) {
              insertStructure(item.command);
            } else if (
              activeSubject === "matematika" ||
              activeSubject === "fizika"
            ) {
              editor.focus();
              editor.insert(item.value);
            } else {
              insertUnicode(item.value);
            }
          });

          grid.appendChild(button);
        });

        section.appendChild(grid);
        container.appendChild(section);
      }
    );
  }

  function insertUnicode(value) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    editor.setRangeText(value,start,end,"end");
    editor.focus();
  }

  // =====================================
  // MUHARRIR TURINI O'RNATISH
  // =====================================

  async function setupEditor() {
    const host = modal.querySelector("#fm-editor");
    host.replaceChildren();

    if (
      activeSubject === "matematika" ||
      activeSubject === "fizika"
    ) {
      await loadMathLive();

      editor = document.createElement("math-field");
      editor.className = "fm-field";
      editor.setAttribute("virtual-keyboard-mode","manual");

      host.appendChild(editor);

      const tools = modal.querySelector("#fm-structure-tools");
      tools.replaceChildren();

      const row = document.createElement("div");
      row.className = "fm-tools";

      STRUCTURES.forEach(item => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = item.label;

        button.addEventListener("click",() => {
          insertStructure(item.command);
        });

        row.appendChild(button);
      });

      tools.appendChild(row);

    } else {
      editor = document.createElement("textarea");
      editor.className = "fm-field";
      editor.placeholder = "Javobingizni kiriting...";
      editor.spellcheck = false;

      host.appendChild(editor);
      modal.querySelector("#fm-structure-tools").replaceChildren();
    }
  }

  // =====================================
  // OCHISH
  // =====================================

  async function open(target,subject) {
    if (!target) return;

    activeTarget = target;

    const key = String(subject || "matematika").toLowerCase().trim();
    activeSubject = BANKS[key] ? key : "matematika";

    ensureModal();

    const titles = {
      matematika:"Matematika — Formula muharriri",
      fizika:"Fizika — Formula muharriri",
      kimyo:"Kimyo — Unicode klaviatura",
      biologiya:"Biologiya — Unicode klaviatura"
    };

    modal.querySelector("#fm-title").textContent = titles[activeSubject];
    modal.hidden = false;

    try {
      await setupEditor();

      if (!activeTarget) return;

      if (
        activeSubject === "matematika" ||
        activeSubject === "fizika"
      ) {
        // MathJSON formatida oldingi saqlangan formulani tiklash
        const oldValue = target.value || "";

        if (oldValue.startsWith("MATHJSON:")) {
          editor.setValue(
            JSON.parse(oldValue.slice(9)),
            "math-json"
          );
        } else {
          editor.value = oldValue;
        }

      } else {
        editor.value = target.value || "";
      }

      renderBank();
      editor.focus();

    } catch(error) {
      alert(error.message || "Muharrirni yuklashda xatolik.");
      close();
    }
  }

  // =====================================
  // SAQLASH
  // =====================================

  function save() {
    if (!activeTarget || !editor) {
      close();
      return;
    }

    if (
      activeSubject === "matematika" ||
      activeSubject === "fizika"
    ) {
      // LaTeX emas, strukturali MathJSON
      const mathJSON = editor.getValue("math-json");

      activeTarget.value =
        "MATHJSON:" + JSON.stringify(mathJSON);

    } else {
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

  // =====================================
  // YOPISH
  // =====================================

  function close() {
    if (modal) modal.hidden = true;
    activeTarget = null;
  }

  // =====================================
  // BOTGA ULASH
  // =====================================

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
    button.title = "Formula muharririni ochish";

    button.addEventListener("click",openForTarget);

    target.insertAdjacentElement("afterend",button);
  }

  // =====================================
  // API
  // =====================================

  window.FormulaEditor = {
    open,
    attach,
    close,
    banks: BANKS
  };

})();
