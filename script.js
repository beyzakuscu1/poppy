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
    const btnReplay = document.getElementById('btn-replay');

    // --- MENÜ GEÇİŞLERİ ---
    btnOpenBook.addEventListener('click', () => {
        landingScreen.classList.add('hidden');
        bookScreen.classList.remove('hidden');
    });

    btnOpenPuzzle.addEventListener('click', () => {
        landingScreen.classList.add('hidden');
        puzzleScreen.classList.remove('hidden');
        initPuzzle(); // Puzzle'ı başlat
    });

    btnBackMenu.addEventListener('click', () => {
        bookScreen.classList.add('hidden');
        landingScreen.classList.remove('hidden');
    });

    btnBackMenuPuzzle.addEventListener('click', () => {
        puzzleScreen.classList.add('hidden');
        landingScreen.classList.remove('hidden');
        winnerModal.classList.add('hidden');
        // Puzzle ekranından çıkınca sıfırlamak için sayfayı yenileyelim mi?
        // Şimdilik gerek yok ama istersen location.reload() ekleyebilirsin.
    });

    if(btnReplay) {
        btnReplay.addEventListener('click', () => {
            location.reload();
        });
    }

    // --- KİTAP KODLARI ---
    const prevBtn = document.querySelector('#prev-btn');
    const nextBtn = document.querySelector('#next-btn');
    const papers = document.querySelectorAll('.paper');
    
    const mobileImg = document.getElementById('mobile-current-img');
    const pageIndicator = document.getElementById('page-indicator');
    
    let allImages = [];
    papers.forEach(p => {
        const fImg = p.querySelector('.front img');
        const bImg = p.querySelector('.back img');
        if(fImg) allImages.push(fImg.src);
        if(bImg) allImages.push(bImg.src);
    });

    let currentPaper = 1; 
    let currentImageIndex = 0; 
    let numOfPapers = papers.length;
    let maxPaper = numOfPapers + 1;

    function initBook() {
        papers.forEach((paper, index) => { 
            paper.style.zIndex = numOfPapers - index; 
        });
        if(allImages.length > 0) updateMobileView();
    }

    function updateMobileView() {
        if(mobileImg && allImages.length > 0) {
            mobileImg.src = allImages[currentImageIndex];
            if(pageIndicator) {
                pageIndicator.textContent = `${currentImageIndex + 1} / ${allImages.length}`;
            }
        }
    }

    function isMobileDevice() { return window.innerWidth <= 768; }

    nextBtn.addEventListener('click', () => {
        if (isMobileDevice()) {
            if (currentImageIndex < allImages.length - 1) {
                currentImageIndex++;
                updateMobileView();
            }
        } else {
            if(currentPaper < maxPaper) {
                let activePaper = papers[currentPaper - 1];
                activePaper.classList.add('flipped');
                activePaper.style.zIndex = currentPaper; 
                currentPaper++;
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        if (isMobileDevice()) {
            if (currentImageIndex > 0) {
                currentImageIndex--;
                updateMobileView();
            }
        } else {
            if(currentPaper > 1) {
                let previousPaper = papers[currentPaper - 2];
                previousPaper.classList.remove('flipped');
                previousPaper.style.zIndex = numOfPapers - (currentPaper - 2);
                currentPaper--;
            }
        }
    });

    initBook();

    // -----------------------------------------------------
    // --- PUZZLE KISMI (MOBİL UYUMLU MATEMATİK) ---
    // -----------------------------------------------------
    let isPuzzleInitialized = false;
    const rows = 4;
    const cols = 6;

    function initPuzzle() {
        if(isPuzzleInitialized) return;

        const board = document.getElementById('puzzle-board');
        const repo = document.getElementById('piece-repository');
        
        board.innerHTML = '';
        repo.innerHTML = '';

        const pieces = [];

        repo.addEventListener('dragover', (e) => e.preventDefault());
        repo.addEventListener('drop', handleDrop);

        // SENİN RESMİN:
        const puzzleImageSrc = 'img/puzzle-full.jpeg'; 

        // --- MOBİL KONTROLÜ ---
        // Eğer ekran 768px'den küçükse parçalar 50px, değilse 100px
        const isMobile = window.innerWidth <= 768;
        const pieceSize = isMobile ? 50 : 100; 
        
        // Resim boyutu (background-size)
        // Desktop: 6 sütun * 100 = 600px genişlik
        // Mobile: 6 sütun * 50 = 300px genişlik
        const bgWidth = cols * pieceSize;
        const bgHeight = rows * pieceSize;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let id = r * cols + c + 1;

                // 1. SLOT OLUŞTUR
                let slot = document.createElement('div');
                slot.classList.add('puzzle-slot');
                slot.dataset.expectedId = id;
                // Slot boyutu JS ile de zorlayalım
                slot.style.width = pieceSize + 'px';
                slot.style.height = pieceSize + 'px';
                
                slot.addEventListener('dragover', (e) => e.preventDefault());
                slot.addEventListener('drop', handleDrop);
                board.appendChild(slot);

                // 2. PARÇA OLUŞTUR
                let piece = document.createElement('div');
                piece.classList.add('puzzle-piece');
                piece.draggable = true;
                piece.dataset.id = id;

                // Parça boyutu
                piece.style.width = pieceSize + 'px';
                piece.style.height = pieceSize + 'px';

                // Arka Plan Resmi Ayarları
                piece.style.backgroundImage = `url('${puzzleImageSrc}')`;
                piece.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
                
                // Koordinat Hesaplama (Mobil için 50 şer, PC için 100 er atla)
                let posX = c * -pieceSize; 
                let posY = r * -pieceSize;
                piece.style.backgroundPosition = `${posX}px ${posY}px`;

                piece.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', id);
                    setTimeout(() => piece.classList.add('dragging'), 0);
                });
                piece.addEventListener('dragend', () => {
                    piece.classList.remove('dragging');
                });
                
                pieces.push(piece);
            }
        }

        pieces.sort(() => Math.random() - 0.5);
        pieces.forEach(p => repo.appendChild(p));
        isPuzzleInitialized = true;
    }

    function handleDrop(e) {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedElement = document.querySelector(`.puzzle-piece[data-id='${draggedId}']`);
        
        if(!draggedElement) return;

        let target = e.target;

        // Havuza geri bırakma
        if (target.id === 'piece-repository' || target.closest('#piece-repository')) {
            const repo = document.getElementById('piece-repository');
            repo.appendChild(draggedElement);
            resetPieceStyle(draggedElement);
            return;
        }

        // Slota bırakma
        let slot = target.classList.contains('puzzle-slot') ? target : target.closest('.puzzle-slot');

        if (slot) {
            if (slot.children.length === 0) {
                slot.appendChild(draggedElement);
                lockPieceInSlot(draggedElement);
                checkWin();
            }
        }
    }

    function resetPieceStyle(el) {
        // Havuza dönünce tekrar doğru boyuta getir
        const isMobile = window.innerWidth <= 768;
        const size = isMobile ? '50px' : '100px';
        
        el.style.position = 'relative';
        el.style.top = 'auto';
        el.style.left = 'auto';
        el.style.width = size;
        el.style.height = size;
    }

    function lockPieceInSlot(el) {
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.width = '100%';
        el.style.height = '100%';
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

        if(correctCount === rows * cols) { 
            setTimeout(() => {
                winnerModal.classList.remove('hidden');
                startConfetti();
            }, 300);
        }
    }

    function startConfetti() {
        const container = document.getElementById('confetti-container');
        if(!container) return;
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

// script.js'in EN ALTINA ekle:

let lastWidth = window.innerWidth;

window.addEventListener('resize', () => {
    // Eğer genişlik ciddi şekilde değiştiyse (mobil/masaüstü geçişi gibi)
    if (window.innerWidth !== lastWidth) {
        // Özellikle 768px sınırını geçince yenilemek en sağlıklısı
        if ((lastWidth > 768 && window.innerWidth <= 768) || 
            (lastWidth <= 768 && window.innerWidth > 768)) {
            location.reload();
        }
        lastWidth = window.innerWidth;
    }
});