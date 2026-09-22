function display(history, parentNode, deleteCallBack=null) {
	parentNode.innerHTML = "";
	const sortedData = Object.entries(history)
	    .map(([id, record]) => ({ id, ...record }))
	    .sort((a, b) => new Date(b["save time"]) - new Date(a["save time"]));

	const listNode = document.createElement('ul');
	sortedData.forEach(item => {
	    const listItemNode = document.createElement('li');
	    const linkItemNode = document.createElement('a');
	    const deleteBtnNote = document.createElement('button');
        deleteBtnNote.type = 'button';
        deleteBtnNote.setAttribute('aria-label', `Delete ${item.name}`);
        deleteBtnNote.title = 'Delete project';
        const deleteIcon = window.createPhysmosIcon('delete');
        deleteBtnNote.appendChild(deleteIcon);

	    linkItemNode.draggable = false;

	    linkItemNode.href = `#${item.id}`;
	    deleteBtnNote.setAttribute('data-history-id', item.id);

	    if (item.thumbnail) {
	        const image = document.createElement('img');
	        image.src = item.thumbnail;
	        image.classList.add("thumbnail")
	        image.alt = 'Thumbnail';
	        linkItemNode.appendChild(image);
	    }
	    const nameContainerNode = document.createElement('div');
	    const nameNode = document.createElement('p');
	    const timeNode = document.createElement('div');

	    listItemNode.classList.add("history");
	    linkItemNode.classList.add("history-link");
	    deleteBtnNote.classList.add("delete-history");
	    nameContainerNode.classList.add("name-container");
	    nameNode.classList.add("name");
	    timeNode.classList.add("time");

	    nameNode.innerText = `${item.name}`;
	    timeNode.innerText = `${item["save time"]}`;
	    linkItemNode.appendChild(nameContainerNode);
	    nameContainerNode.appendChild(nameNode);

	    nameContainerNode.appendChild(timeNode);
	    listItemNode.appendChild(linkItemNode);
	    listItemNode.appendChild(deleteBtnNote);
	    listNode.appendChild(listItemNode);

	    if(deleteCallBack){
		    deleteBtnNote.addEventListener("click", (e)=>{deleteCallBack(e, item.name)});
	    }

	    linkItemNode.addEventListener("click", clickHistory.bind(linkItemNode, item.id));
	});
	parentNode.appendChild(listNode);
    if (!sortedData.length) {
        const empty = document.createElement('p');
        empty.className = 'history-empty';
        empty.textContent = 'No saved projects yet.';
        parentNode.appendChild(empty);
    }
}
function clickHistory(historyId, event) {

    // 檢查是否已經是輸入框
    if (this.querySelector('input')) {
        return; // 如果已經是輸入框，則不進行任何操作
    }

    if(event.target.classList.contains('name')){
    	event.preventDefault();
	    // 將 <p> 標籤轉換為 <input>
	    const nameElement = this.querySelector('.name');
	    const inputElement = document.createElement('input');
	    inputElement.type = 'text';
	    inputElement.value = nameElement.innerText;
	    inputElement.classList.add("name");

	    // 設置失焦事件，將 <input> 轉換回 <p>
	    inputElement.addEventListener('blur', function() {
	        const pElement = document.createElement('p');
	        pElement.innerText = this.value;
	        pElement.classList.add("name");
	        this.parentNode.replaceChild(pElement, this);

	        window.opener.postMessage({
	            id: localStorage.getItem("id"),
	            history: historyId,
	            name: this.value,
	            type: 'renameHistory'
	        });
	    });

	    // 設置按下 Enter 鍵時失焦
	    inputElement.addEventListener('keydown', function(e) {
	        if (e.key === 'Enter') {
	            this.blur();
	        }
	    });

	    // 替換元素
	    nameElement.parentNode.replaceChild(inputElement, nameElement);
	    inputElement.focus(); // 將焦點設置到輸入框
    }
}






