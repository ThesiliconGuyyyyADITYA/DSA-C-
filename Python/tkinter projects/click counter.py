from tkinter import *

screen = Tk()

screen.title("Nonsense Click Counter :)")

screen.config(background = "black")

screen.geometry("800x800")

label = Label(screen , 
            text = "Click counter" , 
            bg = "black" , 
            font = ('Times New Roman' , 40 , 'bold') , 
            fg = "white" ,
            relief = "raised" ,
            bd = 5 , 
            pady = 10 , 
            padx = 10 , 
            )
label.pack()

count = 0
def click():
    global count
    count += 1
    print(count)
button = Button(screen , 
                text = "Count +1" , 
                command = click , 
                font = ('Times New Roman' , 28 , 'bold') , 
                )
button.pack()

screen.mainloop()
