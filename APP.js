// ==============================
// 1️⃣ Variáveis Globais
// ==============================
let wallet = null; // Solflare wallet
let jupiter = window.Jupiter; // Plugin Jupiter
let inputMint = null;   // Token a vender
let outputMint = null;  // Token a comprar

// ==============================
// 2️⃣ Seletores de elementos
// ==============================
const connectBtn = document.getElementById('connectWalletBtn');
const disconnectBtn = document.getElementById('disconnectWalletBtn');
const walletAddress = document.getElementById('walletAddress');
const sellToken = document.getElementById('sellToken');
const buyToken = document.getElementById('buyToken');
const invertBtn = document.getElementById('invertBtn');
const amountInput = document.getElementById('amount');
const priceEl = document.getElementById('price');
const minReceiveEl = document.getElementById('minReceive');
const swapBtn = document.getElementById('swapBtn');
const toggleAdvancedBtn = document.getElementById('toggleAdvancedBtn');
const advancedOptions = document.getElementById('advancedOptions');
const slippageInput = document.getElementById('slippage');
const jitoGasInput = document.getElementById('jitoGas');
const logsEl = document.getElementById('logs');

// ==============================
// 3️⃣ Funções utilitárias
// ==============================
function log(msg) {
    const time = new Date().toLocaleTimeString();
    logsEl.innerHTML += `[${time}] ${msg}<br>`;
    logsEl.scrollTop = logsEl.scrollHeight;
}

// ==============================
// 4️⃣ Conectar e desconectar Solflare
// ==============================
connectBtn.addEventListener('click', async () => {
    if (!window.solflare) return alert("Solflare não detectada!");
    wallet = window.solflare;
    await wallet.connect();
    walletAddress.innerText = wallet.publicKey.toString();
    log("Carteira conectada: " + wallet.publicKey.toString());

    initJupiter(); // Inicializa o widget Jupiter após conectar
});

disconnectBtn.addEventListener('click', async () => {
    if (!wallet) return;
    await wallet.disconnect();
    wallet = null;
    walletAddress.innerText = "Carteira não conectada";
    log("Carteira desconectada");
});

// ==============================
// 5️⃣ Alternar seção avançada
// ==============================
toggleAdvancedBtn.addEventListener('click', () => {
    advancedOptions.style.display = advancedOptions.style.display === 'none' ? 'block' : 'none';
});

// ==============================
// 6️⃣ Inverter tokens
// ==============================
invertBtn.addEventListener('click', () => {
    const tmp = sellToken.value;
    sellToken.value = buyToken.value;
    buyToken.value = tmp;
    updateMints();
});

// ==============================
// 7️⃣ Atualizar mints para Jupiter
// ==============================
function updateMints() {
    inputMint = getMint(sellToken.value);
    outputMint = getMint(buyToken.value);
    updatePrice();
}

// ==============================
// 8️⃣ Função para mapear token -> mint
// ==============================
function getMint(token) {
    switch(token) {
        case 'SOL': return 'So11111111111111111111111111111111111111112';
        case 'USDC': return 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
        case 'ZITA': return '4mafUm8PepPA3UGHkVVxe6Ew5AHMntxLefL8h2To5aLv';
    }
}

// ==============================
// 9️⃣ Inicializar Jupiter Plugin
// ==============================
function initJupiter() {
    updateMints();

    jupiter.init({
        displayMode: 'integrated',           // Mostra dentro do div
        integratedTargetId: 'jupiterWidget', // Id do div
        autoConnect: false,                   // Já conectamos manualmente
        enableWalletPassthrough: true,
        passthroughWalletContextState: wallet,
        formProps: {
            initialInputMint: inputMint,
            initialOutputMint: outputMint,
            swapMode: 'ExactInOrOut',
        },
        onSuccess: ({ txid }) => log(`Swap executado: ${txid}`),
        onSwapError: ({ error }) => log(`Erro swap: ${error}`),
        onFormUpdate: (form) => {
            // Atualiza preço e min receive
            priceEl.innerText = form.price || '—';
            minReceiveEl.innerText = form.minReceive || '—';
        }
    });

    log("Widget Jupiter inicializado");
}

// ==============================
// 10️⃣ Atualizar preço
// ==============================
function updatePrice() {
    if (!jupiter) return;
    jupiter.syncProps({
        passthroughWalletContextState: wallet
    });
}

// ==============================
// 11️⃣ Executar Swap
// ==============================
swapBtn.addEventListener('click', async () => {
    if (!wallet) return alert("Conecta a carteira primeiro!");
    const amount = parseFloat(amountInput.value);
    if (!amount || amount <= 0) return alert("Insere um valor válido");

    const slippage = parseFloat(slippageInput.value) || 0.3;
    const gas = parseFloat(jitoGasInput.value) || 0.000005;

    try {
        // Executa swap real via Jupiter plugin
        await jupiter._instance?.props?.executeSwap?.({
            amount,
            inputMint,
            outputMint,
            slippage,
            fee: gas
        });
        log(`Swap solicitado: ${amount} ${sellToken.value} -> ${buyToken.value}`);
    } catch (err) {
        log("Erro ao executar swap: " + err);
    }
});

// ==============================
// 12️⃣ Atualizações automáticas
// ==============================
sellToken.addEventListener('change', updateMints);
buyToken.addEventListener('change', updateMints);

amountInput.addEventListener('input', updatePrice);
slippageInput.addEventListener('input', updatePrice);
jitoGasInput.addEventListener('input', updatePrice);
