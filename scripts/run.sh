#!/bin/bash

# запуск с виртуальной ФС и стартовым скриптом init.txt
npx electron . --vfs=./vfs-nested.xml --script=./init.txt

# запуск только с VFS (без стартового скрипта)
npx electron . --vfs=./vfs-nested.xml

# запуск только со стартовым скриптом
npx electron . --script=./init.txt
