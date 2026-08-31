from tkinter import *

screen = Tk()

screen.geometry("2000x2000")

screen.title("Aditya's GUI window")

screen.config(background = "Black")

count = 0 

label = Label(screen , 
            text = "Quiz app" , 
            font = ('Times New Roman' , 28 , 'bold') , 
            fg = "white" ,
            relief = "raised" , 
            bd = 5 , 
            padx = 10 , 
            pady = 10 , 
            )

label.grid(row=0, column=0, columnspan=4)

# 1 

label1 = Label(screen , 
            text = "1. What is the capital of India?" , 
            font = ('Times New Roman' , 14 , 'italic') , 
            fg = "white" ,
            )

label1.grid(row=1, column=0)

button1a = Button(screen, text="Mumbai" , command=lambda: check1("Mumbai"))
button1a.grid(row=2, column=0, padx=10, pady=10)

button1b = Button(screen, text="Delhi", command=lambda: check1("Delhi"))
button1b.grid(row=2, column=1, padx=10, pady=10)

button1c = Button(screen, text="Kolkata", command=lambda: check1("Kolkata"))
button1c.grid(row=2, column=2, padx=10, pady=10)

button1d = Button(screen, text="Chennai", command=lambda: check1("Chennai"))
button1d.grid(row=2, column=3, padx=10, pady=10)

c1 = "Delhi"
def check1(selected1):
    global count
    
    if selected1 == c1:
        print("Correct")
        count += 1
        
    else:
        print("Wrong")
        
# 2

label2 = Label(screen , 
            text = "2. Which planet is known as the Red Planet?" , 
            font = ('Times New Roman' , 14 , 'italic') , 
            fg = "white" ,
            )

label2.grid(row=3, column=0)

button2a = Button(screen, text="Earth", command=lambda: check2("Earth"))
button2a.grid(row=4, column=0, padx=10, pady=10)

button2b = Button(screen, text="Mars", command=lambda: check2("Mars"))
button2b.grid(row=4, column=1, padx=10, pady=10)

button2c = Button(screen, text="Jupiter", command=lambda: check2("Jupiter"))
button2c.grid(row=4, column=2, padx=10, pady=10)

button2d = Button(screen, text="Venus", command=lambda: check2("Venus"))
button2d.grid(row=4, column=3, padx=10, pady=10)

c2 = "Mars"
def check2(selected2):
    global count
    if selected2 == c2:
        print("Correct")
        count += 1 
    else:
        print("Wrong")
        
# 3 

label3 = Label(screen , 
            text = "3. 2 + 2 * 2 = ?" , 
            font = ('Times New Roman' , 14 , 'italic') , 
            fg = "white" ,
            )

label3.grid(row=5, column=0)

button3a = Button(screen, text="6", command=lambda: check3("6"))
button3a.grid(row=6, column=0, padx=10, pady=10)

button3b = Button(screen, text="8", command=lambda: check3("8"))
button3b.grid(row=6, column=1, padx=10, pady=10)

button3c = Button(screen, text="4", command=lambda: check3("4"))
button3c.grid(row=6, column=2, padx=10, pady=10)

button3d = Button(screen, text="2", command=lambda: check3("2"))
button3d.grid(row=6, column=3, padx=10, pady=10)

c3 = "6"
def check3(selected3):
    global count 
    if selected3 == c3:
        print("Correct")
        count += 1 
    else:
        print("Wrong")
        
# 4 

label4 = Label(screen , 
            text = "4. Which language is used to create AI models mostly?" , 
            font = ('Times New Roman' , 14 , 'italic') , 
            fg = "white" ,
            )

label4.grid(row=7, column=0)

button4a = Button(screen, text="HTML", command=lambda: check4("HTML"))
button4a.grid(row=8, column=0, padx=10, pady=10)

button4b = Button(screen, text="Python", command=lambda: check4("Python"))
button4b.grid(row=8, column=1, padx=10, pady=10)

button4c = Button(screen, text="CSS", command=lambda: check4("CSS"))
button4c.grid(row=8, column=2, padx=10, pady=10)

button4d = Button(screen, text="C", command=lambda: check4("C"))
button4d.grid(row=8, column=3, padx=10, pady=10)

c4 = "Python"
def check4(selected4):
    global count 
    if selected4 == c4:
        print("Correct")
        count += 1 
    else:
        print("Wrong")
        
# 5

label5 = Label(screen , 
            text = "5. Who is known as the Father of Computers?" , 
            font = ('Times New Roman' , 14 , 'italic') , 
            fg = "white" ,
            )

label5.grid(row=9, column=0, padx=10, pady=10)

button5a = Button(screen, text="Charles Babbage", command=lambda: check5("Charles Babbage"))
button5a.grid(row=10, column=0, padx=10, pady=10)

button5b = Button(screen, text="Alan Turing", command=lambda: check5("Alan Turing"))
button5b.grid(row=10, column=1, padx=10, pady=10)

button5c = Button(screen, text="Steve Jobs", command=lambda: check5("Steve Jobs"))
button5c.grid(row=10, column=2, padx=10, pady=10)

button5d = Button(screen, text="Bill Gates", command=lambda: check5("Bill Gates"))
button5d.grid(row=10, column=3, padx=10, pady=10)

c5 = "Charles Babbage"
def check5(selected5):
    global count 
    if selected5 == c5:
        print("Correct")
        count += 1 
    else:
        print("Wrong")
        
