import random 

choices = ["rock", "paper", "scissor"]

player_score = 0
computer_score = 0

print("rock paper scissors game starts::::::::")
print("Enter rock, paper, or scissors")
print("Enter quit to stop the game")

while True:

    player = input("\nYour choice: ").lower().strip()

    if player == "quit":
        break

    if player not in choices:
        print("invalid choice Please enter rock, paper, or scissors.")
        continue

    computer = random.choice(choices)

    print(f"Computer Chose: {computer}")

    if player == computer:
        print("It is a draw!")

    elif ((player == "rock" and computer == "scissor") or (player == "paper" and computer == "rock") or
        (player == "scissor" and computer == "paper")
    ):
        print("You win this round!")
        player_score += 1

    else:
        print("Computer wins this round!")
        computer_score += 1

    print("\nScore")
    print("You:", player_score)
    print("Computer:", computer_score)


print("Final Score:::::::")
print("You:", player_score)
print("Computer:", computer_score)

if player_score > computer_score:
    print("Congo, You won the game!")
    
elif computer_score > player_score:
    print("Haha Loser, Computer won the game!")
    
else:
    print("Better Luck Next time, The game ended in a draw!")

print("Game Khatam")