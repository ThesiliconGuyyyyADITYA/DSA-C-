from tkinter import *

screen = Tk()

screen.geometry("400x500")

screen.title("Aditya's Own calculator")

screen.config(background = "White")

label = Label(screen , 
            text = "Basic calculator" , 
            font = ('Times New Roman' , 28 , 'bold') , 
            fg = "white" ,
            relief = "raised" , 
            bd = 5 , 
            padx = 10 , 
            pady = 10 , 
            )

label.grid(row=0, column=0, columnspan=4)

entry = Entry(screen , 
              font = ('Times New Roman' , 20 , 'bold') ,
              relief = "raised" , 
              bd = 5 , 
              )

entry.grid(row=3, column=0, columnspan=4, padx=10, pady=10)

def stop(event):    # It is the only this thing that stops the user input to put text in the box where calculator will have the right to put it's own value.
    return "break"

entry.bind("<Key>", stop)

def click(value):
    entry.insert(END, value)

def calculate():
    expression = entry.get()

    result = eval(expression)

    entry.delete(0, END)
    entry.insert(0, result)

Button(screen, text="7" , command=lambda: click("7")).grid(row=4, column=0)
Button(screen, text="8" , command=lambda: click("8")).grid(row=4, column=1)
Button(screen, text="9" , command=lambda: click("9")).grid(row=4, column=2)
Button(screen, text="/" , command=lambda: click("/")).grid(row=4, column=3)

Button(screen, text="4" , command=lambda: click("4")).grid(row=6, column=0)
Button(screen, text="5" , command=lambda: click("5")).grid(row=6, column=1)
Button(screen, text="6" , command=lambda: click("6")).grid(row=6, column=2)
Button(screen, text="*" , command=lambda: click("*")).grid(row=6, column=3)

Button(screen, text="1" , command=lambda: click("1")).grid(row=8, column=0)
Button(screen, text="2" , command=lambda: click("2")).grid(row=8, column=1)
Button(screen, text="3" , command=lambda: click("3")).grid(row=8, column=2)
Button(screen, text="-" , command=lambda: click("-")).grid(row=8, column=3)

Button(screen, text="0" , command=lambda: click("0")).grid(row=10, column=0)
Button(screen, text="." , command=lambda: click(".")).grid(row=10, column=1)
Button(screen, text="=" , command=calculate ).grid(row=10, column=2)
Button(screen, text="+" , command=lambda: click("+")).grid(row=10, column=3)

entry.delete(0,END)

def clear():
    entry.delete(0, END)

Button(screen, text="C", command=clear).grid(row=10, column=4)

screen.mainloop()