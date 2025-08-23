(() => {
    const { api, api2, target: selectortarget } = document.currentScript.dataset;

    const target = document.querySelector(selectortarget);

    if (!target) {
        console.error("Target container not found:", selectortarget);
        return;
    }

    target.innerHTML = "<p style='text-align: center; font-family: sans-serif; color: #555;'>Loading games...</p>";

    const worker = new Worker('workers/games.js');

    worker.postMessage({ api, api2 });

    worker.onmessage = (event) => {
        const { status, data: allGames, error } = event.data;

        if (status === 'error') {
            target.innerHTML = "<p style='color:red; text-align: center; font-family: sans-serif;'>Error loading games. Please try again later.</p>";
            console.error("Error from worker:", error);
            return;
        }

        let currentPage = 1;
        const gamesPerPage = 20;

        const renderGames = () => {
            const startIndex = (currentPage - 1) * gamesPerPage;
            const gamesToShow = allGames.slice(startIndex, startIndex + gamesPerPage);
            const totalPages = Math.ceil(allGames.length / gamesPerPage);

            const gamesHtml = gamesToShow.map(game => `
                <div
                  onclick="opengame('${game.apiUrl}', '${game.alt}', '${game.title}')"
                  class="bg-base border border-overlay rounded-xl p-3 m-2 inline-block w-48 text-center shadow-sm transition-transform duration-200 hover:scale-105 cursor-pointer"
                >
                  <img
                    src="${game.apiUrl}/images/${game.alt}.webp"
                    alt="${game.title} thumbnail"
                    class="w-full h-28 object-cover rounded-md"
                    onerror="this.onerror=null;this.src='https://placehold.co/200x120/cccccc/333333?text=No+Image';"
                  />
                  <h3 class="mt-2 font-medium text-text truncate">${game.title}</h3>
                </div>
            `).join('');

            const paginationHtml = `
                <div id="pagination-controls" style="text-align: center; margin-top: 20px; width: 100%;">
                    <button id="prev-page" ${currentPage === 1 ? 'disabled' : ''} style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: ${currentPage === 1 ? '#ccc' : '#007bff'}; color: white; border: none; border-radius: 5px; margin-right: 10px;">Previous</button>
                    <span style="margin: 0 10px; font-family: sans-serif;">Page ${currentPage} of ${totalPages}</span>
                    <button id="next-page" ${currentPage < totalPages ? '' : 'disabled'} style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: ${currentPage < totalPages ? '#007bff' : '#ccc'}; color: white; border: none; border-radius: 5px; margin-left: 10px;">Next</button>
                </div>
            `;

            target.innerHTML = `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; padding: 10px;">${gamesHtml}</div>${paginationHtml}`;
        };

        target.addEventListener('click', (event) => {
            const totalPages = Math.ceil(allGames.length / gamesPerPage);
            if (event.target.id === 'prev-page' && currentPage > 1) {
                currentPage--;
                renderGames();
            }
            if (event.target.id === 'next-page' && currentPage < totalPages) {
                currentPage++;
                renderGames();
            }
        });

        renderGames();

        const gamePageContainerHtml = `
            <div id="gamePageContainer" style="
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: #fff;
                z-index: 999;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding: 20px;
                box-sizing: border-box;
            ">
        `;
        document.body.insertAdjacentHTML('beforeend', gamePageContainerHtml);
    };

    worker.onerror = (error) => {
        target.innerHTML = "<p style='color:red; text-align: center; font-family: sans-serif;'>Error loading games. Please try again later.</p>";
        console.error("Worker error:", error);
    };


    window.opengame = (apiUrl, alt, title) => {
        const gamePageContainer = document.getElementById("gamePageContainer");
        const gamePageFrame = document.getElementById("gamePageFrame");
        const gamePageTitle = document.getElementById("gamePageTitle");

        gamePageTitle.textContent = title;
        gamePageFrame.src = `${apiUrl}/g/${alt}`;
        gamePageContainer.style.display = "flex";
        document.body.style.overflow = 'hidden';
    };

    window.closegame = () => {
        const gamePageContainer = document.getElementById("gamePageContainer");
        const gamePageFrame = document.getElementById("gamePageFrame");

        gamePageFrame.src = "";
        gamePageContainer.style.display = "none";
        document.body.style.overflow = '';
    };

})();
