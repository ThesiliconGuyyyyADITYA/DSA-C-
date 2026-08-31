n = int(input("Enter the Last digit:"))
count = 0
list = []
for i in range(0,n):
    i += 1
    if n % i == 0:
        print(i)
        list.append(i)
    else:
        print(f"{i} is not a Factor.")
print(list)