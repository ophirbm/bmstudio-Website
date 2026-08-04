import {
    portfolio
} from './portfolio.js';

const grid = document.getElementById("gallery-grid");
var currentCategory = "";

function clearGallery(container) {

    const videos = container.querySelectorAll("video");

    videos.forEach(video => {

        video.pause();

        video.removeAttribute("src");

        video.load(); // releases decoder resources

    });


    container.innerHTML = "";

}

function loadCategory(category) {

    // grid.innerHTML = "";
    clearGallery(grid);

    currentCategory = category;
    portfolio[category].forEach(item => {
        let element;

        if (category === "videos") {
            grid.classList.add("video-grid");
            element = document.createElement("div");
            element.classList.add("gallery-item");
            element.classList.add("video-card");
            const img = document.createElement("img");

            img.src =
                `https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`;

            img.alt = item.title;

            element.appendChild(img);

            let title = document.createElement("p");
            title.classList.add("video-card-title");
            title.innerHTML = item.title;

            element.appendChild(title);

            element.addEventListener("click", () => {

                const iframe = document.createElement("iframe");

                iframe.src =
                    `https://www.youtube.com/embed/${item.youtubeId}?autoplay=1`;

                iframe.allowFullscreen = true;

                iframe.loading = "lazy";

                iframe.allow =
                    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

                iframe.referrerPolicy =
                    "strict-origin-when-cross-origin";
                iframe.className = "gallery-item";
                iframe.classList.add("video-card");

                element.replaceWith(iframe);

            });

        } else {
            grid.classList.remove("video-grid");
            if (item.includes(".mp4")) {
                element = document.createElement("video");
                element.autoplay = false;
                element.loop = true;
                element.muted = true;
                element.playsInline = true;
                element.setAttribute("playsinline", "");
                element.preload = "metadata";
                element.src = "Images/" + category + "/" + item;
                element.className = "gallery-item";
                const observer = new IntersectionObserver(entries => {

                    entries.forEach(entry => {

                        const video = entry.target;

                        if (entry.isIntersecting) {

                            video.play();

                        } else {

                            video.pause();

                        }

                    });

                });


                observer.observe(element);

            } else {

                element = document.createElement("img");

                element.className = "gallery-item";
                element.src = "Images/" + category + "/" + item;
                element.loading = "lazy";
            }

            if (category === "posters") {
                element.classList.add("poster");
            }
        }

        grid.appendChild(element);
        // if (item.includes(".webm"))element.play().catch(err => console.log(err));
    });

}

const buttons = document.querySelectorAll(".gallery-filter");

buttons.forEach(button => {

    button.addEventListener("click", () => {

        buttons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        if (currentCategory != button.dataset.category)

            changeCategory(button.dataset.category);

    });

});

buttons[0].click();

function changeCategory(category) {

    grid.classList.add("fade");

    function onFadeOut() {

        grid.removeEventListener("transitionend", onFadeOut);

        loadCategory(category);

        requestAnimationFrame(() => {
            grid.classList.remove("fade");
        });
    }

    grid.addEventListener("transitionend", onFadeOut, {
        once: true
    });

}