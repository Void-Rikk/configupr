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

## Задача 6
#### Написать программу для проверки наличия комментария в первой строке файлов с расширением c, js и py.

```bash
#!/bin/bash

firstLine=`cat $1 | head -n 1 > test.txt`
testJSC1=`grep "^//" test.txt`
testJSC2=`grep "^/\*" test.txt`
testPyt1=`grep "^#" test.txt`
testPyt2=`grep "^\'\'\'" test.txt`
testPyt3=`grep "^\"\"\"" test.txt`

result="$testJSC1$testJSC2$testPyt1$testPyt2$testPyt3"

if [ ! -z "$result" ]; then
	echo "Комментарий найден"
else
	echo "Комментарий не найден"
fi

rm test.txt
```