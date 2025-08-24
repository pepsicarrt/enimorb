(() => {
    const { api, api2, target: selectortarget } = document.currentScript.dataset;

    const target = document.querySelector(selectortarget);

    if (!target) {
        console.error("Target container not found:", selectortarget);
        return;
    }

    target.innerHTML = "<p style='text-align: center; font-family: sans-serif; color: #555;'>Loading games...</p>";

    const fetchGames = async () => {
        try {
            const response1 = await fetch(`${api}/g.json`);
            const games1 = await response1.json();

            const response2 = await fetch(`${api2}/g.json`);
            const games2 = await response2.json();

            const allGames = [
                ...games1.map(g => ({ ...g, apiUrl: api })),
                ...games2.map(g => ({ ...g, apiUrl: api2 }))
            ];
            return { status: 'success', data: allGames };
        } catch (err) {
            console.error("Error fetching games directly:", err);
            return { status: 'error', error: err.message };
        }
    };

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
            overflow: auto; /* Allow scrolling within game page */
        ">
            <button onclick="closegame()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 10px 15px;
                font-size: 16px;
                cursor: pointer;
                background-color: #dc3545;
                color: white;
                border: none;
                border-radius: 5px;
                z-index: 1000;
            ">Close Game</button>
            <h2 id="gamePageTitle" style="margin-top: 20px; color: #333;"></h2>
            <iframe id="gamePageFrame" src="" frameborder="0" style="
                width: 100%;
                height: calc(100% - 70px); /* Adjust height for title and close button */
                border: none;
                margin-top: 10px;
            "></iframe>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', gamePageContainerHtml);


    fetchGames().then(result => {
        const { status, data: allGames, error } = result;

        if (status === 'error') {
            target.innerHTML = "<p style='color:red; text-align: center; font-family: sans-serif;'>Error loading games. Please try again later.</p>";
            console.error("Error fetching games:", error);
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
    });


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
