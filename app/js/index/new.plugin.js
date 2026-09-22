function newGraph() {
    closeHistoryPanel();
    calculator.setBlank();
    calculator.focusFirstExpression();
    window._name = 'Undefined';
    window._saved = false;
}

createSettingButton({
    icon: 'newGraph',
    label: 'New Graph',
    onClick: newGraph,
    order: 2
});
