# 第三周总结

## 本周学习的主要内容

- JavaScript 表达式、类型转换
- JavaScript 语句
- JavaScript 对象及面向对象编程

## JavaScript 表达式

- 表达式由运算符连接变量或者直接量构成的

- 成员表达式，用于访问对象成员

  - a.b
  - a["b"]
  - foo\`string\`,这个带函数名的模板表示把模板的各个部分算好后传递给一个函数,例如foo\`a${b}c\`，实际会把模板拆分成'a${'、b、'}c'三部分进行解析
  - super.b;
  - super[b]
  - new.target

- NEW 表达式

  - new new Cls(1) 等价于 new (new Cls(1)),new 表达式和函数表达式结合具有较高优先级

- 函数调用表达式

  - foo()
  - super()
  - foo().b
  - foo()['b']
  - foo()\`abc\`

- 左值表达式&右值表达式

  - a.b = c

- 更新表达式
  - a++，a 后面不能跟换行符，a++\nb，会变成 a，++b
  - ++a
- 单目运算符

  - delete a.b
  - void foo()， 不管后面是什么都会变成 undefined，可以用 void(0)产生 undefined，立即使用 void 是让执行函数的合法的最佳实践

    ```
      void function(i) {}(i)
    ```

  - typeof a，typeof null = 'object'， typeof Function = 'function'，typeof 设计不合理
  - +a
  - -a
  - ~a
  - !a，!!a 一定转换成 a 真正的 true 或 false
  - await a
  - 乘法运算符
    - \*、/、%
  - 加法运算符
    - +、-
  - 移位运算符
    - <<、>>、>>>
  - 比较运算符
    - <、>、<=、>=、instanceOf、in
  - 等于运算符(逻辑上属于比较运算符，但是优先级比较低)
    - ==、!=、===、!==
  - 位运算符
    - &、^、|
  - 逻辑运算符
    - && 、|| ，存在短路逻辑
  - 三目运算
    - ?:，同样存在短路逻辑

# 类型转换

- 类型转换对照表
  |           |     Number     |      String       | Boolean | Undefined | Null | Object | Symbol |
  | :-------: | :------------: | :---------------: | :-----: | :-------: | :--: | :----: | :----: |
  |  Number   |       -        |                   | 0false  |     x     |  x   | Boxing |   x    |
  |  String   |                |         -         | ""false |     x     |  x   | Boxing |   x    |
  |  Boolean  | true:1,false:0 |  "true","false"   |    -    |     x     |  x   | Boxing |   x    |
  | Undefined |       NaN      |    'undefined'    |  false  |     -     |  x   |   x    |   x    |
  |   Null    |       0        |      'null'       |  false  |     x     |  -   |   x    |   x    |
  |  Object   |    valueOf     | valueOf、toString |  true   |     x     |  x   |   -    |   x    |
  |  Symbol   |       x        |         x         |    x    |     x     |  x   | Boxing |   x    |
- 拆箱转换
  - 尝试调用 valueOf 和 toString获得基本类型，对象拆箱会优先调用valueOf，String对象拆箱会优先调用toString
  - valueOf和toString都没有返回基本类型，则会产生类型错误 TypeError
  - toPrimitive 是对象类型到基本类型的转换，对象存在toPrimitive，拆箱过程只会调用ToPrimitive，不会再调用valueOf和toString
- 装箱
  - Number、String、Number、Object四种基本类型可以装箱
  - Number()、String()、Number()直接调用是进行类型转换，用new Number()、new String()、new Number()以及直接调用Object()是进行装箱操作

# 语句
  - Completion Record 表示一个语句执行完之后的结果，它有三个字段：
    - [[type]] 表示完成的类型，有 break continue return throw 和 normal 几种类型
    - [[value]] 表示语句的返回值，如果语句没有，则是 empty
    - [[target]] 表示语句的目标，通常是一个 JavaScript 标签
  - 简单语句
    - 表达式语句
    - 空语句
    - 调试语句
    - 抛异常语句
    - continue
    - break
    - return
  - 复合语句
    - 语句块
    - if语句
    - switch语句
    - 迭代语句，for循环中使用let、const声明变量，会在循环体内产生一个新的作用域，let、const声明的变量只在域中能访问到
    - with语句
    - 标签语句
    - try catch 语句，finally永远都会执行，catch中的非normal语句会穿透，catch不会生成新的作用域
    - var声明变量，此变量在整个函数范围内有效，跟声明的位置无关，声明会被提前但是赋值还是在原位置执行
    - 函数声明会整个提前

# 面向对象
  - 面向对象主要有两个流派，基于类和基于原型
  - JavaScript是面向对象的语言，疑惑来着与JavaScript没有采用主流的基于类的面向对象，而是采用了基于原型
  - 对象的特征
    - 对象具有唯一标识性：即使完全相同的两个对象，也并非同一个对象
    - 对象有状态：对象具有状态，同一对象可能处于不同状态之下
    - 对象具有行为：即对象的状态，可能因为它的行为产生变迁
    - 封装、继承、多态不是对象的特征，只是有相关性，可以说是目的、特性等
  - 在设计对象的状态和行为的时候，要遵循“行为改变状态”的原则
  - JavaScript中用属性描述状态和行为(函数也是属性)
  - JavaScript有两类属性
    - 数据属性，具有四个特征：
      - value：就是属性的值
      - writable：决定属性能否被赋值
      - enumerable：决定 for in 能否枚举该属性
      - configurable：决定该属性能否被删除或者改变特征值
    - 访问器（getter/setter）属性，具有四个特征：
      - getter：函数或 undefined，在取属性值时被调用
      - setter：函数或 undefined，在设置属性值时被调用
      - enumerable：决定 for in 能否枚举该属性
      - configurable：决定该属性能否被删除或者改变特征值
  - 不能为Object再指定原型
  - Object API
    - {}.、{}[]、Object.defineProperty，推荐使用
    - Object.create、Object.setPrototypeOf/Object.getPrototypeOf，推荐使用，但不要与下面一种混用
    - new/class/extends，推荐使用，但不要与上面一种混用
    - new/function/prototype，这种组合的使用往往是想将基于原型的面向对象模拟基于类的面向对象，这种模拟是造成我们以前对JavaScript面向对象不理解、疑惑的主要原因，严格抛弃
  - 当我们访问属性时，如果当前对象 没有，则会沿着原型找原型对象是 否有此名称的属性，而原型对象还 可能有原型，因此，会有“原型链” 这一说法
  - 除了一般对象，JavaScript中还有一些特殊的对象，比如函数除了一般对象的属性和原型，函数对象还有一个行为[[call]]
