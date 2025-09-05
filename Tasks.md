## Задача 1
#### Вывести отсортированный в алфавитном порядке список имен пользователей в файле passwd (вам понадобится grep).

```console
cat /etc/passwd | grep -o "^[^:]*" | sort
```

## Задача 2
#### Вывести данные /etc/protocols в отформатированном и отсортированном порядке для 5 наибольших портов

```console
cat /etc/protocols | awk '{print $2, $1}' | sort -r -n | head -n 5
```


## Задача 3
#### Написать программу banner средствами bash для вывода текстов

```bash
#!/bin/bash

echo -n "+-"

for ((i=0; i<${#1}; i++)) do
	echo -n "-"
done

echo "-+"
echo -n "| $1"
echo " |"
echo -n "+-"

for ((i=0; i<${#1}; i++)) do
	echo -n "-"
done

echo "-+"
```