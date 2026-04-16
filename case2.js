(function () {
    const canvas = document.getElementById("case2-demo-canvas");

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const maxMoves = 3;
    const colors = {
        red: "#ef4444",
        blue: "#3b82f6",
        yellow: "#facc15",
        green: "#22c55e"
    };
    const colorNames = {
        red: "r\u00F8d",
        blue: "bl\u00E5",
        yellow: "gul",
        green: "gr\u00F8n"
    };
    const cardWidth = 82;
    const cardHeight = 118;
    const topCardY = 130;
    const handY = 254;
    const pileX = 84;
    const familyPileX = 204;
    const maxHandGap = 15;

    let topCard;
    let hand;
    let scriptedReplies;
    let moveCount = 0;
    let statusText = "Klik p\u00E5 et kort der matcher bunken.";
    let waitingForReply = false;
    let demoEnded = false;

    function roundRect(x, y, w, h, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + w, y, x + w, y + h, radius);
        ctx.arcTo(x + w, y + h, x, y + h, radius);
        ctx.arcTo(x, y + h, x, y, radius);
        ctx.arcTo(x, y, x + w, y, radius);
        ctx.closePath();
    }

    function getHandLayout() {
        const visibleCards = Math.max(hand.length, 1);
        const freeSpace = width - 80 - visibleCards * cardWidth;
        const gap = Math.max(10, Math.min(maxHandGap, freeSpace / Math.max(visibleCards - 1, 1)));
        const totalWidth = visibleCards * cardWidth + (visibleCards - 1) * gap;

        return {
            gap,
            startX: (width - totalWidth) / 2
        };
    }

    function setupGame() {
        topCard = { color: "red", value: 8 };
        hand = [
            { color: "red", value: 3 },
            { color: "blue", value: 7 },
            { color: "yellow", value: 1 },
            { color: "green", value: 5 }
        ];
        scriptedReplies = [
            { color: "blue", value: 3, text: "Mor svarer med bl\u00E5 3." },
            { color: "yellow", value: 7, text: "Lilles\u00F8ster sender gul 7 tilbage." }
        ];
        moveCount = 0;
        statusText = "Klik p\u00E5 et kort der matcher bunken.";
        waitingForReply = false;
        demoEnded = false;
        draw();
    }

    function drawUnoCard(x, y, card, hidden) {
        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = "rgba(60, 17, 0, 0.12)";
        roundRect(0, 6, cardWidth, cardHeight, 20);
        ctx.fill();

        ctx.fillStyle = hidden ? "#201815" : colors[card.color];
        roundRect(0, 0, cardWidth, cardHeight, 20);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
        ctx.beginPath();
        ctx.ellipse(cardWidth / 2, cardHeight / 2, 25, 40, -0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = hidden ? "#fff" : "#1f1300";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText(hidden ? "UNO" : String(card.value), cardWidth / 2, 74);

        ctx.restore();
    }

    function drawOverlay() {
        if (!demoEnded) {
            return;
        }

        ctx.fillStyle = "rgba(33, 16, 0, 0.58)";
        roundRect(54, 90, width - 108, 220, 28);
        ctx.fill();

        ctx.fillStyle = "#fff7f1";
        ctx.textAlign = "center";
        ctx.font = "bold 34px Arial";
        ctx.fillText("Demoen er slut", width / 2, 170);

        ctx.font = "20px Arial";
        ctx.fillText("Klik for at starte demoen igen.", width / 2, 210);

        ctx.fillStyle = "#ef5b2b";
        roundRect(width / 2 - 104, 240, 208, 54, 18);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px Arial";
        ctx.fillText("Start igen", width / 2, 274);
    }

    function draw() {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "#646464");
        gradient.addColorStop(1, "#d64549");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#ff5b5f";
        roundRect(24, 20, width - 48, 82, 24);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.font = "bold 26px Arial";
        ctx.fillText("UNO Mobilspil Demo", 44, 52);

        ctx.font = "18px Arial";
        ctx.fillText(statusText, 44, 80);

        ctx.textAlign = "right";
        ctx.font = "bold 20px Arial";
        //ctx.fillText("Spil: " + moveCount + " / " + maxMoves, width - 44, 60);

        ctx.textAlign = "left";
        ctx.font = "bold 18px Arial";
        ctx.fillText("Bunke", pileX + 14, 118);
        ctx.fillText("Familieh\u00E5nd", familyPileX - 8, 118);
        drawUnoCard(pileX, topCardY, topCard, false);
        drawUnoCard(familyPileX, topCardY, { color: "green", value: 2 }, true);

        ctx.fillStyle = "#ffffff";
        ctx.fillText("Din h\u00E5nd", 44, 315);

        const handLayout = getHandLayout();

        hand.forEach((card, index) => {
            const x = handLayout.startX + index * (cardWidth + handLayout.gap);
            drawUnoCard(x, handY, card, false);
        });

        if (!demoEnded && !waitingForReply) {
            ctx.font = "16px Arial";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("Kun kort med samme farve eller tal virker.", 44, 392);
        }

        drawOverlay();
    }

    function finishDemo() {
        demoEnded = true;
        //statusText = "Demoen lukkede efter tre tr\u00E6k.";
        draw();
    }

    function isPlayable(card) {
        return card.color === topCard.color || card.value === topCard.value;
    }

    function cardIndexAt(x, y) {
        const handLayout = getHandLayout();

        return hand.findIndex((_, index) => {
            const cardX = handLayout.startX + index * (cardWidth + handLayout.gap);

            return (
                x >= cardX &&
                x <= cardX + cardWidth &&
                y >= handY &&
                y <= handY + cardHeight
            );
        });
    }

    function playReply() {
        const reply = scriptedReplies.shift();

        if (reply) {
            topCard = { color: reply.color, value: reply.value };
            statusText = reply.text;
            waitingForReply = false;
            draw();
        } else {
            finishDemo();
        }
    }

    canvas.addEventListener("click", (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * (width / rect.width);
        const y = (event.clientY - rect.top) * (height / rect.height);

        if (demoEnded) {
            setupGame();
            return;
        }

        if (waitingForReply) {
            return;
        }

        const index = cardIndexAt(x, y);

        if (index === -1) {
            return;
        }

        const chosenCard = hand[index];

        if (!isPlayable(chosenCard)) {
            statusText = "Det kort duer ikke. V\u00E6lg samme farve eller tal.";
            draw();
            return;
        }

        topCard = chosenCard;
        hand.splice(index, 1);
        moveCount += 1;
        statusText = "Du smed " + colorNames[chosenCard.color] + " " + chosenCard.value + ".";
        draw();

        if (moveCount >= maxMoves) {
            window.setTimeout(finishDemo, 260);
            return;
        }

        waitingForReply = true;
        statusText = "Familien spiller tilbage...";
        draw();
        window.setTimeout(playReply, 850);
    });

    setupGame();
}());