# 6

label6 = Label(screen , 
            text = "6. Which is the largest ocean on Earth?" , 
            font = ('Times New Roman' , 14 , 'italic') , 
            fg = "white" ,
            )

label6.grid(row=11, column=0)

button6a = Button(screen, text="Atlantic", command=lambda: check6("Atlantic"))
button6a.grid(row=12, column=0, padx=10, pady=10)

button6b = Button(screen, text="Pacific", command=lambda: check6("Pacific"))
button6b.grid(row=12, column=1, padx=10, pady=10)

button6c = Button(screen, text="Indian", command=lambda: check6("Indian"))
button6c.grid(row=12, column=2, padx=10, pady=10)

button6d = Button(screen, text="Arctic", command=lambda: check6("Arctic"))
button6d.grid(row=12, column=3, padx=10, pady=10)

c6 = "Pacific"
def check6(selected6):
    global count 
    if selected6 == c6:
        print("Correct")
        count += 1 
    else:
        print("Wrong")
        
# 7 

label7 = Label(screen , 
            text = "7. What does CPU stand for" , 
            font = ('Times New Roman' , 14 , 'italic') , 
            fg = "white" ,
            )

label7.grid(row=13, column=0)

button7a = Button(screen, text="Central Processing Unit", command=lambda: check7("Central Processing Unit"))
button7a.grid(row=14, column=0, padx=10, pady=10)

button7b = Button(screen, text="Computer Personal Unit", command=lambda: check7("Computer Personal Unit"))
button7b.grid(row=14, column=1, padx=10, pady=10)

button7c = Button(screen, text="Central Print Unit", command=lambda: check7("Central Print Unit"))
button7c.grid(row=14, column=2, padx=10, pady=10)

button7d = Button(screen, text="Control Processing User", command=lambda: check7("Control Processing User"))
button7d.grid(row=14, column=3, padx=10, pady=10)

c7 = "Central Processing Unit"
def check7(selected7):
    global count 
    if selected7 == c7:
        print("Correct")
        count += 1 
    else:
        print("Wrong")
        
# 8

label8 = Label(screen , 
            text = "8. Which data structure uses FIFO principle?" , 
            font = ('Times New Roman' , 14 , 'italic') , 
            fg = "white" ,
            )

label8.grid(row=15, column=0)

button8a = Button(screen, text="Stack", command=lambda: check8("Stack"))
button8a.grid(row=16, column=0, padx=10, pady=10)

button8b = Button(screen, text="Queue", command=lambda: check8("Queue"))
button8b.grid(row=16, column=1, padx=10, pady=10)

button8c = Button(screen, text="Tree", command=lambda: check8("Tree"))
button8c.grid(row=16, column=2, padx=10, pady=10)

button8d = Button(screen, text="Graph", command=lambda: check8("Graph"))
button8d.grid(row=16, column=3, padx=10, pady=10)

c8 = "Queue"
def check8(selected8):
    global count 
    if selected8 == c8:
        print("Correct")
        count += 1 
    else:
        print("Wrong")
        
# 9

label9 = Label(screen , 
            text = "9. Which is the fastest land animal?" , 
            font = ('Times New Roman' , 14 , 'italic') , 
            fg = "white" ,
            )

label9.grid(row=17, column=0)

button9a = Button(screen, text="Lion", command=lambda: check9("Lion"))
button9a.grid(row=18, column=0, padx=10, pady=10)

button9b = Button(screen, text="Cheetah", command=lambda: check9("Cheetah"))
button9b.grid(row=18, column=1, padx=10, pady=10)

button9c = Button(screen, text="Tiger", command=lambda: check9("Tiger"))
button9c.grid(row=18, column=2, padx=10, pady=10)

button9d = Button(screen, text="Leopard", command=lambda: check9("Leopard"))
button9d.grid(row=18, column=3, padx=10, pady=10)

c9 = "Cheetah"
def check9(selected9):
    global count 
    if selected9 == c9:
        print("Correct")
        count += 1 
    else:
        print("Wrong")
        
# 10

label10 = Label(screen , 
            text = "10. What is the output of: 5 ** 2 in Python?" , 
            font = ('Times New Roman' , 14 , 'italic') , 
            fg = "white" ,
            )

label10.grid(row=19, column=0)

button10a = Button(screen, text="10", command=lambda: check10("10"))
button10a.grid(row=20, column=0, padx=10, pady=10)

button10b = Button(screen, text="25", command=lambda: check10("25"))
button10b.grid(row=20, column=1, padx=10, pady=10)

button10c = Button(screen, text="5", command=lambda: check10("5"))
button10c.grid(row=20, column=2, padx=10, pady=10)

button10d = Button(screen, text="2", command=lambda: check10("2"))
button10d.grid(row=20, column=3, padx=10, pady=10)

c10 = "25"
def check10(selected10):
    global count 
    if selected10 == c10:
        print("Correct")
        count += 1 
    else:
        print("Wrong")
        
entry = Entry(screen , 
              font = ('Times New Roman' , 14 , 'italic') ,
              relief = "raised" , 
              bd = 5 ,
              )

def show_score():
    print("Total Correct Answers =", count)
    
score_button = Button(
    screen,
    text="Show Score",
    command=show_score
    )

score_button.grid(row=21, column=0, columnspan=4, pady=20)

screen.mainloop()