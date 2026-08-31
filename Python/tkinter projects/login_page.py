from tkinter import *

root = Tk()

root.geometry("700x400")
def getvals():
    print("Accepted")

# Heading

Label(root , text = "Python Registration Form" , font = "ar 28 bold italic").grid(row = 0 , column = 1)

# Parts of the form names

Firstname = Label(root , text = "First Name")
Midddlename = Label(root , text = "Middle Name")
Lastname = Label(root , text = "Last Name")
Phone = Label(root , text = "Phone Number")
Gender = Label(root , text = "Gender")
email = Label(root , text = "email")

# Packing

Firstname.grid(row = 1, column = 1)
Midddlename.grid(row = 2, column = 1)
Lastname.grid(row = 3, column = 1)
Phone.grid(row = 4, column = 1)
Gender.grid(row = 5, column = 1)
email.grid(row = 6, column = 1)

# variable for data storing

Firstnamevalue = StringVar()
Midddlenamevalue = StringVar()
Lastnamevalue = StringVar()
Phonevalue = StringVar()
Gendervalue = StringVar()
emailvalue = StringVar()

checkvalue = IntVar()

# creating entry field

Firstnameentry = Entry(root , textvariable= Firstnamevalue)
Midddlenameentry = Entry(root , textvariable= Midddlenamevalue)
Lastnameentry = Entry(root , textvariable= Lastnamevalue)
Phoneentry = Entry(root , textvariable= Phonevalue)
Genderentry = Entry(root , textvariable= Gendervalue)
emailentry = Entry(root , textvariable= emailvalue)

# packing 

Firstnameentry.grid(row = 1, column = 2)
Midddlenameentry.grid(row = 2, column = 2)
Lastnameentry.grid(row = 3, column = 2)
Phoneentry.grid(row = 4, column = 2)
Genderentry.grid(row = 5, column = 2)
emailentry.grid(row = 6, column = 2)

# creating a checkbox

checkbutton = Checkbutton(text = "remember me ??" , variable = checkvalue)
checkbutton.grid(row = 7 , column = 2) 

# creating button to submit 

Button(text = "Submit" , command = getvals).grid(row = 8 , column = 2)

root.mainloop()