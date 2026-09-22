const desmosAPI = document.querySelector(".dcg-calculator-api-container")
const icons_container = document.createElement('div');

desmosAPI.append(icons_container);
icons_container.classList.add("dcg-icon-btn","dcg-do-blur","dcg-btn-flat-gray","dcg-settings-pillbox")
icons_container.style.position = "fixed";
icons_container.style.left = "0";
icons_container.style.top = "0";
icons_container.style.width = "100vw";
icons_container.style.height = "100vh";
icons_container.style.overflow = "scroll";
icons_container.style.background = "white";

for (let i = 0xe200; i <= 0xe26f; i++) {
	var icons = document.createElement('i');
    const style = document.createElement('style');
    const unicode = "\\" + i.toString(16);

    icons.innerText = unicode;
	icons.classList.add(`icons-test-${i}`);
	icons.style.display = "inline-block";
	icons.style.margin = "0 10px";
	icons.style.width = "100px";
	icons.style.fontSize = "20pt";

    

    icons_container.append(icons);
    icons.append(style);
    style.innerHTML = `.icons-test-${i}:before {content: '${unicode}';}`;
}