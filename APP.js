// === CONFIG TOKENS ===
const TOKENS = {
    SOL: "So11111111111111111111111111111111111111112",
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    ZITA: "4mafUm8PepPA3UGHkVVxe6Ew5AHMntxLefL8h2To5aLv"
};

// === LOG SYSTEM ===
function log(msg) {
    const box = document.getElementById("logBox");
    box.innerHTML += `[${new Date().toLocaleTimeString()}] ${msg}<br>`;
    box.scrollTop = box.scrollHeight;
}

// === FETCH PREÇOS EM TEMPO REAL ===
async function fetchPrice(pairA, pairB, elementId) {
    try {
        const url = `https://quote-api.jup.ag/v6/quote?inputMint=${pairA}&outputMint=${pairB}&amount=1000000`;
        const r = await fetch(url);
        const data = await r.json();
        const price = data.outAmount / 1_000_000;
        document.getElementById(elementId).innerText = price.toFixed(6);
    } catch (e) {
        document.getElementById(elementId).innerText = "--";
    }
}

// Atualiza a cada 3 segundos
setInterval(() => {
    fetchPrice(TOKENS.SOL, TOKENS.USDC, "price_sol_usdc");
    fetchPrice(TOKENS.ZITA, TOKENS.USDC, "price_zita_usdc");
    fetchPrice(TOKENS.SOL, TOKENS.ZITA, "price_sol_zita");
}, 3000);

// === UI BOTÃO AVANÇADO ===
document.getElementById("toggleAdvancedBtn").onclick = () => {
    document.getElementById("advancedOptions").classList.toggle("hidden");
};

// === EVENTO DO SWAP (ainda sem execução real) ===
document.getElementById("swapBtn").onclick = () => {
    const sell = document.getElementById("sellToken").value;
    const buy = document.getElementById("buyToken").value;
    const amount = document.getElementById("sellAmount").value;
    log(`Pedido de swap: ${amount} ${sell} → ${buy}`);
};
