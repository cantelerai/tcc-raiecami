// Script para funcionalidades do site
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar automaticamente o ano no footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('nav ul');
    
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('show');
    });
    
    // Smooth scrolling para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Fechar menu mobile após clicar em um link
                navMenu.classList.remove('show');
            }
        });
    });
    
    // Formulário de contato
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simular envio do formulário
            const formData = new FormData(this);
            const formValues = Object.fromEntries(formData.entries());
            
            // Aqui você normalmente enviaria os dados para um servidor
            console.log('Dados do formulário:', formValues);
            
            // Feedback para o usuário
            alert('Obrigado por sua mensagem! Entraremos em contato em breve.');
            this.reset();
        });
    }
    
    // Botão de doação
    const donationButton = document.createElement('button');
    donationButton.innerHTML = '<i class="fas fa-donate"></i> Doar';
    donationButton.classList.add('btn');
    donationButton.style.position = 'fixed';
    donationButton.style.bottom = '20px';
    donationButton.style.right = '20px';
    donationButton.style.zIndex = '1000';
    donationButton.style.backgroundColor = 'var(--accent)';
    donationButton.onclick = function() {
        alert('Obrigado por sua doação! Em uma versão completa, isso abriria um formulário de doação seguro.');
    };
    document.body.appendChild(donationButton);
    
    // Destaque do menu ativo durante a rolagem
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Carregar versículo bíblico aleatório (simulação)
    const bibleVerses = [
        { text: "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.", reference: "João 3:16" },
        { text: "Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai, a não ser por mim.", reference: "João 14:6" },
        { text: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", reference: "Salmos 37:5" },
        { text: "Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.", reference: "Filipenses 4:6" }
    ];
    
    const randomVerse = bibleVerses[Math.floor(Math.random() * bibleVerses.length)];
    document.querySelector('.verse-text').textContent = `"${randomVerse.text}"`;
    document.querySelector('.verse-reference').textContent = randomVerse.reference;
    
    console.log('Aplicativo da igreja carregado com sucesso!');
});