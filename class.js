// Jeu à faire avec des classes en JS 

// On va vouloir coder la logique du jeu en JS avec un système de classes. 

// 1) On pourra commencer par une classe Player qui contiendra toutes les infos d'un joueur et 
// ses actions possibles.

// Le seul élément hors de nos classes sera le querySelector pour notre div 
// de classe game (dans le html)

// Un player aura par défaut : 

//  - 100 de health 
//  - 100 de mana
//  - un nom
//  - une spec (guerrier, mage etc) 
//  - une méthode d'attaque qui enlève 10 à l'adversaire 
//  - une méthode getDetails qui affiche nom et spec du player
//  - une méthode createPlayer qui affichera le joueur dans le .game avec ses infos (+les boutons) 
//  - une méthode setOpponent() qui permettra de sélectionner le destinataire des attaques.  

// Dans player il y aura un constructor et dans ce constructor on appelle createPlayer()
// Quand un des player arrive à 0 de health afficher message type xxx is dead...

// 2) Créer une nouvelle classe Game

// Cette classe comprendra :

//  -  méthode newGame() : affiche la page d'intro avec l'input pour le nom du héro et un select
//  pour choisir la spec du héro. Quand on appuie sur go on arrive sur la page de "combat"
//  Appuyer sur le bouton go doit aussi générer nos players ...

//  -  créer la ou les méthodes statique afin de gérer le dé. On veut que chaque fois qu'on appuie 
//  attaque le dé se lance et selon le résulatat l'attaque aboutit ou non. Pour l'effet de 
//  succession de dés on pourra utiliser setInterval, pour l'arret du dé sur une face setTimeout

// API got : https://thronesapi.com/

const game = document.querySelector('.game')

class Game {
    static new() {
        game.innerHTML = `
			<div class="intro">
				<h2>Welcome !</h2>
				<input type="text" placeholder="Enter your Hero's name">
				<p>Choose one : </p>
					<select>
						<option value="Warrior">Warrior</option>
						<option value="Wizard">Wizard</option>
						<option value="Barbarian">Barbarian</option>
						<option value="Archer">Archer</option>
						<option value="Mercenary">Mercenary</option>
						<option value="Rogue">Rogue</option>
					</select>
				<button>Go</button>
			</div>
        `
        const btn = document.querySelector('button')

        btn.addEventListener('click', () => {
            const name = document.querySelector('input').value
            const spec = document.querySelector('select').value

			
			const fight = document.createElement('div')
			fight.classList.add('fight')
			
			if (name.length > 0) {
				game.innerHTML = "<div class='zone'></div>"
				axios.get('https://thronesapi.com/api/v2/Characters')
				.then(res => {
					console.log(res.data)
					const player1 = new Player(name, spec, 'assets/web-dev.png')
					const img = document.createElement('img')
					img.src = `assets/VS.png`
					fight.appendChild(player1.div)
					fight.appendChild(img)
					const characters = res.data
					const randomIndex = Math.floor(Math.random() * characters.length)
					const randomCharacter = characters[randomIndex]
					const randomCharacterImage = randomCharacter.imageUrl
					const player2 = new Player(randomCharacter.fullName, randomCharacter.title, randomCharacterImage)
					
					fight.appendChild(player2.div)
					player1.setOpponent(player2)
					player2.setOpponent(player1)
					return player1, player2
				})
				.catch(err => {
					console.error(err)
				})
				game.appendChild(fight)
			} else {
				const error = document.createElement('h2')
				error.textContent = 'Please give a name'
				if (error) {
					return
				} else {
					game.appendChild(error)
				}
			}
        })
    }

    static newDice() {
        // On crée le dé 
        const dice = document.createElement('img')
        dice.classList.add('dice')

        // On crée le chiffre aléatoire
        const random = Math.floor(Math.random() * 6) + 1

        // On donne comme source une face aléatoire 
        dice.src = `./assets/dice-six-faces-${random}.png`

        return dice 
    }

