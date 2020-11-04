// var sw=20,sh=20,tr=30,td=30;
var [sw, sh, tr, td] = [20, 20, 30, 30] //宽 高 行 列

function Square(x, y, classname) { //创建方块
    this.x = x * sw
    this.y = y * sh
    this.class = classname

    this.viewContent = document.createElement('div') //创建元素
    this.viewContent.className = this.class
    this.parent = document.querySelector('#snake')
}
//给原型添加方法
Square.prototype.create = function () { //创建DOM
    this.viewContent.style.position = 'absolute'
    this.viewContent.style.width = sw + 'px'
    this.viewContent.style.height = sh + 'px'
    this.viewContent.style.left = this.x + 'px'
    this.viewContent.style.top = this.y + 'px'

    this.parent.appendChild(this.viewContent) //添加对象
}
Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent) //移除对象
}


//创建蛇身
class Snake {
    constructor() {
        this.head = null
        this.tail = null
        this.pos = [] // 新增加方块的位置
        this.directionNum = {
                right: { x: 1, y: 0 },
                left: { x: -1, y: 0 },
                up: { x: 0, y: -1 },
                down: { x: 0, y: 1 }
            } //蛇走的方向

        //接触后处理事件
        this.handle = {
            move: function (format) {
                //创建新身体（在旧蛇头的位置）
                var newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody')
                    //更新链表关系
                newBody.last = this.head.last
                newBody.last.next = newBody
                newBody.next = null

                this.head.remove() //删除旧蛇头
                newBody.create()

                //新蛇头的位置
                var newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead')
                newHead.last = newBody
                newHead.next = null
                newBody.next = newHead
                newHead.create()

                //更新坐标
                this.pos.unshift([this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]) //添加newhead坐标
                this.head = newHead //更新蛇头

                if (!format) { // false  删除蛇尾
                    this.tail.remove()
                    this.tail = this.tail.next
                    this.pos.pop()
                }

            },
            eat: function () {
                this.handle.move.call(this, true)
                    // food.remove()
                createFood();
                game.score++
            },
            die: function () {
                game.over()
            }
        }
    }
    init() {
            var snakeHead = new Square(2, 0, 'snakeHead') //
            snakeHead.create()
            this.head = snakeHead //创建蛇头并存储
            this.pos.push([2, 0]) //存储蛇头位置

            //创建蛇身
            var snakeBody1 = new Square(1, 0, 'snakeBody')
            snakeBody1.create()
            this.pos.push([1, 0])
            var snakeBody2 = new Square(0, 0, 'snakeBody')
            snakeBody2.create()
            this.pos.push([0, 0])
            this.tail = snakeBody2 //存储蛇尾

            //形成链表关系
            snakeHead.next = null
            snakeHead.last = snakeBody1

            snakeBody1.next = snakeHead
            snakeBody1.last = snakeBody2

            snakeBody2.next = snakeBody1
            snakeBody2.last = null

            this.direction = this.directionNum.right //添加默认方向
        }
        // 判断蛇头下一个位置的元素  判断事件
    getNextPos() {
        var nextPos = [
            this.head.x / sw + this.direction.x,
            this.head.y / sh + this.direction.y
        ]

        //判断是否撞到自身 判断 pos 中是否有下一个坐标
        var selfColied = false //是否撞到自己
        this.pos.forEach(function (value) {
            if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
                selfColied = true
            }
        })
        if (selfColied) {
            this.handle.die.call(this) //用 call 将this 重新指向实例
            return
        }

        //判断是否撞到边界
        if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1) {
            this.handle.die.call(this)
            return
        }

        //吃到食物
        if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
            this.handle.eat.call(this)
        }

        //空  继续走
        this.handle.move.call(this)
    }


}
var food = null
var game = null
var snake = new Snake()
    // snake.init()
    // snake.getNextPos()


//创建食物
function createFood() {
    var x = null
    var y = null
    var flag = true //判断是否在蛇身上
    while (flag) {
        x = Math.round(Math.random() * (td - 1))
        y = Math.round(Math.random() * (tr - 1))
        snake.pos.forEach(function (value) {
            if (x != value[0] && y != value[1]) {
                flag = false
            }

        })
    }
    food = new Square(x, y, 'snakeFood')
    food.pos = [x, y]
    var foodDom = document.querySelector('.snakeFood')
    if (foodDom) {
        foodDom.style.left = x * sw + 'px'
        foodDom.style.top = y * sh + 'px'

    } else {
        food.create()
    }
}

//游戏逻辑
function Game() {
    this.timer = null
    this.score = 0
}
Game.prototype.init = function () {
    snake.init()
    createFood()
    document.onkeydown = function (ev) {
        if (ev.which == 37 && snake.direction != snake.directionNum.right) {
            snake.direction = snake.directionNum.left
        } else if (ev.which == 38 && snake.direction != snake.directionNum.down) {
            snake.direction = snake.directionNum.up
        } else if (ev.which == 39 && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right
        } else if (ev.which == 40 && snake.direction != snake.directionNum.up) {
            snake.direction = snake.directionNum.down

        }
    }
    this.start();
}
Game.prototype.start = function () {
    this.timer = setInterval(function () {
        snake.getNextPos();
    }, 200)
}
Game.prototype.pause = function () {
    clearInterval(this.timer)
}
Game.prototype.over = function () {
        clearInterval(this.timer)
        alert('得分为' + this.score)

        var snake = document.querySelector('#snake')
        snake.innerHTML = ''
        snake = new Snake();
        game = new Game()
        var startBtn = document.querySelector('.startBtn')
        startBtn.style.display = 'block'
    }
    // 开启游戏
game = new Game();
var startBtn = document.querySelector('.startBtn button')
startBtn.onclick = function () {
    startBtn.parentNode.style.display = 'none'
    game.init()

}

// 暂停游戏
var gameContainer = document.querySelector('.gamecontainer')
var pauseBtn = document.querySelector('.pauseBtn')

gameContainer.onclick = function () {
    game.pause()
    pauseBtn.style.display = 'block'
}
pauseBtn.onclick = function () {
    game.start()
    pauseBtn.style.display = 'none'
}