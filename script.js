// Conteneur des données du jeu
let game = {
    elCurrentScore: null,
    elHiscore: null,
    elWinScore: null,
    elBtnClear: null,
    elBtnPlayAgain: null,
    elDeck: null,
    elWinPanel: null,
    cardTypes: 10,
    arrCards: [],
    storageName: 'memory-hiscore',
    canPlay: true, // Donne le droit de jouer ou non (pour gérer l'animation de tentative échouée)
    firstCard: null, // Mémorisation de la première carte d'un coup
    currentScore: 0, // Mémorisation du score actuel
    hiscore: 0, // Mémorisation du record
    timer: null, // Timer de retournement des tentatives perdantes
    showTime: 1000, // Durée d'affichage en millisecondes avant de retourner les paires perdantes
    foundPairs: 0 // Compteur de paires trouvées
};

// Mélange aléatoirement le contenu d'un tableau "arr" passé à la fonction
function shuffleArray( arr ) {

    // 1- on récupère l'index de départ du mélange, on part de la fin
    let currentIndex = arr.length - 1;

    // 2- on lance le mélange dans une boucle while qui s'arrêtera lorsque
    //      chaque élément aura été traité
    while( currentIndex >= 0 ) {
        // Nombre aléatoire de 0 à currentIndex
        let randomIndex = Math.floor( Math.random() * currentIndex );

        // Inversion des valeurs entre currentIndex et randomIndex dans le tableau
        // On prend une liste de valeurs existantes pour les remplacer par d'autres valeurs
        // [ valeurA, valeurB ] = [ valeurB, valeurA ];
        [ arr[ currentIndex ], arr[ randomIndex ] ] = [ arr[ randomIndex ], arr[ currentIndex ] ];

        // On décrémente l'index courrant
        currentIndex --;

    }

}

// Fabrique et renvoie un élément HTML représentant une carte pour le numéro donné
function getCardHTML( numeroCarte ) {
    /*
        Modèle HTML d'une carte
        
        <div class="card">
            <div class="image" style="background-image:url('./cards/card-[numeroCarte].jpg')"></div>
            <div class="back"></div>
        </div>
    */

    let elCard = document.createElement( 'div' );
    elCard.classList.add( 'card' );
    // Dataset.id crée un attribut "data-id" sur la balise
    elCard.dataset.id = numeroCarte;
    
    // Concaténer du texte avec une variable dedans - Méthode 1
    // let innerCard = '<div class="image" style="background-image:url(\'./cards/card-'+ numeroCarte + '.jpg\')"></div>'
    // Méthode 2 = avec la syntaxe templating
    let innerCard = `<div class="image" style="background-image:url('./cards/card-${numeroCarte}.jpg')"></div>`;
    innerCard += '<div class="back"></div>';

    elCard.innerHTML = innerCard;

    // Gérer le click sur la carte
    // On donne à l'écouteur une fonction déclarée à l'extérieur
    // On écrit son nom mais sans les parenthèses
    elCard.addEventListener( 'click', handlerCardClick );
    
    return elCard;
}

// Fonction qui gère le click sur une carte ("Event Handler" = "Gestionnaire d'événement")
function handlerCardClick( evt ) {
    // On récupère la carte qui a été cliquée
    /*
        - evt contient l'événement émis par le navigateur lors du clic
        - target contient la face de la carte qui a été cliquée ( dos ou l'image )
        - offsetParent contient le parent de cette face, donc la carte elle-même
    */
    let elCard = evt.target.offsetParent;

    // Si on n'a pas le droit de jouer
    if ( !game.canPlay ) {
        // on sort de la fonction
        return;
    }

    // Réinitialisation du timer
    clearTimeout( game.timer );

    // Carte non jouable ? (vrai si elle a déjà la class "flipped")
    // contains( 'une-class' ) renvoie "vrai" si l'élément possède "une-class"
    let cardIsNotPlayable = elCard.classList.contains( 'flipped' );

    // Si elle n'est pas jouable
    if ( cardIsNotPlayable ) {
        // on sort de la fonction
        return;
    }
    
    // Si oui
    // On la retourne
    elCard.classList.add( 'flipped' );

    // C'est la première carte du coup ?
    // C'est vrai lorsque la mémorisation contient null
    let cardIsFirst = game.firstCard === null;

    // Si c'est la première
    if ( cardIsFirst ) {
        // Mémorisation en récupérant l'élément HTML de la carte
        game.firstCard = elCard;

        // On sort de la fonction
        return;
    }

    // Sinon c'est qu'on est sur la deuxième
    // On incrémente le compteur de coups
    game.currentScore ++;

    // On affiche la nouvelle valeur sur la page
    game.elCurrentScore.textContent = game.currentScore;

    // Est-ce que c'est un numéro différent de la première ?
    // "vrai" lorsque le "data-id" de la carte est différent de celui de la première
    let cardIsDifferent = elCard.dataset.id !== game.firstCard.dataset.id;

    // Si la carte est différente
    if ( cardIsDifferent ) {
        // On bloque le droit de jouer
        game.canPlay = false;

        // On retourne les deux cartes du coup avec un délai de 1s
        game.timer = setTimeout( function() {
            // On retourne la carte en cours
            elCard.classList.remove( 'flipped' );

            // On retourne la première carte enregistrée
            game.firstCard.classList.remove( 'flipped' );

            // On efface la mémoire de première
            game.firstCard = null;

            // On redonne le droit de jouer
            game.canPlay = true;
        }, game.showTime );

        // on sort de la fonction
        return;
    }

    // Sinon
    // On efface la première carte mémorisée
    game.firstCard = null;

    // On incrémente le compteur de paires trouvées
    game.foundPairs ++;

    // Tout trouvé ?
    // "vrai" lorsque l'on a trouvé au moins autant de paires que de types de cartes
    let allFound = game.foundPairs >= game.cardTypes;

    // Si on n'a pas encore tout trouvé
    // "Si PAS tout trouvé"
    if( !allFound ) {

        // on sort de la fonction
        return;
    }

    // Sinon
    // On affiche le panneau "victoire"
    wonGame();

}