    static rollDice() {
        const zone = document.querySelector('.zone')
        let newDice = this.newDice()

        zone.innerHTML = newDice.outerHTML

        const interval = setInterval(() => {
            const dice = this.newDice()
            const img = document.querySelector('img')
            img.src = dice.src
        }, 80)

        setTimeout(() => {
            clearInterval(interval)
        }, 1500)
    }
}
 
class Player {
    constructor(name, specialisation, avatar) {
        this.name = name
        this.specialisation = specialisation
        this.health = 100
        this.mana = 100
		this.opponent = null
		this.avatar = avatar
        this.div = this.createPlayer()
    }

    attack() {
        if (this.opponent.health > 10) {
            this.opponent.health -= 10
			this.mana += 10
            this.opponent.div.querySelector('.health').textContent = `${this.opponent.health}`
			this.div.querySelector('.mana').textContent = `${this.mana}`
        } else {
            this.opponent.div.innerHTML = `<h2 style="color: darkred">${this.opponent.name} is DEAD ...</h2>`
        }
    }

    spAttack() {
		if (this.opponent.health > 10) {
			this.opponent.health -= 50
            this.opponent.div.querySelector('.health').textContent = `${this.opponent.health}`
			this.div.querySelector('.mana').textContent = `${this.mana}`
        } else {
			this.opponent.div.innerHTML = `<h2 style="color: darkred">${this.opponent.name} is DEAD ...</h2>`
        }
    }
	
	failSpAttack() {
		this.health -= 30
		this.div.querySelector('.health').textContent = `${this.health}`
	}
   
    createPlayer() {
        const div = document.createElement('div')
		const zone = document.querySelector('.zone')
		div.classList.add(`player`)

        div.innerHTML = `
			<img src="${this.avatar}" alt="avatar" class="avatar">
            <h2>${this.getDetails()}</h2>
            <p>Health: <span class="health">${this.health}</span></p>
            <p>Mana: <span class="mana">${this.mana}</span></p>
            <button class="attack">Attack</button>
            <button class="specialAttack">Special Attack</button>
        `
        const attackButton = div.querySelector('.attack')
		const spButton = div.querySelector('.specialAttack')

        attackButton.addEventListener('click', () => {
			this.div.style.border = '2px solid rgb(100, 100, 255)'
            Game.rollDice()

            setTimeout(() => {
                const dice = document.querySelector('img')
                const number = dice.src.slice(-5, -4)
                console.log(number)

                if (number > 3) {
                    this.attack()
                    zone.innerHTML += `<h2 style="color: darkgreen">Success !</h2>`
                } else {
                    zone.innerHTML += `<h2 style="color: darkred">Fail to attack ...</h2>`
					console.log(this.opponent.health)
                }
				this.div.style.border = 'solid 2px rgb(162, 195, 216)'
            }, 1600)
        })

		spButton.addEventListener('click', () =>{
			if (this.mana >= 50) {
				this.mana -= 50
				this.div.style.border = '2px solid rgb(100, 100, 255)'
            	Game.rollDice()

            	setTimeout(() => {
                	const dice = document.querySelector('img')
					const number = dice.src.slice(-5, -4)
					console.log(number)

						if (number > 3) {
							this.spAttack()
							zone.innerHTML += `<h2 style="color: darkgreen">Success !</h2>`
						} else {
							zone.innerHTML += `<h2 style="color: darkred">Fail to attack ...</h2>`
							this.failSpAttack()
						}
						this.div.style.border = 'solid 2px rgb(162, 195, 216)'
					}, 1600)
				this.div.querySelector('.mana').textContent = `${this.mana}`
			} else {
				this.div.innerHTML += `<h2 style="color: darkred">No mana</h2>`
			}
		})
 
        game.appendChild(div)
        return div
    }

    setOpponent(opponentPlayer) {
        this.opponent = opponentPlayer
    }

    getDetails() {
        return `${this.name}, ${this.specialisation}`
    }
}
 
Game.new()