class GlassCarousel {

    constructor(options = {}) {

        // Default options
        this.options = {
            container: "",
            data: [],
            render: item => `<div>${item}</div>`,

            visibleCards: 3,

            autoPlay: true,
            interval: 5000,

            infinite: true,

            showArrows: true,
            showDots: true,

            swipe: true,
            keyboard: true,

            perspective: 1200,

            cardSpacing: 320,
            sideScale: 0.78,
            sideRotation: 28,
            sideOpacity: 0.45,
            sideBlur: 3,

            ...options
        };

        // Container element
        this.container =
            document.querySelector(this.options.container);

        if (!this.container)
            throw new Error(
                `GlassCarousel: container "${this.options.container}" not found.`
            );

        // State
        this.current = 0;

        this.cards = [];

        this.maxVisibleOffset = 2;

        this.dots = [];

        this.timer = null;

        this.root = null;
        this.viewport = null;
        this.track = null;

        this.dragging = false;
        this.dragStartX = 0;
        this.dragEndX = 0;

        this.init();

    }

    init() {

        this.build();
        this.bindEvents();
        this.update();
        this.startAutoplay();

    }

    build() {

        this.container.innerHTML = "";

        this.root = document.createElement("div");
        this.root.className = "gc";

        this.viewport = document.createElement("div");
        this.viewport.className = "gc-viewport";

        this.track = document.createElement("div");
        this.track.className = "gc-track";

        this.viewport.appendChild(this.track);
        this.root.appendChild(this.viewport);

        this.container.appendChild(this.root);

        this.createCards();

        if (this.options.showArrows)
            this.createNavigation();

        if (this.options.showDots)
            this.createDots();

        this.root.tabIndex = 0;

    }

    createNavigation() {

        this.prevButton = document.createElement("button");
        this.nextButton = document.createElement("button");

        this.prevButton.className = "gc-arrow gc-prev";
        this.nextButton.className = "gc-arrow gc-next";

        this.prevButton.innerHTML = "❮";
        this.nextButton.innerHTML = "❯";

        this.prevButton.setAttribute(
            "aria-label",
            "Previous slide"
        );


        this.nextButton.setAttribute(
            "aria-label",
            "Next slide"
        );

        this.root.appendChild(this.prevButton);
        this.root.appendChild(this.nextButton);

    }

    createDots() {

        this.dotContainer = document.createElement("div");

        this.dotContainer.className = "gc-dots";

        this.root.appendChild(this.dotContainer);

        this.dots = [];

        this.options.data.forEach((item, index) => {

            const dot = document.createElement("button");

            dot.className = "gc-dot";

            dot.setAttribute(
                "aria-label",
                `Go to slide ${index + 1}`
            );

            this.dotContainer.appendChild(dot);

            this.dots.push(dot);

        });

    }

    update() {

        const total = this.cards.length;

        this.cards.forEach((card, index) => {

            let offset = index - this.current;

            if (offset > total / 2)
                offset -= total;

            if (offset < -total / 2)
                offset += total;

            this.positionCard(card, offset);

        });

        this.updateDots();

        // this.updateHeight();

    }

    updateDots() {

        if (!this.dots.length)
            return;

        this.dots.forEach((dot, index) => {

            dot.classList.toggle(
                "active",
                index === this.current
            );

        });

    }

    createCards() {

        this.cards = [];

        this.options.data.forEach(item => {

            const card = document.createElement("div");

            card.dataset.index = this.cards.length;

            card.className = "gc-card";

            card.innerHTML = `
    <div class="gc-content">
        ${this.options.render(item)}
    </div>
`;

            this.track.appendChild(card);

            this.cards.push(card);

            card.addEventListener("click", () => {

                const index = Number(card.dataset.index);

                if (index !== this.current)
                    this.goTo(index);


            });

        });

    }

    positionCard(card, offset) {

        const abs = Math.abs(offset);

        if (abs > this.maxVisibleOffset) {

            card.style.opacity = 0;

            card.style.pointerEvents = "none";

            return;

        }

        const scale =
            offset === 0 ?
            1 :
            this.options.sideScale;

        const x =
            offset * this.options.cardSpacing;

        const rotation = -offset * this.options.sideRotation;

        const opacity =
            offset === 0 ?
            1 :
            this.options.sideOpacity - (abs * 0.05);

        const blur =
            offset === 0 ?
            0 :
            abs * this.options.sideBlur;

        card.style.pointerEvents = "auto";

        card.style.zIndex =
            100 - abs;

        card.style.opacity =
            opacity;

        card.style.filter =
            `blur(${blur}px)`;

        card.classList.toggle(
            "active",
            offset === 0
        );

        card.style.transform = `
    translate(-50%, -50%)
    translateX(${x}px)
    rotateY(${rotation}deg)
    scale(${scale})
`;;

    }

    next() {

        this.goTo(this.current - 1);

    }

    previous() {

        this.goTo(this.current + 1);

    }

    goTo(index) {

        const total = this.cards.length;

        if (this.options.infinite) {

            this.current = (index + total) % total;

        } else {

            this.current = Math.max(
                0,
                Math.min(index, total - 1)
            );

        }

        this.update();

        if (this.options.autoPlay) {

            this.stopAutoplay();

            this.startAutoplay();

        }

    }

    bindEvents() {

        if (this.prevButton)
            this.prevButton.addEventListener(
                "click",
                () => this.previous()
            );

        if (this.nextButton)
            this.nextButton.addEventListener(
                "click",
                () => this.next()
            );

        this.dots.forEach((dot, index) => {

            dot.addEventListener(
                "click",
                () => this.goTo(index)
            );

        });

        this.root.addEventListener("mouseenter", () => {

            this.stopAutoplay();

        });

        this.root.addEventListener("mouseleave", () => {

            this.startAutoplay();

        });

        if (this.options.swipe)
            this.bindSwipe();

    }

    bindSwipe() {

        const start = x => {

            this.dragging = true;

            this.dragStartX = x;

        };

        const end = x => {

            if (!this.dragging)
                return;

            this.dragging = false;

            this.dragEndX = x;

            const diff =
                this.dragEndX - this.dragStartX;

            if (Math.abs(diff) < 60)
                return;

            if (diff > 0)
                this.next();
            else
                this.previous();

        };

        this.root.addEventListener(
            "mousedown",
            e => start(e.clientX)
        );

        window.addEventListener(
            "mouseup",
            e => end(e.clientX)
        );

        this.root.addEventListener(
            "touchstart",
            e => start(e.touches[0].clientX)
        );

        this.root.addEventListener(
            "touchend",
            e => end(e.changedTouches[0].clientX)
        );

    }

    startAutoplay() {

        if (!this.options.autoPlay)
            return;

        this.stopAutoplay();

        this.timer = setInterval(() => {

            this.next();

        }, this.options.interval);

    }

    stopAutoplay() {

        if (this.timer) {

            clearInterval(this.timer);

            this.timer = null;

        }

    }

    updateHeight() {

        const activeCard =
            this.cards[this.current];

        if (!activeCard)
            return;


        const height =
            activeCard.scrollHeight;


        this.viewport.style.height =
            `${height+10}px`;

    }

    play() {

        this.startAutoplay();

    }

    pause() {

        this.stopAutoplay();

    }

    destroy() {

        this.stopAutoplay();

        this.container.innerHTML = "";

    }

}


export default GlassCarousel;