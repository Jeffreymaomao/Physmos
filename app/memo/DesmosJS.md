## Adding LaTeX symbols (line ~ 6151)

- hbar $\hbar$

```javascript
_.phi = be("\\phi ", "&#981;"),
_.phiv = _.varphi = be("\\varphi ", "&phi;"), 
_.epsilon = be("\\epsilon ", "&#1013;"), 
_.epsiv = _.varepsilon = be("\\varepsilon ", "&epsilon;"), 
_.piv = _.varpi = be("\\varpi ", "&piv;"), 
_.sigmaf = _.sigmav = _.varsigma = be("\\varsigma ", "&sigmaf;"), 
_.thetav = _.vartheta = _.thetasym = be("\\vartheta ", "&thetasym;"), 
_.upsilon = _.upsi = be("\\upsilon ", "&upsilon;"), 
_.gammad = _.Gammad = _.digamma = be("\\digamma ", "&#989;"), 
_.kappav = _.varkappa = be("\\varkappa ", "&#1008;"), 
_.rhov = _.varrho = be("\\varrho ", "&#1009;"), 
_.hbar = be("\\hbar "),
_.partial = be("\\partial ", "&#8706;"),
_.ell = be("\\ell ","ℓ"),
_.varR = be("\\varR ","ℜ"),
_.pi = _["π"] = function () {
    return new ke("\\pi ", c.entityText("&pi;"), "pi")
},
```



## Automatically show LaTeX (line ~ ) 

```javascript
t.getAutoCommands = function (e) {
    e || (e = {});
    var t = "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi pi rho sigma tau upsilon phi chi psi omega "+"Gamma Delta Xi Theta Lambda Pi Sigma Upsilon Phi Psi Omega "+"hbar ell partial "+"sqrt nthroot cbrt sum prod int ans percent infinity infty sim approx vec";
    return e.additionalCommands && e.additionalCommands.length && (t = t + " " + e.additionalCommands.join(" ")), e.disallowFrac ? t : t + " frac"
}
```



## Textarea keydown (line ~ 41173)

這段代碼是`dcg-smart-textarea`組件的`onKeydownEvent`方法，用於處理`keydown`事件。以下是對此函數的詳細分析：

1. **定義節點**:
   - 使用`this.textareaNode`來獲取當前的`textarea`元素，並將其存儲在變數`t`中。

2. **鍵盤按鍵查找**:
   - 使用`n.lookup(e)`從事件`e`中獲取按鍵值，並將其存儲在變數`r`中。

3. **只讀模式的處理**:
   - 如果`textarea`是只讀的(`this.props.readonly()`)且存在`readonlyAction`，並且沒有按下任何修飾鍵（如alt、ctrl、meta或shift），那麼當按下Enter或Spacebar時，會阻止默認事件並調用`readonlyAction`。

4. **非只讀模式的按鍵處理**:
   - 如果按下的是Enter鍵且未按下meta鍵：調用`onSpecialKey("Enter")`。
   - 如果按下的是Escape鍵：調用`s.default()`。
   - 如果按下的是向上箭頭鍵：檢查`textarea`的選擇是否在起始位置且未按下meta鍵，如果是，則調用`onSpecialKey("Up")`。
   - 如果按下的是向下箭頭鍵：檢查`textarea`的選擇是否在結尾位置且未按下meta鍵，如果是，則調用`onSpecialKey("Down")`。
   - 如果按下的是Backspace鍵且`textarea`是空的：調用`onSpecialKey("Backspace")`。
   - 如果按下的是Delete鍵且`textarea`是空的：調用`onSpecialKey("Delete")`。

5. **其他`keydown`事件的處理**:
   - 如果存在`onKeydown`屬性，則調用它並傳遞事件`e`。

總之，這段代碼根據用戶在`textarea`上的按鍵操作來執行相應的動作。當`textarea`是只讀的，它對Enter和Spacebar鍵的反應是特定的；當`textarea`不是只讀的，它對各種特定鍵的反應也是特定的。

```js
t.prototype.onKeydownEvent = function (e) {
    var t = this.textareaNode; // 獲取textarea節點

    if (!t) return; // 如果沒有textarea節點則返回

    var r = n.lookup(e); // 從事件中獲取按鍵值

    if (this.props.readonly() && void 0 !== this.props.readonlyAction) {
        // 處理只讀模式下的按鍵事件
        if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && (r === n.ENTER || r === n.SPACEBAR)) {
            e.preventDefault();
            this.props.readonlyAction();
        }
    } else {
        // 處理非只讀模式下的按鍵事件
        if (r === n.ENTER && !e.metaKey) {
            e.preventDefault();
            this.props.onSpecialKey("Enter");
        } else if (r === n.ESCAPE) {
            s.default();
        } else if (r === n.UP && t.selectionStart === 0 && t.selectionEnd === 0 && !e.altKey && !e.metaKey) {
            e.preventDefault();
            this.props.onSpecialKey("Up");
        } else if (r === n.DOWN && t.selectionStart === t.value.length && t.selectionEnd === t.value.length && !e.altKey && !e.metaKey) {
            e.preventDefault();
            this.props.onSpecialKey("Down");
        } else if (r === n.BACKSPACE && t.value.length === 0) {
            e.preventDefault();
            this.props.onSpecialKey("Backspace");
        } else if (r === n.DELETE && t.value.length === 0) {
            e.preventDefault();
            this.props.onSpecialKey("Delete");
        }
    }

    // 如果存在onKeydown屬性，則調用它
    if (this.props.onKeydown) {
        this.props.onKeydown(e);
    }
}

```

 