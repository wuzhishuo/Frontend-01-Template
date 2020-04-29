# BoundFunction
### 调用Function.prototype.bind返回的对象，具有以下3项特性，用于记录被包装的函数、this的值、绑定的参数;当调用BoundFunction的[[Call]]和 [[Construct]]会将这3项以参数形式传递给Call和Construct方法执行
  - [[BoundTargetFunction]]：被包装的函数
  - [[BoundThis]]：在调用包装函数时始终作为 this 值传递的值
  - [[BoundArguments]]：在调用包装函数调用时都会将此列表元素传递给包装函数
### BoundFunction的创建过程，BoundFunctionCreate ( targetFunction, boundThis, boundArgs )
  1. targetFunction 是一个对象
  2. 将通过调用targetFunction的[[GetPrototypeOf]]得到的原型赋值给proto
  3. 创建一个新对象obj
  4. 给obj设置普通对象默认的内置方法
  5. 设置obj的[[Call]]属性
  6. 如果IsConstructor(targetFunction)==true,设置obj的[[Construct]] 
  7. 设置obj.[[Prototype]]= proto
  8. 设置obj.[[Extensible]] = true
  9. 设置obj.[[BoundTargetFunction]] = targeFunction
  10. 设置obj.[[BoundThis]] = boundThis
  11. 设置obj.[[BoundArguments]] = boundArgs
  12. 返回obj

# Array
### Array以正整数作为属性的key(数字下标)，Array有一个不可以配置的属性length，length总是比Array数字下标大；如果给Array设置了一个正整数的属性，length会变成比此整数大1；无论何时改变length，任何比length小的正整数属性都会被删除。具有1项特性：
  - [[DefineOwnProperty]]( P, Desc )：用于给Array定义属性

### [[DefineOwnProperty]]( P, Desc )的执行过程为：
  1. 调用IsPropertyKey(P)判断P是否是合法的属性名
  2. 如果P是length,执行ArraySetLength(A, Desc)
  3. 如果P是正整数，执行以下步骤：
     1. 设置oldLenDesc=OrdinaryGetOwnProperty(A,"length")
     2. 设置oldLen= oldLenDesc.[[Value]]
     3. 设置index=!ToUint32(P)
     4. 如果 index ≥ oldLen 并且 oldLenDesc.[[Writable]]= false,返回false， 即要设置的数组下标超过当前数组长度并且数组的长度不可以修改就返回false，属性设置失败
     5. 调用普通属性设置函数OrdinaryDefineOwnProperty(A, P, Desc)设置属性
     6. 如果步骤5设置成功，返回false,属性设置结束
     7. 如果index大于等于旧的数组长度oldLen，就设置oldLenDesc.[[Value]]=index + 1，然后调用OrdinaryDefineOwnProperty(A, "length", oldLenDesc)更新数组长度
     8. 返回true
  4. 否则返回普通属性设置函数OrdinaryDefineOwnProperty(A, P, Desc)的调用结果

### ArraySetLength ( A, Desc )主要做了以下这些事情：
  - 判断传入的属性值是否是合法的整数
  - 传入的length值大于等于原数组的length，调用 OrdinaryDefineOwnProperty(A, "length", newLenDesc)更新数组的length，并根据不同情况更新length的 [[Writable]]
  - 传入的length值小于原数组的length，删除新length后的数组，并调用 OrdinaryDefineOwnProperty(A, "length", newLenDesc)更新数组length

# String
### String具有一个不可写、不可以配置的length属性，跟普通对象不一样的是重新定义了自己的三个特性：
  - [[GetOwnProperty]] ( P )
    - 具有类似数组下标的属性
  - [[DefineOwnProperty]] ( P, Desc )
    - 具有类似数组下标的属性
  - [[OwnPropertyKeys]] ( )
    - 返回类似数组下标的属性

# Arguments
### Arguments的索引跟Function的参数一一对应，而普通对象的[[ParameterMap]] 的值总是undefined，跟普通对象不一样的是重新定义了自己的五个特性：
  - [[GetOwnProperty]] ( P )
    - 从对象的[[ParameterMap]]中获取属性P的值
  - [[DefineOwnProperty]] ( P, Desc )
    - 如果要定义的是[[ParameterMap]]中的属性，且没有传递属性值的时候，使用旧的属性值
    - 如果要定义的是[[ParameterMap]]中的属性，当 IsAccessorDescriptor(Desc)= true 或 传递进来的属性的[[Writable]] = false，删除[[ParameterMap]]中对应的属性
  - [[Get]] ( P, Receiver )
     - 优先从对象的[[ParameterMap]]获取属性P，没有的话按普通对象的属性获取处理
  - [[Set]] ( P, V, Receiver )
    - 要更新的属性P是否是[[ParameterMap]]中的属性，是的话，更新[[ParameterMap]]中的属性值，否则，按普通对象属性设置处理
  - [[Delete]] ( P )
    - 用OrdinaryDelete(args, P)删除对应属性，如果属性是[[ParameterMap]]的属性，就把[[ParameterMap]]中的对应属性也删除

#  Integer-Indexed
### Integer-INdexed 跟普通对象相比，具有额外的[[ViewedArrayBuffer]]、 [[ArrayLength]]、 [[ByteOffset]]和[[TypedArrayName]]，重新定义了以下特性：
  - [[GetOwnProperty]] ( P )
  - [[HasProperty]] ( P )
  - [[DefineOwnProperty]] ( P, Desc )
  - [[Get]] ( P, Receiver )
  - [[Set]] ( P, V, Receiver )
  - [[OwnPropertyKeys]] ( )

# Module Namespace
### Module Namespace具有三个特有的内部属性：[[Module]]、[[Exports]]、[[Prototype]]，重新定义了以下特性：
  - [[SetPrototypeOf]] ( V )
  - [[IsExtensible]] ( )
  - [[PreventExtensions]] ( )
  - [[GetOwnProperty]] ( P )
  - [[DefineOwnProperty]] ( P, Desc )
  - [[HasProperty]] ( P )
  - [[Get]] ( P, Receiver )
  - [[Set]] ( P, V, Receiver )
  - [[Delete]] ( P )
  - [[OwnPropertyKeys]] ( )

# Immutable Prototype
  - [[SetPrototypeOf]] ( V )

# Proxy
  - [[GetPrototypeOf]]
  - [[SetPrototypeOf]]
  - [[IsExtensible]]
  - [[PreventExtensions]]
  - [[GetOwnProperty]]
  - [[DefineOwnProperty]]
  - [[HasProperty]]
  - [[Get]]
  - [[Set]]
  - [[Delete]]
  - [[OwnPropertyKeys]]
  - [[Call]]
  - [[Construct]]
