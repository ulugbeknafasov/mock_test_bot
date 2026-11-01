
function insertValue(value) {
  if (!modal) return;

  if (IS_MATH() && !mathEditor.hidden) {
    if (document.activeElement !== mathEditor) {
      mathEditor.focus({ preventScroll: true });
    }

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
