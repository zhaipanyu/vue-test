/*只要 input.value 被用户改了，data.newTodo 就会变成一样的值；*/
/*只要 data.newTodo 被 JS 改了，input.value 就会变成一样的值。*/


//masterkey :waRTHCjEHt6uXP27c9sVPW20
import Vue from 'vue'
import AV from 'leancloud-storage'

//我的
var APP_ID = 'e5qmbw13JBLBpdjwnXydrYhT-gzGzoHsz';
var APP_KEY = 'DE6vkreJEIVS4oadzEURLevB';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});


//测试代码
// var TestObject = AV.Object.extend('TestObject');
// var testObject = new TestObject();
// testObject.save({
//   words: 'Hello World!'
// }).then(function(object) {
//   alert('LeanCloud Rocks!');
// })

var app = new Vue({
  el: '#app',
  data: {
    formData: {
      username: '',
      password: ''
    },
    actionType: 'signUp',
    newTodo: '',
    todoList: [],
    currentUser: null,  // 👈
  },

  //在页面写在前使用localStorage存储用户输入,现换成leancloud存
  created: function () {
    // onbeforeunload文档：https://developer.mozilla.org/zh-CN/docs/Web/API/Window/onbeforeunload
    window.onbeforeunload = () => {
      let dataString = JSON.stringify(this.todoList)
      // window.localStorage.setItem('myTodos', dataString)
      var AVTodos = AV.Object.extend('AllTodos');
      var avTodos = new AVTodos();
      var acl = new AV.ACL()
      acl.setReadAccess(AV.User.current(), true) // 只有这个 user 能读
      acl.setWriteAccess(AV.User.current(), true) // 只有这个 user 能写

      avTodos.set('content', dataString);
      avTodos.setACL(acl) // 设置访问控制
      avTodos.save().then((todo) => {
        this.todoList.id = todo.id  // 一定要记得把 id 挂到 this.todoList 上，否则下次就不会调用 updateTodos 了
        // 成功保存之后，执行其他逻辑.
        console.log('保存成功');
      }, function (error) {
        // 异常处理
        console.error('保存失败');
      });
      // debugger // 👈
    }

    this.currentUser = this.getCurrentUser();
    // 是不需要 id获取数据,
      this.fetchTodos() // 将原来的一坨代码取一个名字叫做 fetchTodos

    //时间处理
    Date.prototype.format = function () {
      var strArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul ', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var date = this.getDate()
      var month = strArray[this.getMonth()]
      var year = this.getFullYear()
      var hours = this.getHours()
      var minutes = this.getMinutes()
      var seconds = this.getSeconds()
      return '' + (date <= 9 ? '0' + date : date) + '-' + month + '-' + year + ' ' + (hours <= 9 ? '0' + hours : hours) + ':' + (minutes <= 9 ? '0' + minutes : minutes);
    }
  },


  methods: {
    fetchTodos: function(){
       if(this.currentUser){
         var query = new AV.Query('AllTodos');
         query.find()
           .then((todos) => {
             let avAllTodos = todos[0] // 因为理论上 AllTodos 只有一个，所以我们取结果的第一项
             let id = avAllTodos.id
             this.todoList = JSON.parse(avAllTodos.attributes.content) // 为什么有个 attributes？因为我从控制台看到的
             this.todoList.id = id // 为什么给 todoList 这个数组设置 id？因为数组也是对象啊
           }, function(error){
             console.error(error) 
           })
       }
     },
    updateTodos: function () {
      // 想要知道如何更新对象，先看文档 https://leancloud.cn/docs/leanstorage_guide-js.html#更新对象
      let dataString = JSON.stringify(this.todoList) // JSON 在序列化这个有 id 的数组的时候，会得出怎样的结果？
      let avTodos = AV.Object.createWithoutData('AllTodos', this.todoList.id)
      avTodos.set('content', dataString)
      avTodos.save().then(() => {
        console.log('更新成功')
      })
    },
    saveTodos: function () {
      let dataString = JSON.stringify(this.todoList)
      var AVTodos = AV.Object.extend('AllTodos');
      var avTodos = new AVTodos();
      avTodos.set('content', dataString);
      avTodos.save().then(function (todo) {
        console.log('保存成功');
      }, function (error) {
        alert('保存失败');
      });
    },

    saveOrUpdateTodos: function () {
      if (this.todoList.id) {
        this.updateTodos()
      } else {
        this.saveTodos()
      }
    },
    //待办
    addTodo: function () {
      this.todoList.push({
        title: this.newTodo,
        createdAt: new Date().format(),
        done: false // 添加一个 done 属性
      })
      this.newTodo = ''
this.saveOrUpdateTodos() // 不能用 saveTodos 了
    },

    // 加了👇这个函数,删除代办
    removeTodo: function (todo) {
      let index = this.todoList.indexOf(todo) // Array.prototype.indexOf 是 ES 5 新加的 API
      this.todoList.splice(index, 1) // 不懂 splice？赶紧看 MDN 文档！
      this.saveOrUpdateTodos() // 不能用 saveTodos 了
    },

    //注册
    signUp: function () {
      let user = new AV.User();
      user.setUsername(this.formData.username);
      user.setPassword(this.formData.password);
      user.signUp().then((loginedUser) => { // 👈，将 function 改成箭头函数，方便使用 this
        this.currentUser = this.getCurrentUser() // 👈
      }, (error) => {
        alert('注册失败') // 👈
      });
    },
    //登录
    login: function () {
      AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser) => { // 👈
        this.currentUser = this.getCurrentUser() // 👈
        this.fetchTodos() // 登录成功后读取 todos
      }, function (error) {
        alert('登录失败') // 👈
      });
    },
    //
    getCurrentUser: function () { // 👈
      let current = AV.User.current()
      if (current) {
        let { id, createdAt, attributes: { username } } = current
        return { id, username, createdAt }
      } else {
        return null
      }
    },
    //登出,删除currentUser
    logout: function () {
      AV.User.logOut()
      this.currentUser = null
      window.location.reload()
    }


  }//methods
})//new Vue()