// Initialise le jeu et ses données
function initGame() {

    // 1- Récupération des éléments HTML fixes
    // Afficheurs de score
    game.elCurrentScore = document.getElementById( 'the-score-display' );
    game.elHiscore = document.getElementById( 'the-hiscore-display' );
    game.elWinScore = document.getElementById( 'the-win-score-display' );

    // Boutons
    game.elBtnClear = document.getElementById( 'the-clear-hiscore-button' );
    game.elBtnPlayAgain = document.getElementById( 'the-play-again-button' );

    // Panneaux
    game.elDeck = document.getElementById( 'the-deck' );
    game.elWinPanel = document.getElementById( 'the-win-panel' );


    // 2- Création des écouteurs de click sur les boutons
    // Click sur le bouton de suppression du record enregistré
    game.elBtnClear.addEventListener( 'click', function() {
        console.log( 'Effacement du record...' );
        // On supprime l'enregistrement
        localStorage.removeItem( game.storageName );

        // On met à jour la variable et l'affichage
        game.hiscore = 0;
        game.elHiscore.textContent = game.hiscore;
    } );

    // Click sur le bouton "Rejouer"
    game.elBtnPlayAgain.addEventListener( 'click', function() {
        newGame();
    } );


    // 3- Chargement du record enregistré
    // Si il n'y a pas encore d'enregistrement on obtient "null"
    let storedHiscore = localStorage.getItem( game.storageName );

    // Si on obtient null on le remplace par 0
    if( storedHiscore === null ) {
        storedHiscore = 0;
    }

    // On met à jour la variable et l'affichage du record
    game.hiscore = storedHiscore;
    game.elHiscore.textContent = game.hiscore;

    // 4- Lancement d'une partie
    newGame();

}

// Démarre une nouvelle partie
function newGame() {
    console.log( 'Partie démarrée...' );

    // 1- Réinitialisation du jeu
    // On vide le plateau de cartes et la liste
    game.elDeck.innerHTML = '';
    game.arrCards = [];

    // On vide le nombre de paires trouvées
    game.foundPairs = 0;

    // 2- Création des données des cartes
    for( let numeroCarte = 1; numeroCarte <= game.cardTypes; numeroCarte ++  ) {
        game.arrCards.push( numeroCarte, numeroCarte );
    }

    // 3- Mélange des cartes
    shuffleArray( game.arrCards );

    // 4- Affichage des cartes
    // Pour chaque numero de game.arrCards
    for( let numeroCarte of game.arrCards ) {

        // On récupère le HTML de la carte correspondant à numeroCarte
        let elCard = getCardHTML( numeroCarte );

        // On ajoute elCard aux enfants de game.elDeck
        game.elDeck.append( elCard );

    }

    // 5- Remise en état de l'affichage (cacher la victoire, réafficher le plateau, ... )
    // On remet le score à 0
    game.currentScore = 0;
    game.elCurrentScore.textContent = game.currentScore;

    // On masque le panneau victoire
    game.elWinPanel.classList.add( 'hidden' );

    // On affiche le plateau
    game.elDeck.classList.remove( 'hidden' );
}

// Affichage de la victoire
function wonGame() {
    // 1- On copie le score dans l'afficheur du panneau
    game.elWinScore.textContent = game.currentScore;

    // 2- On met à jour le record si nécessaire
    // Si le score est plus petit que le record actuel OU que le record est à 0
    if( game.currentScore < game.hiscore || game.hiscore <= 0 ) {
        game.hiscore = game.currentScore;
        game.elHiscore.textContent = game.hiscore;

        // Enregistrement du record sur le navigateur
        // On utilise le "localStorage"
        localStorage.setItem( game.storageName, game.hiscore );
    }

    // 3- On masque le plateau de jeu
    game.elDeck.classList.add( 'hidden' );

    // 4- On Affiche le panneau victoire
    game.elWinPanel.classList.remove( 'hidden' );
}

// --- Initialisation ---
initGame();
