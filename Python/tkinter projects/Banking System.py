from tkinter import *

screen = Tk()

screen.geometry("2000x1000")

screen.title("Banking System by Aditya - 1")

screen.config(background = "Black")

for i in range(6):
    screen.grid_columnconfigure(i, weight=1)

# Top name 

label = Label(screen , 
            text = "Banking System" , 
            font = ('Times New Roman' , 28 , 'bold') , 
            fg = "white" ,
            relief = "raised" , 
            bd = 5 , 
            padx = 10 , 
            pady = 10 , 
            )

label.grid(row=0, column=0, columnspan=6)

# subtopic

label1 = Label(screen , 
            text = "Create account" , 
            font = ('Times New Roman' , 14 , 'bold') , 
            fg = "white" ,
            relief = "raised" , 
            bd = 5 , 
            padx = 10 , 
            pady = 10 , 
            )

label1.grid(row = 1 , column = 0 )

# 1st entry - Name entry 

entry1 = Entry(screen , 
            font = ('Times New Roman' , 14 , 'bold') ,
            fg = "white" ,
            )

entry1.grid(row = 2 , column = 2)

# 2nd label - Name

label2 = Label(screen , 
               text = "Name" , 
            font = ('Times New Roman' , 10 , 'italic') , 
            fg = "white" 
            )

label2.grid(row = 2 , column = 0)

def submit1():
    entry1.get()
    print("Name is" , entry1.get())

# 1st button - submit button

button1 = Button(screen , 
                text = "Submit" ,
                command = submit1 , 
                font = ('Times New Roman' , 10 , 'italic')  
                )

button1.grid(row = 2 , column = 3)

# 3rd label - DOB

label3 = Label(screen , 
               text = "DOB" , 
            font = ('Times New Roman' , 10 , 'italic') , 
            fg = "white" 
            )

label3.grid(row = 3 , column = 0)

# 2nd Entry - DOB entry 

entry2 = Entry(screen , 
            font = ('Times New Roman' , 14 , 'bold') ,
            fg = "white" ,
            )

entry2.grid(row = 3 , column = 2)

def submit2():
    entry2.get()
    print("DOB is" , entry2.get())

# button 2 - DOB submit 

button2 = Button(screen , 
                text = "Submit" ,
                command = submit2 , 
                font = ('Times New Roman' , 10 , 'italic')  
                )

button2.grid(row = 3 , column = 3)

# label 4 - Minor or adult

label4 = Label(screen , 
               text = "Minor or Adult" , 
            font = ('Times New Roman' , 10 , 'italic') , 
            fg = "white" 
            )

label4.grid(row = 4 , column = 0)

entry3 = Entry(screen , 
            font = ('Times New Roman' , 14 , 'bold') ,
            fg = "white" ,
            )

entry3.grid(row = 4 , column = 2)

def submit3():
    entry3.get()
    print("He is " , entry3.get())
    
button3 = Button(screen , 
                text = "Submit" ,
                command = submit3 , 
                font = ('Times New Roman' , 10 , 'italic')  
                )

button3.grid(row = 4 , column = 3)

# Label 5 

label5 = Label(screen , 
               text = "Account in any other bank :" , 
            font = ('Times New Roman' , 10 , 'italic') , 
            fg = "white" 
            )

label5.grid(row = 5 , column = 0)

entry4 = Entry(screen , 
            font = ('Times New Roman' , 14 , 'bold') ,
            fg = "white" ,
            )

entry4.grid(row = 5 , column = 2)

def submit4():
    entry4.get()
    print("He has other bank account in " , entry3.get())
    
button4 = Button(screen , 
                text = "Submit" ,
                command = submit4 , 
                font = ('Times New Roman' , 10 , 'italic')  
                )

button4.grid(row = 5 , column = 3)

def second_screen():
    new_window = Toplevel(screen)

    new_window.geometry("2000x1000")
    new_window.title("Banking System by Aditya - 2")
    new_window.config(background="Black")

    for i in range(6):
        new_window.grid_columnconfigure(i, weight=1)
        
    label6 = Label(
        new_window,
        text="Account Details:",
        font=('Times New Roman', 20, 'bold'),
        fg="white",
        bg="black"
    )

    label6.grid(row=0, column=0)
    
    label7 = Label(
        new_window,
        text="Account Number:",
        font=('Times New Roman', 20, 'bold'),
        fg="white",
        bg="black"
    )

    label7.grid(row=1, column=2)
    
    label8 = Label(
        new_window,
        text="48718947580217456181",
        font=('Times New Roman', 20, 'bold'),
        fg="white",
        bg="black"
    )

    label8.grid(row=1, column=3)
    
    label9 = Label(
        new_window,
        text="Account Balance:",
        font=('Times New Roman', 20, 'bold'),
        fg="white",
        bg="black"
    )

    label9.grid(row=2, column=2)
    
    balance = 0
    
    label10 = Label(new_window,
        text= f"₹{balance}" ,
        font=('Times New Roman', 20, 'bold'),
        fg="white",
        bg="black" ,
        )
    
    label10.grid(row = 2 , column = 3)
    
    def deposit():
        entry6 = Entry(new_window , 
                       font = ('Times New Roman' , 10 , 'italic') , 
                       fg = "white" , 
                       )
        
        entry6.grid(row = 5 , column = 2)
        
        def proceed():
            nonlocal balance
            balance += int(entry6.get())
            print(f"your current Balance is {balance}")
            label10.config(text=str(balance))
            entry6.delete(0, END) 
        button8 = Button(new_window , 
                     text = "proceed(Deposit)" ,
                command = proceed , 
                font = ('Times New Roman' , 10 , 'italic')
                )
        
        button8.grid(row = 5 , column = 0)
    
    button5 = Button(new_window , 
                     text = "Deposit" ,
                command = deposit , 
                font = ('Times New Roman' , 10 , 'italic')
                )
    
    button5.grid(row = 3 , column = 2)
    
    def withdraw():
        entry5 = Entry(new_window , 
                       font = ('Times New Roman' , 10 , 'italic') , 
                       fg = "white" , 
                       )
        
        entry5.grid(row = 4 , column = 2)

        def WIthdraw():
            nonlocal balance
            balance -= int(entry5.get())
            print(f"Your current balance is {balance}")
            label10.config(text=str(balance))
            entry5.delete(0, END)
        button7 = Button(new_window , 
                     text = "proceed(Withdraw)" ,
                command = WIthdraw , 
                font = ('Times New Roman' , 10 , 'italic')
                )

        button7.grid(row = 4 , column = 0)
        
    button6 = Button(new_window , 
                     text = "Withdraw" ,
                command = withdraw , 
                font = ('Times New Roman' , 10 , 'italic')
                )
    
    button6.grid(row = 3 , column = 3)
    
button = Button(screen, text="Next", command=second_screen)
button.grid(row = 6 , column = 2) 
    
screen.mainloop()