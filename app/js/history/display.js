function display(history, parentNode, options = {}) {
    if (typeof options === 'function') {
        options = {onDelete: options};
    }

    parentNode.innerHTML = '';
    const sortedData = Object.entries(history)
        .map(([id, record]) => ({id, ...record}))
        .sort((a, b) => new Date(b['save time']) - new Date(a['save time']));

    const listNode = document.createElement('ul');
    sortedData.forEach((item) => {
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
            image.classList.add('thumbnail');
            image.alt = 'Thumbnail';
            linkItemNode.appendChild(image);
        }

        const nameContainerNode = document.createElement('div');
        const nameNode = document.createElement('p');
        const timeNode = document.createElement('div');

        listItemNode.classList.add('history');
        linkItemNode.classList.add('history-link');
        deleteBtnNote.classList.add('delete-history');
        nameContainerNode.classList.add('name-container');
        nameNode.classList.add('name');
        timeNode.classList.add('time');

        nameNode.innerText = `${item.name}`;
        timeNode.innerText = `${item['save time']}`;
        linkItemNode.appendChild(nameContainerNode);
        nameContainerNode.appendChild(nameNode);
        nameContainerNode.appendChild(timeNode);
        listItemNode.appendChild(linkItemNode);
        listItemNode.appendChild(deleteBtnNote);
        listNode.appendChild(listItemNode);

        if (options.onDelete) {
            deleteBtnNote.addEventListener('click', (event) => {
                options.onDelete(event, item.name);
            });
        }

        linkItemNode.addEventListener('click', (event) => {
            clickHistory(event, item.id, options);
        });
    });

    parentNode.appendChild(listNode);
    if (!sortedData.length) {
        const empty = document.createElement('p');
        empty.className = 'history-empty';
        empty.textContent = 'No saved projects yet.';
        parentNode.appendChild(empty);
    }
}

function clickHistory(event, historyId, options = {}) {
    const link = event.currentTarget;

    if (link.querySelector('input')) {
        return;
    }

    if (event.target.classList.contains('name')) {
        event.preventDefault();
        const nameElement = link.querySelector('.name');
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.value = nameElement.innerText;
        inputElement.classList.add('name');

        inputElement.addEventListener('blur', function() {
            const pElement = document.createElement('p');
            pElement.innerText = this.value;
            pElement.classList.add('name');
            this.parentNode.replaceChild(pElement, this);

            if (options.onRename) {
                options.onRename(historyId, this.value);
            }
        });

        inputElement.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                this.blur();
            }
        });

        nameElement.parentNode.replaceChild(inputElement, nameElement);
        inputElement.focus();
        return;
    }

    if (options.onOpen) {
        event.preventDefault();
        options.onOpen(historyId);
    }
}
