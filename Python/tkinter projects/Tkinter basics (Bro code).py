from tkinter import *

window = Tk() # to start coding with Tkinter

window.geometry("800x800") # Dimensions of window

window.title("Aditya's GUI window") # Title of window

window.config(background = "black") # to select the background colour we can also give it the code of the colour by searching on google for code. 

label = Label(window , 
            text = "Some another nonsense" , 
            font = ('Times New Roman' , 28 , 'bold') , 
            fg = "white" ,
            relief = "raised" ,  # relif tells us the border style  
            bd = 5 , # bd tells us the border thickness
            bg = "black" , 
            padx = 10 , # leaves spaces between border and letters in x axis.
            pady = 10 , # leaves spaces between border and letters in y axis.
            compound = "left" , # if we don't write this the image will replace the whole text.
            ) # the heading of the window (if no place is given it will put itself in the centre), font = fontname , fontsize , bold/italic or any other properties , 'fg' is font colour , 'bg' is text background colour.
# label.place(x = 1 , y = 0) # tells label where to sit
label.pack() # this says "Hey label come and sit into the window".

def click():
    print("Clicked" )
button = Button(window , 
                text = "Click Here." , 
                command = click , 
                font = ("Times New Roman" , 12) , 
                activebackground = "red" , # colour of the background when the button will be clicked.
                activeforeground = "white" , # colour of the text when the button is clicked.
               # state = DISABLED , # this is enabled by default, this totally disables the button.  
                )
button.pack()

entry = Entry(window , 
              font = ('Times New Roman' , 24 , 'italic') , 
            #   fg = "black" , 
            #   bg = "white" , 
              relief = "raised" , 
              bd = 5 , 
              show = "*" , # use when writing a password but it will be shown inside the teeminal if pregram is given to print there.
              )
# entry.insert(0 , "Type anything nonsense here") # the text that is already present inside the box(actually written).
entry.pack(side = LEFT)

def submit():
    print("Got Text")
    
submit_button = Button(window , 
                       text = "Submit" , 
                       font = ('Times New Roman' , 16 , 'bold') , 
                       command = submit , 
                       )
submit_button.pack(side = RIGHT)

def delete():
    entry.delete(0,END)
    print("text deleted")
    
delete_button = Button(window , 
                       text = "Delete" , 
                       font = ('Times New Roman' , 16 , 'bold') , 
                       command = delete , 
                       )
delete_button.pack(side = RIGHT)

def backspace():
    entry.delete(len(entry.get())-1,END)
    print("backspace")
    
backspace = Button(window , 
                       text = "Backspace" , 
                       font = ('Times New Roman' , 16 , 'bold') , 
                       command = backspace, 
                       )
backspace.pack(side = RIGHT)

def display():
    if x.get() == 1 :
        print("You checked")
    elif x.get() == 0 :
        print("You unchecked")
        

x = IntVar()


window.mainloop() # place window on computer screen.