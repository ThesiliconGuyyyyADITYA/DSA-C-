from tkinter import *

import random

import string 

screen = Tk()

screen.geometry("2000x1000")

screen.title("Password Generator")

screen.config(background = "Black")

for i in range(6):
    screen.grid_columnconfigure(i, weight=1)
    
label = Label(screen , 
            text = "Generate you Password :)" , 
            font = ('Times New Roman' , 28 , 'bold') , 
            fg = "white" ,
            relief = "raised" , 
            bd = 5 , 
            padx = 10 , 
            pady = 10 , 
            )

label.grid(row=0, column=0, columnspan=6)

label1 = Label(screen , 
            text = "Generate you Password :)" , 
            font = ('Times New Roman' , 20 , 'italic') , 
            fg = "white" ,  
            )

label1.grid(row=1, column=0, pady=20)

length = IntVar()

Radiobutton(screen,
            text="8 Digit",
            variable=length,
            value=8).grid(row=2, column=0)

Radiobutton(screen,
            text="10 Digit",
            variable=length,
            value=10).grid(row=3, column=0)

Radiobutton(screen,
            text="12 Digit",
            variable=length,
            value=12).grid(row=4, column=0)
def generate():
    print(length.get())
    
def generate():
    password = ""

    for i in range(length.get()):
        password += random.choice(
            string.ascii_letters +
            string.digits +
            string.punctuation
            )
    result.config(text = password)
    
Button(screen,
       text="Generate Password",
       command=generate).grid(row=5, column=0)

result = Label(screen,
               text="",
               font=("Times New Roman", 20),
               fg="white",
               bg="black")

result.grid(row=6, column=0, pady=20)

screen.mainloop()