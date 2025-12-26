document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTLER ---
    const landingScreen = document.getElementById('landing-screen');
    const bookScreen = document.getElementById('book-screen');
    const puzzleScreen = document.getElementById('puzzle-screen');
    const winnerModal = document.getElementById('winner-modal');

    const btnOpenBook = document.getElementById('btn-open-book');
    const btnOpenPuzzle = document.getElementById('btn-open-puzzle');
    const btnBackMenu = document.getElementById('back-to-menu');
    const btnBackMenuPuzzle = document.getElementById('back-to-menu-puzzle');

    // --- PUZZLE AYARLARI ---
    const rows = 3;
    const cols = 3;
    const pieceSize = 120; 
    const puzzleImageSrc = 'img/puzzle-full.jpg'; // RESMİ BURAYA KOY

    // --- MENÜ GEÇİŞLERİ ---
    btnOpenBook.addEventListener('click', () => {
        landingScreen.classList.add('hidden');
        bookScreen.classList.remove('hidden');
    });

    btnOpenPuzzle.addEventListener('click', () => {
        landingScreen.classList.add('hidden');
        puzzleScreen.classList.remove('hidden');
        initPuzzle();
    });

    btnBackMenu.addEventListener('click', () => {
        bookScreen.classList.add('hidden');
        landingScreen.classList.remove('hidden');
    });

    btnBackMenuPuzzle.addEventListener('click', () => {
        puzzleScreen.classList.add('hidden');
        landingScreen.classList.remove('hidden');
        winnerModal.classList.add('hidden');
    });

    // --- KİTAP KODLARI (ESKİ SİSTEM) ---
    const prevBtn = document.querySelector('#prev-btn');
    const nextBtn = document.querySelector('#next-btn');
    const book = document.querySelector('#book');
    const papers = document.querySelectorAll('.paper');
    
    if(papers.length > 0) {
        let currentLocation = 1;
        let numOfPapers = papers.length;
        let maxLocation = numOfPapers + 1;
        
        // Z-Index Başlat
        papers.forEach((paper, index) => { 
            paper.style.zIndex = numOfPapers - index; 
        });

        nextBtn.addEventListener('click', () => {
            if(currentLocation < maxLocation) {
                let currentPaper = papers[currentLocation - 1];
                currentPaper.classList.add('flipped');
                currentPaper.style.zIndex = currentLocation; 
                if(currentLocation === 1) book.style.transform = "translateX(50%)";
                currentLocation++;
            }
        });

        prevBtn.addEventListener('click', () => {
            if(currentLocation > 1) {
                let previousPaper = papers[currentLocation - 2];
                previousPaper.classList.remove('flipped');
                previousPaper.style.zIndex = numOfPapers - (currentLocation - 2);
                if(currentLocation === 2) book.style.transform = "translateX(0%)";
                currentLocation--;
            }
        });
    }

    // -----------------------------------------------------
    // --- PUZZLE MANTIĞI ---
    // -----------------------------------------------------
    let isPuzzleInitialized = false;

    function initPuzzle() {
        if(isPuzzleInitialized) return;

        const board = document.getElementById('puzzle-board');
        const repo = document.getElementById('piece-repository');
        board.innerHTML = '';
        repo.innerHTML = '';

        const pieces = [];

        // 1. REPOSITORY'E SÜRÜKLE BIRAK ÖZELLİĞİ EKLE
        // (Parçayı geri koyabilmek için)
        repo.addEventListener('dragover', (e) => e.preventDefault());
        repo.addEventListener('drop', handleDrop);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let id = r * cols + c + 1;

                // Slot Oluştur
                let slot = document.createElement('div');
                slot.classList.add('puzzle-slot');
                slot.dataset.expectedId = id;
                slot.addEventListener('dragover', (e) => e.preventDefault());
                slot.addEventListener('drop', handleDrop);
                board.appendChild(slot);

                // Parça Oluştur
                let piece = document.createElement('div');
                piece.classList.add('puzzle-piece');
                piece.classList.add(`shape-${id}`); // Şekil sınıfı
                piece.draggable = true;
                piece.dataset.id = id;

                // Resmi Ayarla
                piece.style.backgroundImage = `url(${puzzleImageSrc})`;
                piece.style.backgroundSize = `${cols * pieceSize}px ${rows * pieceSize}px`;
                let bgX = -(c * pieceSize); 
                let bgY = -(r * pieceSize);
                piece.style.backgroundPosition = `${bgX}px ${bgY}px`;

                // Sürükleme
                piece.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text', id);
                    setTimeout(() => piece.style.opacity = '0.5', 0);
                });
                piece.addEventListener('dragend', () => {
                    piece.style.opacity = '1';
                });

                pieces.push(piece);
            }
        }

        pieces.sort(() => Math.random() - 0.5);
        pieces.forEach(p => repo.appendChild(p));
        isPuzzleInitialized = true;
    }

    // GÜNCELLENMİŞ DROP FONKSİYONU
    function handleDrop(e) {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text');
        const draggedElement = document.querySelector(`.puzzle-piece[data-id='${draggedId}']`);
        
        // Bırakılan yer neresi? (Hedef)
        let target = e.target;

        // EĞER REPOSITORY'E (GERİ) BIRAKILIYORSA
        if (target.id === 'piece-repository' || target.closest('#piece-repository')) {
            const repo = document.getElementById('piece-repository');
            repo.appendChild(draggedElement);
            // Pozisyon ayarlarını sıfırla ki listeye düzgün girsin
            draggedElement.style.position = 'relative';
            draggedElement.style.top = 'auto';
            draggedElement.style.left = 'auto';
            draggedElement.style.margin = '0';
            return;
        }

        // EĞER SLOT'A BIRAKILIYORSA
        // Bazen e.target direkt slot değil, içindeki parça olabilir, closest ile slotu bulalım
        let slot = target.classList.contains('puzzle-slot') ? target : target.closest('.puzzle-slot');

        if (slot && slot.children.length === 0) {
            slot.appendChild(draggedElement);
            // Slot içine tam oturt
            draggedElement.style.position = 'absolute';
            draggedElement.style.top = '0';
            draggedElement.style.left = '0';
            draggedElement.style.margin = '0';
            checkWin();
        }
    }

    function checkWin() {
        const slots = document.querySelectorAll('.puzzle-slot');
        let correctCount = 0;
        slots.forEach(slot => {
            if(slot.children.length > 0) {
                const piece = slot.children[0];
                if(slot.dataset.expectedId === piece.dataset.id) {
                    correctCount++;
                }
            }
        });

        if(correctCount === 9) {
            setTimeout(() => {
                winnerModal.classList.remove('hidden');
                startConfetti();
            }, 300);
        }
    }

    function startConfetti() {
        const container = document.getElementById('confetti-container');
        const colors = ['#f39c12', '#e74c3c', '#8e44ad', '#3498db', '#2ecc71'];
        for(let i=0; i<100; i++) {
            const conf = document.createElement('div');
            conf.classList.add('confetti');
            conf.style.left = Math.random() * 100 + 'vw';
            conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            conf.style.animationDuration = (Math.random() * 3 + 2) + 's';
            container.appendChild(conf);
            setTimeout(() => conf.remove(), 5000);
        }
    }
});