((context) => {
    'use strict';
    const API = {
        getCountry: (query) =>
            new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(JSON.parse(xhr.responseText));
                    }
                };
                xhr.open('GET', `https://restcountries.eu/rest/v2/name/${query}`);
                xhr.send();
            })
    }

    const App = {
        init() {
            this.debounceTimeout = null;
            this.inputElement = document.querySelector('input');
            this.resultElement = document.getElementById('search-results');
            this.searchHistoryContainer = document.getElementById('search-history-container');
            this.searchHistoryListElement = document.getElementById('search-history-list');
        },
        renderSearchResult(results) {
            results.forEach(item => {
                this.resultElement.innerHTML += `
                    <li
                        class="search-result-item"
                        onclick="App.onSearchItemClick(event)"
                        data-id="${item.alpha3Code}">
                            ${item.name}
                    </li>
                `;
            });
        },
        resetInput() {
            this.inputElement.value = '';
            this.resultElement.innerHTML = '';
            this.resultElement.style.display = 'none';
        },
        resetHistory() {
            this.searchHistoryListElement.innerHTML = '';
            this.toggleHistory();
        },
        toggleHistory() {
            let display;
            if (!this.searchHistoryListElement.childElementCount) {
                display = 'none';
            } else {
                display = 'block';
            }
            this.searchHistoryContainer.style.display = display;
        },
        onInputKeyUp(e) {
            clearTimeout(this.debounceTimeout);

            const query = e.target.value;
            this.resultElement.innerHTML = '';
            this.resultElement.style.display = 'none';

            this.debounceTimeout = setTimeout(async () => {
                if (query.length > 0) {
                    try {
                        this.results = await API.getCountry(query);
                        this.renderSearchResult(this.results);
                        this.resultElement.style.display = 'block';
                    } catch (error) {
                        this.resultElement.innerHTML = '';
                        throw (error);
                    }
                }
            }, 200);
        },
        onSearchItemClick(e) {
            const { id } = e.target.dataset;
            const item = this.results.find(item => item.alpha3Code === id);
            if (item) {
                const now = new Date().toLocaleString();
                this.searchHistoryListElement.innerHTML += `
                    <li
                        class="search-history-list-item"
                        data-id="${item.alpha3Code}">
                            <p class="search-history-list-item-title">${item.name}</p>
                            <time class="search-history-list-item-timestamp">${now}</time>
                            <span class="search-history-list-item-delete" onclick="App.onHistoryItemDeleteClick(event)"></span>
                    </li>
                `;
                this.resetInput();
                this.toggleHistory();
            }
        },
        onHistoryItemDeleteClick(e) {
            this.searchHistoryListElement.removeChild(e.target.parentElement);
            this.toggleHistory();
        }
    }

    context.App = App;

})(window);